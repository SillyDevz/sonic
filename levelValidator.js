// Level Validation System - Prevents common bugs and ensures consistent gameplay

class LevelValidator {
    constructor(levelRules) {
        this.rules = levelRules;
        this.errors = [];
        this.warnings = [];
    }

    // Main validation method
    validateLevel(levelData) {
        this.errors = [];
        this.warnings = [];

        // Validate all level components
        this.validateRings(levelData.rings || []);
        this.validateJumpPads(levelData.jumpPads || []);
        this.validatePlatforms(levelData.platforms || []);
        this.validateEnemies(levelData.enemies || []);
        this.validateCheckpoints(levelData.checkpoints || []);
        this.validateSections(levelData.sections || []);
        
        // Cross-component validation
        this.validateInteractions(levelData);
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            summary: this.generateValidationSummary()
        };
    }

    // Validate ring placement
    validateRings(rings) {
        const rules = this.rules.rings;
        const ringGroups = this.groupRings(rings);

        for (const group of ringGroups) {
            // Check ring spacing
            for (let i = 0; i < group.length - 1; i++) {
                const distance = this.getDistance(group[i], group[i + 1]);
                if (distance < rules.patterns.line.minSpacing) {
                    this.errors.push({
                        type: 'RING_SPACING',
                        message: `Rings too close together at (${group[i].x}, ${group[i].y})`,
                        severity: 'medium',
                        fix: 'Increase spacing between rings'
                    });
                }
            }

            // Check pattern validity
            if (group.length > rules.patterns.line.maxCount) {
                this.warnings.push({
                    type: 'RING_PATTERN',
                    message: `Ring group too large at (${group[0].x}, ${group[0].y})`,
                    severity: 'low',
                    fix: 'Consider breaking into smaller patterns'
                });
            }
        }

        // Check ring heights
        for (const ring of rings) {
            if (ring.y < rules.placement.minHeight) {
                this.errors.push({
                    type: 'RING_HEIGHT',
                    message: `Ring too low at (${ring.x}, ${ring.y})`,
                    severity: 'high',
                    fix: 'Raise ring above minimum height'
                });
            }
            if (ring.y > rules.placement.maxHeight) {
                this.warnings.push({
                    type: 'RING_HEIGHT',
                    message: `Ring too high at (${ring.x}, ${ring.y})`,
                    severity: 'medium',
                    fix: 'Consider lowering ring for accessibility'
                });
            }
        }
    }

    // Validate jump pad placement
    validateJumpPads(jumpPads) {
        const rules = this.rules.jumpPads;

        for (let i = 0; i < jumpPads.length; i++) {
            const pad = jumpPads[i];

            // Validate jump pad type and force
            if (pad.type === 'vertical') {
                if (pad.force < rules.types.vertical.minForce || 
                    pad.force > rules.types.vertical.maxForce) {
                    this.errors.push({
                        type: 'JUMPPAD_FORCE',
                        message: `Invalid vertical force ${pad.force} at (${pad.x}, ${pad.y})`,
                        severity: 'high',
                        fix: `Set force between ${rules.types.vertical.minForce} and ${rules.types.vertical.maxForce}`
                    });
                }
            }

            // Check spacing between jump pads
            for (let j = i + 1; j < jumpPads.length; j++) {
                const distance = this.getDistance(pad, jumpPads[j]);
                if (distance < rules.placement.minSpacing) {
                    this.errors.push({
                        type: 'JUMPPAD_SPACING',
                        message: `Jump pads too close at (${pad.x}, ${pad.y})`,
                        severity: 'medium',
                        fix: 'Increase spacing between jump pads'
                    });
                }
            }

            // Check for consecutive jump pads
            const consecutive = this.countConsecutiveJumpPads(jumpPads, i);
            if (consecutive > rules.placement.maxConsecutive) {
                this.warnings.push({
                    type: 'JUMPPAD_SEQUENCE',
                    message: `Too many consecutive jump pads at (${pad.x}, ${pad.y})`,
                    severity: 'medium',
                    fix: 'Break up jump pad sequences with platforms'
                });
            }
        }
    }

    // Validate platform placement
    validatePlatforms(platforms) {
        const rules = this.rules.platforms;

        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];

            // Validate platform dimensions
            if (platform.width < rules.types[platform.type].minWidth) {
                this.errors.push({
                    type: 'PLATFORM_WIDTH',
                    message: `Platform too narrow at (${platform.x}, ${platform.y})`,
                    severity: 'high',
                    fix: 'Increase platform width for player safety'
                });
            }

            // Validate moving platform paths
            if (platform.type === 'moving') {
                const pathLength = this.calculatePathLength(platform.path);
                if (pathLength < rules.types.moving.minPath) {
                    this.errors.push({
                        type: 'PLATFORM_PATH',
                        message: `Moving platform path too short at (${platform.x}, ${platform.y})`,
                        severity: 'medium',
                        fix: 'Extend platform movement path'
                    });
                }
                if (platform.speed > rules.types.moving.maxSpeed) {
                    this.errors.push({
                        type: 'PLATFORM_SPEED',
                        message: `Moving platform too fast at (${platform.x}, ${platform.y})`,
                        severity: 'high',
                        fix: 'Reduce platform speed for playability'
                    });
                }
            }

            // Check platform gaps
            const nearestPlatform = this.findNearestPlatform(platform, platforms, i);
            if (nearestPlatform) {
                const gap = this.calculateGap(platform, nearestPlatform);
                if (gap > rules.placement.maxGap) {
                    this.errors.push({
                        type: 'PLATFORM_GAP',
                        message: `Gap too large between platforms at (${platform.x}, ${platform.y})`,
                        severity: 'high',
                        fix: 'Add intermediate platform or reduce gap'
                    });
                }
            }
        }
    }

    // Validate enemy placement
    validateEnemies(enemies) {
        const rules = this.rules.enemies;
        const enemyGroups = {};

        // Group enemies by section
        for (const enemy of enemies) {
            const section = Math.floor(enemy.x / 1000);
            if (!enemyGroups[section]) {
                enemyGroups[section] = [];
            }
            enemyGroups[section].push(enemy);
        }

        // Validate enemy density per section
        for (const [section, sectionEnemies] of Object.entries(enemyGroups)) {
            if (sectionEnemies.length > rules.placement.maxPerSection) {
                this.errors.push({
                    type: 'ENEMY_DENSITY',
                    message: `Too many enemies in section ${section}`,
                    severity: 'high',
                    fix: 'Reduce enemy count or spread them out'
                });
            }

            // Check enemy spacing
            for (let i = 0; i < sectionEnemies.length - 1; i++) {
                for (let j = i + 1; j < sectionEnemies.length; j++) {
                    const distance = this.getDistance(sectionEnemies[i], sectionEnemies[j]);
                    if (distance < rules.placement.minSpacing) {
                        this.warnings.push({
                            type: 'ENEMY_SPACING',
                            message: `Enemies too close at (${sectionEnemies[i].x}, ${sectionEnemies[i].y})`,
                            severity: 'medium',
                            fix: 'Increase spacing between enemies'
                        });
                    }
                }
            }
        }

        // Validate enemy types and stats
        for (const enemy of enemies) {
            const typeRules = rules.types[enemy.type];
            if (!typeRules) {
                this.errors.push({
                    type: 'ENEMY_TYPE',
                    message: `Unknown enemy type '${enemy.type}' at (${enemy.x}, ${enemy.y})`,
                    severity: 'critical',
                    fix: 'Use valid enemy type'
                });
                continue;
            }

            // Validate enemy stats
            if (enemy.health < 1) {
                this.errors.push({
                    type: 'ENEMY_HEALTH',
                    message: `Enemy has invalid health at (${enemy.x}, ${enemy.y})`,
                    severity: 'high',
                    fix: 'Set enemy health to at least 1'
                });
            }
        }
    }

    // Validate checkpoint placement
    validateCheckpoints(checkpoints) {
        const rules = this.rules.checkpoints;

        for (let i = 0; i < checkpoints.length - 1; i++) {
            const distance = Math.abs(checkpoints[i + 1].x - checkpoints[i].x);
            if (distance < rules.spacing * 0.5) {
                this.errors.push({
                    type: 'CHECKPOINT_SPACING',
                    message: `Checkpoints too close at (${checkpoints[i].x}, ${checkpoints[i].y})`,
                    severity: 'medium',
                    fix: 'Increase checkpoint spacing'
                });
            }
            if (distance > rules.spacing * 2) {
                this.warnings.push({
                    type: 'CHECKPOINT_SPACING',
                    message: `Large gap between checkpoints at (${checkpoints[i].x}, ${checkpoints[i].y})`,
                    severity: 'medium',
                    fix: 'Consider adding intermediate checkpoint'
                });
            }
        }
    }

    // Validate level sections
    validateSections(sections) {
        const rules = this.rules.sections;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const typeRules = rules.types[section.type];

            if (!typeRules) {
                this.errors.push({
                    type: 'SECTION_TYPE',
                    message: `Unknown section type '${section.type}'`,
                    severity: 'critical',
                    fix: 'Use valid section type'
                });
                continue;
            }

            // Validate section transitions
            if (i > 0) {
                const prevSection = sections[i - 1];
                if (section.start < prevSection.end + rules.transitions.buffer) {
                    this.errors.push({
                        type: 'SECTION_OVERLAP',
                        message: `Section overlap at position ${section.start}`,
                        severity: 'high',
                        fix: 'Add buffer between sections'
                    });
                }
            }
        }
    }

    // Validate interactions between components
    validateInteractions(levelData) {
        // Check if rings are placed on hazards
        for (const ring of levelData.rings || []) {
            for (const enemy of levelData.enemies || []) {
                const distance = this.getDistance(ring, enemy);
                if (distance < this.rules.rings.placement.minDistanceFromHazard) {
                    this.warnings.push({
                        type: 'RING_HAZARD',
                        message: `Ring too close to enemy at (${ring.x}, ${ring.y})`,
                        severity: 'medium',
                        fix: 'Move ring away from hazard'
                    });
                }
            }
        }

        // Check if jump pads lead to safe landing
        for (const jumpPad of levelData.jumpPads || []) {
            const landingPoint = this.calculateLandingPoint(jumpPad);
            const safeLanding = this.checkSafeLanding(landingPoint, levelData.platforms || []);
            
            if (!safeLanding) {
                this.errors.push({
                    type: 'JUMPPAD_LANDING',
                    message: `Jump pad at (${jumpPad.x}, ${jumpPad.y}) has no safe landing`,
                    severity: 'critical',
                    fix: 'Add platform at landing point or adjust jump force'
                });
            }
        }

        // Check platform accessibility
        for (const platform of levelData.platforms || []) {
            const accessible = this.checkPlatformAccessibility(platform, levelData);
            if (!accessible) {
                this.warnings.push({
                    type: 'PLATFORM_ACCESS',
                    message: `Platform at (${platform.x}, ${platform.y}) may be inaccessible`,
                    severity: 'high',
                    fix: 'Add jump pad or intermediate platform'
                });
            }
        }
    }

    // Helper methods
    getDistance(obj1, obj2) {
        return Math.sqrt(Math.pow(obj2.x - obj1.x, 2) + Math.pow(obj2.y - obj1.y, 2));
    }

    groupRings(rings) {
        const groups = [];
        const processed = new Set();

        for (let i = 0; i < rings.length; i++) {
            if (processed.has(i)) continue;

            const group = [rings[i]];
            processed.add(i);

            for (let j = i + 1; j < rings.length; j++) {
                if (processed.has(j)) continue;

                const distance = this.getDistance(rings[i], rings[j]);
                if (distance <= this.rules.rings.patterns.line.maxSpacing * 1.5) {
                    group.push(rings[j]);
                    processed.add(j);
                }
            }

            groups.push(group);
        }

        return groups;
    }

    countConsecutiveJumpPads(jumpPads, startIndex) {
        let count = 1;
        const sequenceSpacing = this.rules.jumpPads.placement.sequenceSpacing;

        for (let i = startIndex + 1; i < jumpPads.length; i++) {
            const distance = this.getDistance(jumpPads[i - 1], jumpPads[i]);
            if (distance <= sequenceSpacing * 1.5) {
                count++;
            } else {
                break;
            }
        }

        return count;
    }

    calculatePathLength(path) {
        if (!path || path.length < 2) return 0;
        
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            length += this.getDistance(path[i - 1], path[i]);
        }
        return length;
    }

    findNearestPlatform(platform, platforms, excludeIndex) {
        let nearest = null;
        let minDistance = Infinity;

        for (let i = 0; i < platforms.length; i++) {
            if (i === excludeIndex) continue;
            
            const distance = this.getDistance(platform, platforms[i]);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = platforms[i];
            }
        }

        return nearest;
    }

    calculateGap(platform1, platform2) {
        const p1Right = platform1.x + platform1.width / 2;
        const p1Left = platform1.x - platform1.width / 2;
        const p2Right = platform2.x + platform2.width / 2;
        const p2Left = platform2.x - platform2.width / 2;

        // Horizontal gap
        const horizontalGap = Math.max(0, p2Left - p1Right, p1Left - p2Right);
        
        // Vertical gap
        const verticalGap = Math.abs(platform2.y - platform1.y);

        return Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap);
    }

    calculateLandingPoint(jumpPad) {
        // Simplified physics calculation
        const gravity = 0.5;
        const vx = jumpPad.forceX || 0;
        const vy = jumpPad.forceY || jumpPad.force || 0;
        
        // Time to reach ground (simplified)
        const time = (2 * vy) / gravity;
        
        return {
            x: jumpPad.x + vx * time,
            y: jumpPad.y
        };
    }

    checkSafeLanding(point, platforms) {
        const landingMargin = 50;
        
        for (const platform of platforms) {
            const onPlatform = point.x >= platform.x - platform.width / 2 - landingMargin &&
                             point.x <= platform.x + platform.width / 2 + landingMargin &&
                             Math.abs(point.y - platform.y) < 100;
            
            if (onPlatform) return true;
        }
        
        return false;
    }

    checkPlatformAccessibility(platform, levelData) {
        // Check if platform can be reached from ground or other platforms
        const jumpHeight = 300; // Maximum jump height
        
        // Check ground access
        if (platform.y <= jumpHeight) return true;
        
        // Check access from other platforms
        for (const otherPlatform of levelData.platforms || []) {
            if (otherPlatform === platform) continue;
            
            const gap = this.calculateGap(platform, otherPlatform);
            const heightDiff = Math.abs(platform.y - otherPlatform.y);
            
            if (gap < this.rules.platforms.placement.maxGap && heightDiff < jumpHeight) {
                return true;
            }
        }
        
        // Check jump pad access
        for (const jumpPad of levelData.jumpPads || []) {
            const landingPoint = this.calculateLandingPoint(jumpPad);
            const distance = this.getDistance(landingPoint, platform);
            
            if (distance < platform.width) return true;
        }
        
        return false;
    }

    generateValidationSummary() {
        const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
        const highErrors = this.errors.filter(e => e.severity === 'high').length;
        const mediumErrors = this.errors.filter(e => e.severity === 'medium').length;
        
        return {
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length,
            criticalErrors,
            highErrors,
            mediumErrors,
            canProceed: criticalErrors === 0,
            recommendation: this.getRecommendation()
        };
    }

    getRecommendation() {
        const critical = this.errors.filter(e => e.severity === 'critical').length;
        const high = this.errors.filter(e => e.severity === 'high').length;
        
        if (critical > 0) {
            return 'Fix critical errors before proceeding - level may be unplayable';
        } else if (high > 5) {
            return 'Many high-severity issues found - level needs significant adjustments';
        } else if (high > 0) {
            return 'Some important issues to address for better gameplay';
        } else if (this.errors.length > 0) {
            return 'Minor issues found - consider fixing for optimal experience';
        } else if (this.warnings.length > 0) {
            return 'Level is valid with some warnings - review for improvements';
        } else {
            return 'Level passes all validation checks!';
        }
    }
}

// Export for use in main game
// Browser doesn't use CommonJS, so just make it global
window.LevelValidator = LevelValidator;