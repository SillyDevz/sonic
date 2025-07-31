// Level Generation System using defined rules
// This generates consistent, bug-free levels based on the levelRules configuration

class LevelGeneratorSystem {
    constructor(levelRules, validator) {
        this.rules = levelRules;
        this.validator = validator;
        this.currentLevel = 1;
        this.seed = Date.now();
    }

    // Generate a complete level
    generateLevel(levelNumber, options = {}) {
        this.currentLevel = levelNumber;
        let levelData = {
            number: levelNumber,
            length: options.length || 10000,
            difficulty: this.getDifficultyForLevel(levelNumber),
            sections: [],
            platforms: [],
            enemies: [],
            rings: [],
            jumpPads: [],
            checkpoints: [],
            powerups: []
        };

        // Generate level sections
        levelData.sections = this.generateSections(levelData.length);
        
        // Generate checkpoints first (they affect other placements)
        levelData.checkpoints = this.generateCheckpoints(levelData.length);
        
        // Generate platforms based on sections
        for (const section of levelData.sections) {
            const sectionPlatforms = this.generatePlatformsForSection(section, levelData.difficulty);
            levelData.platforms.push(...sectionPlatforms);
        }
        
        // Generate enemies based on sections and platforms
        for (const section of levelData.sections) {
            const sectionEnemies = this.generateEnemiesForSection(section, levelData);
            levelData.enemies.push(...sectionEnemies);
        }
        
        // Generate rings based on sections and platforms
        for (const section of levelData.sections) {
            const sectionRings = this.generateRingsForSection(section, levelData);
            levelData.rings.push(...sectionRings);
        }
        
        // Generate jump pads to connect platforms
        levelData.jumpPads = this.generateJumpPads(levelData);
        
        // Validate the generated level
        const validation = this.validator.validateLevel(levelData);
        
        // Fix critical errors if any
        if (!validation.isValid) {
            levelData = this.fixValidationErrors(levelData, validation);
        }
        
        return {
            levelData,
            validation,
            metadata: {
                generatedAt: Date.now(),
                seed: this.seed,
                rulesVersion: '1.0.0'
            }
        };
    }

    // Generate level sections
    generateSections(levelLength) {
        const sections = [];
        const sectionTypes = Object.keys(this.rules.sections.types);
        let currentPosition = 200; // Start after spawn area (player spawns at x=100)
        const endBuffer = 400; // Keep last 400 units clear for the goal
        
        while (currentPosition < levelLength - endBuffer) {
            // Choose section type based on position and variety
            const sectionType = this.chooseSectionType(currentPosition, sections);
            const sectionRules = this.rules.sections.types[sectionType];
            const sectionLength = sectionRules.length;
            
            // Don't exceed level bounds minus end buffer
            const sectionEnd = Math.min(currentPosition + sectionLength, levelLength - endBuffer);
            
            sections.push({
                type: sectionType,
                start: currentPosition,
                end: sectionEnd,
                rules: sectionRules
            });
            
            currentPosition = sectionEnd + this.rules.sections.transitions.buffer;
        }
        
        return sections;
    }

    // Choose appropriate section type
    chooseSectionType(position, previousSections) {
        const lastSection = previousSections[previousSections.length - 1];
        
        // Start with speed section (less enemies)
        if (position === 0) return 'speedSection';
        
        // Second section should be platform-focused
        if (previousSections.length === 1) return 'platformSection';
        
        // Ensure variety
        if (lastSection) {
            switch (lastSection.type) {
                case 'speedSection':
                    return Math.random() > 0.5 ? 'platformSection' : 'combatSection';
                case 'platformSection':
                    return Math.random() > 0.7 ? 'bonusSection' : 'combatSection';
                case 'combatSection':
                    return Math.random() > 0.6 ? 'speedSection' : 'platformSection';
                case 'bonusSection':
                    return 'speedSection';
                default:
                    return 'speedSection';
            }
        }
        
        return 'speedSection';
    }

    // Generate checkpoints
    generateCheckpoints(levelLength) {
        const checkpoints = [];
        const spacing = this.rules.checkpoints.spacing;
        const groundHeight = this.rules.constants.groundHeight;
        const endBuffer = 400; // Don't place checkpoints too close to the end
        
        for (let x = spacing; x < levelLength - endBuffer; x += spacing) {
            checkpoints.push({
                x: x,
                y: groundHeight - 80, // Checkpoint height above ground
                id: `checkpoint_${checkpoints.length}`,
                activated: false
            });
        }
        
        return checkpoints;
    }

    // Generate platforms for a section
    generatePlatformsForSection(section, difficulty) {
        const platforms = [];
        const sectionRules = section.rules;
        const platformDensity = sectionRules.platformDensity || 0.5;
        const sectionLength = section.end - section.start;
        
        // Calculate platform count based on section length and density
        const platformCount = Math.floor(sectionLength / 200 * platformDensity); // One platform per 200 units at density 1.0
        
        // Create platforms with better spacing
        for (let i = 0; i < platformCount; i++) {
            // Try to space platforms evenly across the section
            const targetX = section.start + (i + 1) * (sectionLength / (platformCount + 1));
            
            const platform = this.createPlatformAt(targetX, section, difficulty, platforms);
            if (platform) {
                platforms.push(platform);
            }
        }
        
        return platforms;
    }
    
    // Create platform at specific target X position
    createPlatformAt(targetX, section, difficulty, existingPlatforms) {
        const difficultyConfig = this.rules.platforms.difficulty[difficulty];
        
        // Choose platform type based on section
        let type = 'static';
        if (section.type === 'platformSection' && Math.random() < 0.3) {
            type = Math.random() < 0.5 ? 'moving' : 'crumbling';
        }
        
        const typeRules = this.rules.platforms.types[type];
        const groundHeight = this.rules.constants.groundHeight;
        
        // Add some randomness to X position but keep it near target
        const x = targetX + (Math.random() - 0.5) * 100;
        
        // Don't create platforms behind spawn point
        if (x < 150) return null;
        
        // Create varied but sensible heights
        const baseHeight = 100; // Base height above ground
        const heightVariation = Math.sin(x / 300) * 80; // Wave pattern for height
        const randomHeight = (Math.random() - 0.5) * 60; // Some randomness
        const y = groundHeight - baseHeight - heightVariation - randomHeight;
        
        // Calculate dimensions
        const width = typeRules.minWidth + 
                     Math.random() * (typeRules.maxWidth - typeRules.minWidth);
        const width_adjusted = width * difficultyConfig.widthMultiplier;
        
        // Validate position
        if (!this.validatePlatformPosition(x, y, width_adjusted, existingPlatforms)) {
            return null;
        }
        
        const platform = {
            type: type,
            x: x,
            y: y,
            width: width_adjusted,
            height: typeRules.height || 20,
            id: `platform_${Date.now()}_${Math.random()}`
        };
        
        // Add type-specific properties (same as before)
        switch (type) {
            case 'moving':
                platform.speed = (typeRules.minSpeed + 
                                Math.random() * (typeRules.maxSpeed - typeRules.minSpeed)) * 
                                difficultyConfig.speedMultiplier;
                platform.path = this.generatePlatformPath(x, y, typeRules);
                platform.currentPathIndex = 0;
                platform.direction = 1;
                break;
                
            case 'crumbling':
                platform.stability = typeRules.stability;
                platform.respawnTime = typeRules.respawnTime;
                platform.isStable = true;
                platform.touchTime = 0;
                break;
        }
        
        return platform;
    }


    // Validate platform position
    validatePlatformPosition(x, y, width, existingPlatforms) {
        for (const platform of existingPlatforms) {
            // Check horizontal distance
            const horizontalDistance = Math.abs(x - platform.x);
            const minHorizontalDistance = (width + platform.width) / 2 + 50; // Reasonable buffer
            
            // Check vertical distance
            const verticalDistance = Math.abs(y - platform.y);
            
            // Only prevent if platforms would actually overlap
            if (horizontalDistance < minHorizontalDistance && verticalDistance < 40) {
                return false;
            }
            
            // Prevent direct vertical stacking
            if (horizontalDistance < 80 && verticalDistance < 60) {
                return false;
            }
        }
        return true;
    }

    // Generate platform movement path
    generatePlatformPath(x, y, typeRules) {
        const pathType = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const pathLength = typeRules.minPath + 
                         Math.random() * (typeRules.maxPath - typeRules.minPath);
        
        if (pathType === 'horizontal') {
            return [
                { x: x - pathLength / 2, y: y },
                { x: x + pathLength / 2, y: y }
            ];
        } else {
            return [
                { x: x, y: y - pathLength / 2 },
                { x: x, y: y + pathLength / 2 }
            ];
        }
    }

    // Generate enemies for a section
    generateEnemiesForSection(section, levelData) {
        const enemies = [];
        const sectionRules = section.rules;
        const enemyDensity = sectionRules.enemyDensity || 0.5;
        const enemyCount = Math.floor((section.end - section.start) / 150 * enemyDensity); // Changed from 500 to 150 for many more enemies
        
        // Get available enemy types for current level
        const availableTypes = this.getAvailableEnemyTypes();
        
        for (let i = 0; i < enemyCount; i++) {
            // Sometimes create groups of enemies
            if (Math.random() < 0.4 && i < enemyCount - 2) { // 40% chance for groups
                const groupSize = Math.min(3, enemyCount - i);
                const groupX = section.start + Math.random() * (section.end - section.start);
                
                for (let j = 0; j < groupSize; j++) {
                    const enemyX = groupX + j * this.rules.enemies.placement.grouping.groupSpacing;
                    const enemy = this.createEnemy(section, availableTypes, levelData, enemies, enemyX);
                    if (enemy) {
                        enemies.push(enemy);
                    }
                }
                i += groupSize - 1; // Skip ahead
            } else {
                const enemy = this.createEnemy(section, availableTypes, levelData, enemies);
                if (enemy) {
                    enemies.push(enemy);
                }
            }
        }
        
        return enemies;
    }

    // Get enemy types available at current level
    getAvailableEnemyTypes() {
        const types = [];
        const progression = this.rules.progression.levels;
        
        for (let level = 1; level <= this.currentLevel; level++) {
            if (progression[level] && progression[level].newEnemyTypes) {
                types.push(...progression[level].newEnemyTypes);
            }
        }
        
        return types.length > 0 ? types : ['basic'];
    }

    // Create a single enemy
    createEnemy(section, availableTypes, levelData, existingEnemies, overrideX = null) {
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const typeRules = this.rules.enemies.types[type];
        const placementRules = this.rules.enemies.placement;
        
        // Calculate position
        const x = overrideX || (section.start + Math.random() * (section.end - section.start));
        const groundHeight = this.rules.constants.groundHeight;
        let y = groundHeight - 30; // Default ground level (enemy height)
        
        // Flying enemies spawn higher
        if (type === 'flying') {
            y = groundHeight - typeRules.hoverHeight;
        }
        
        // Find platform to place enemy on (except flying enemies)
        if (type !== 'flying') {
            const platform = this.findPlatformBelow(x, y, levelData.platforms);
            if (platform) {
                // Place enemy on the platform
                y = platform.y - 30;
            } else {
                // No platform found, place on ground
                y = groundHeight - 30;
            }
        }
        
        // Validate enemy placement
        const validPosition = this.validateEnemyPosition(x, y, existingEnemies, levelData.checkpoints);
        if (!validPosition) return null;
        
        // Apply difficulty scaling
        const difficultyMultiplier = this.rules.progression.levels[this.currentLevel].multiplier;
        
        const enemy = {
            type: type,
            x: x,
            y: y,
            health: Math.ceil(typeRules.health * difficultyMultiplier),
            maxHealth: Math.ceil(typeRules.health * difficultyMultiplier),
            speed: typeRules.speed * this.rules.progression.scaling.enemySpeed,
            damage: Math.ceil(typeRules.damage * this.rules.progression.scaling.enemyDamage),
            points: typeRules.points,
            detectionRange: typeRules.detectionRange,
            id: `enemy_${Date.now()}_${Math.random()}`,
            state: 'patrol',
            direction: Math.random() > 0.5 ? 1 : -1
        };
        
        // Add type-specific properties
        switch (type) {
            case 'flying':
                enemy.baseY = y;
                enemy.amplitude = 50;
                enemy.frequency = 0.002;
                enemy.patrolRadius = typeRules.patrolRadius;
                break;
                
            case 'shielded':
                enemy.hasShield = true;
                enemy.shieldHealth = 2;
                enemy.shieldRegenTimer = 0;
                break;
                
            case 'projectile':
                enemy.fireTimer = 0;
                enemy.fireRate = typeRules.fireRate;
                enemy.projectiles = [];
                break;
        }
        
        return enemy;
    }

    // Validate enemy position
    validateEnemyPosition(x, y, existingEnemies, checkpoints) {
        // Check spawn protection (player starts at x=100)
        const spawnX = 100;
        const spawnProtectionRadius = this.rules.enemies.placement.spawnProtectionRadius;
        const distanceFromSpawn = Math.abs(x - spawnX);
        
        if (distanceFromSpawn < spawnProtectionRadius) {
            return false; // Too close to spawn point
        }
        
        // Check distance from other enemies
        for (const enemy of existingEnemies) {
            const distance = Math.sqrt(Math.pow(x - enemy.x, 2) + Math.pow(y - enemy.y, 2));
            if (distance < this.rules.enemies.placement.minSpacing) {
                return false;
            }
        }
        
        // Check safe zones around checkpoints
        for (const checkpoint of checkpoints) {
            const distance = Math.sqrt(Math.pow(x - checkpoint.x, 2) + Math.pow(y - checkpoint.y, 2));
            if (distance < this.rules.enemies.placement.safeZoneRadius) {
                return false;
            }
        }
        
        return true;
    }

    // Generate rings for a section
    generateRingsForSection(section, levelData) {
        const rings = [];
        const sectionRules = section.rules;
        const ringDensity = sectionRules.ringDensity || 0.5;
        const patternCount = Math.floor((section.end - section.start) / 300 * ringDensity); // Balanced ring patterns
        
        for (let i = 0; i < patternCount; i++) {
            const pattern = this.createRingPattern(section, levelData, rings);
            if (pattern) {
                rings.push(...pattern);
            }
        }
        
        // Add special rings based on section type
        if (section.type === 'bonusSection' || sectionRules.specialRings) {
            const specialRings = this.createSpecialRings(section, rings);
            rings.push(...specialRings);
        }
        
        return rings;
    }

    // Create a ring pattern
    createRingPattern(section, levelData, existingRings) {
        const patternTypes = ['line', 'arc', 'circle'];
        const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        
        // Calculate base position
        const x = section.start + Math.random() * (section.end - section.start - 200);
        const groundHeight = this.rules.constants.groundHeight;
        
        // Find platform at this x position
        const platformAtX = this.findPlatformAt(x, levelData.platforms);
        let y;
        
        if (platformAtX) {
            // Place rings above the platform, not inside it
            const ringHeight = 30 + Math.random() * 80; // 30-110 pixels above platform
            y = platformAtX.y - platformAtX.height - ringHeight;
        } else {
            // No platform here - place at jumpable height from ground
            const heightAboveGround = 50 + Math.random() * 100; // 50-150 pixels above ground
            y = groundHeight - heightAboveGround;
        }
        
        // Ensure y is within screen bounds (canvas height is 400)
        y = Math.max(y, 80); // Keep at least 80 pixels from top
        y = Math.min(y, groundHeight - 50); // Keep at least 50 pixels above ground
        
        // Generate pattern
        const pattern = this.generateRingPattern(patternType, x, y);
        
        // Filter out invalid rings instead of rejecting entire pattern
        const validRings = pattern.filter(ring => 
            this.validateRingPosition(ring, levelData.enemies, existingRings) &&
            !this.isInsidePlatform(ring, levelData.platforms)
        );
        
        return validRings.length > 0 ? validRings : null;
    }

    // Generate specific ring pattern
    generateRingPattern(type, x, y, config = {}) {
        const rings = [];
        const rules = this.rules.rings.patterns[type];
        
        switch(type) {
            case 'line':
                const count = config.count || Math.floor(Math.random() * 
                    (rules.maxCount - rules.minCount + 1)) + rules.minCount;
                const spacing = config.spacing || Math.floor(Math.random() * 
                    (rules.maxSpacing - rules.minSpacing + 1)) + rules.minSpacing;
                const angle = config.angle || 0;
                
                for (let i = 0; i < count; i++) {
                    rings.push({
                        x: x + (i * spacing) * Math.cos(angle),
                        y: y + (i * spacing) * Math.sin(angle),
                        type: 'normal',
                        collected: false,
                        id: `ring_${Date.now()}_${i}`
                    });
                }
                break;
                
            case 'arc':
                const arcCount = config.count || Math.floor(Math.random() * 
                    (rules.maxCount - rules.minCount + 1)) + rules.minCount;
                const radius = config.radius || Math.floor(Math.random() * 
                    (rules.maxRadius - rules.minRadius + 1)) + rules.minRadius;
                
                // Ensure arc doesn't go too high
                const maxArcHeight = 120; // Maximum height above starting point
                const adjustedRadius = Math.min(radius, maxArcHeight);
                
                for (let i = 0; i < arcCount; i++) {
                    const angle = (Math.PI / arcCount) * i;
                    rings.push({
                        x: x + Math.cos(angle) * adjustedRadius,
                        y: y - Math.sin(angle) * adjustedRadius,
                        type: 'normal',
                        collected: false,
                        id: `ring_${Date.now()}_${i}`
                    });
                }
                break;
                
            case 'circle':
                const circleRadius = config.radius || Math.floor(Math.random() * 
                    (rules.maxRadius - rules.minRadius + 1)) + rules.minRadius;
                
                // Ensure circle is small enough to be reachable
                const maxCircleRadius = 80;
                const adjustedCircleRadius = Math.min(circleRadius, maxCircleRadius);
                
                for (let i = 0; i < rules.ringCount; i++) {
                    const angle = (2 * Math.PI / rules.ringCount) * i;
                    const ringX = x + Math.cos(angle) * adjustedCircleRadius;
                    const ringY = y + Math.sin(angle) * adjustedCircleRadius;
                    
                    // Skip rings that would be below ground
                    if (ringY < this.rules.constants.groundHeight - 20) {
                        rings.push({
                            x: ringX,
                            y: ringY,
                            type: 'normal',
                            collected: false,
                            id: `ring_${Date.now()}_${i}`
                        });
                    }
                }
                break;
        }
        
        return rings;
    }

    // Create special rings
    createSpecialRings(section, existingRings) {
        const specialRings = [];
        const specialRules = this.rules.rings.special;
        const groundHeight = this.rules.constants.groundHeight;
        
        // Super rings
        if (Math.random() < specialRules.superRing.spawnChance) {
            const x = section.start + Math.random() * (section.end - section.start);
            const heightAboveGround = 50 + Math.random() * 150;
            const y = groundHeight - heightAboveGround;
            
            specialRings.push({
                x: x,
                y: y,
                type: 'super',
                value: specialRules.superRing.value,
                glowRadius: specialRules.superRing.glowRadius,
                collected: false,
                id: `superring_${Date.now()}`
            });
        }
        
        // Magnet rings
        if (Math.random() < specialRules.magnetRing.spawnChance) {
            const x = section.start + Math.random() * (section.end - section.start);
            const heightAboveGround = 50 + Math.random() * 150;
            const y = groundHeight - heightAboveGround;
            
            specialRings.push({
                x: x,
                y: y,
                type: 'magnet',
                value: specialRules.magnetRing.value,
                magnetRadius: specialRules.magnetRing.magnetRadius,
                collected: false,
                id: `magnetring_${Date.now()}`
            });
        }
        
        return specialRings;
    }

    // Validate ring position
    validateRingPosition(ring, enemies, existingRings) {
        // Check distance from enemies
        for (const enemy of enemies) {
            const distance = Math.sqrt(Math.pow(ring.x - enemy.x, 2) + Math.pow(ring.y - enemy.y, 2));
            if (distance < this.rules.rings.placement.minDistanceFromHazard) {
                return false;
            }
        }
        
        // Check overlap with existing rings
        for (const existingRing of existingRings) {
            const distance = Math.sqrt(Math.pow(ring.x - existingRing.x, 2) + 
                                     Math.pow(ring.y - existingRing.y, 2));
            if (distance < 20) { // Minimum ring spacing
                return false;
            }
        }
        
        return true;
    }

    // Generate jump pads
    generateJumpPads(levelData) {
        const jumpPads = [];
        const placementRules = this.rules.jumpPads.placement;
        const groundHeight = this.rules.constants.groundHeight;
        
        // First, generate jump pads based on section density settings
        for (const section of levelData.sections) {
            const sectionJumpPads = this.generateJumpPadsForSection(section, levelData, jumpPads);
            jumpPads.push(...sectionJumpPads);
        }
        
        // Then analyze platform gaps and heights for additional strategic jump pads
        const platformGaps = this.analyzePlatformGaps(levelData.platforms);
        
        for (const gap of platformGaps) {
            if (gap.distance > this.rules.platforms.placement.maxGap * 0.8) {
                // Need a jump pad to bridge this gap
                const jumpPad = this.createJumpPadForGap(gap, levelData);
                if (jumpPad && this.validateJumpPadPosition(jumpPad, jumpPads)) {
                    // Ensure jump pad is not floating
                    const platformBelow = this.findPlatformBelow(jumpPad.x, jumpPad.y + 20, levelData.platforms);
                    if (!platformBelow) {
                        // No platform below, place on ground
                        jumpPad.y = groundHeight - jumpPad.height;
                    }
                    jumpPads.push(jumpPad);
                }
            }
        }
        
        // Add additional jump pads for vertical sections
        const verticalSections = this.findVerticalSections(levelData.platforms);
        for (const section of verticalSections) {
            const jumpPad = this.createVerticalJumpPad(section, jumpPads);
            if (jumpPad) {
                jumpPads.push(jumpPad);
            }
        }
        
        return jumpPads;
    }

    // Generate jump pads for a section based on density
    generateJumpPadsForSection(section, levelData, existingJumpPads) {
        const jumpPads = [];
        const sectionRules = section.rules;
        const jumpPadDensity = sectionRules.jumpPadDensity || 0.3;
        const sectionLength = section.end - section.start;
        const groundHeight = this.rules.constants.groundHeight;
        
        // Calculate jump pad count based on density
        const jumpPadCount = Math.floor(sectionLength / 800 * jumpPadDensity); // One jump pad per 800 units at density 1.0
        
        for (let i = 0; i < jumpPadCount; i++) {
            const x = section.start + Math.random() * sectionLength;
            
            // Determine type based on section and randomness
            let type = 'vertical';
            if (section.type === 'speedSection') {
                type = Math.random() < 0.7 ? 'horizontal' : 'diagonal';
            } else if (section.type === 'platformSection') {
                type = Math.random() < 0.6 ? 'vertical' : 'diagonal';
            }
            
            const typeRules = this.rules.jumpPads.types[type];
            
            // Find platform to place jump pad on
            const platformBelow = this.findPlatformBelow(x, groundHeight, levelData.platforms);
            let y;
            
            if (platformBelow) {
                y = platformBelow.y - typeRules.height;
            } else {
                y = groundHeight - typeRules.height;
            }
            
            // Create jump pad
            const jumpPad = {
                type: type,
                x: x,
                y: y,
                width: typeRules.width,
                height: typeRules.height,
                cooldown: typeRules.cooldown,
                active: true,
                id: `jumppad_${Date.now()}_${i}`
            };
            
            // Set forces based on type
            switch (type) {
                case 'vertical':
                    jumpPad.force = typeRules.minForce + Math.random() * (typeRules.maxForce - typeRules.minForce);
                    jumpPad.forceX = 0;
                    jumpPad.forceY = jumpPad.force;
                    break;
                case 'horizontal':
                    jumpPad.force = typeRules.minForce + Math.random() * (typeRules.maxForce - typeRules.minForce);
                    jumpPad.forceX = jumpPad.force * (Math.random() < 0.5 ? 1 : -1);
                    jumpPad.forceY = 5; // Small upward boost
                    break;
                case 'diagonal':
                    jumpPad.forceX = typeRules.minForceX + Math.random() * (typeRules.maxForceX - typeRules.minForceX);
                    jumpPad.forceY = typeRules.minForceY + Math.random() * (typeRules.maxForceY - typeRules.minForceY);
                    jumpPad.force = jumpPad.forceY;
                    jumpPad.forceX *= (Math.random() < 0.5 ? 1 : -1);
                    break;
            }
            
            // Validate position
            if (this.validateJumpPadPosition(jumpPad, [...existingJumpPads, ...jumpPads])) {
                jumpPads.push(jumpPad);
            }
        }
        
        return jumpPads;
    }
    
    // Validate jump pad position
    validateJumpPadPosition(jumpPad, existingJumpPads) {
        const minSpacing = this.rules.jumpPads.placement.minSpacing;
        
        for (const existing of existingJumpPads) {
            const distance = Math.sqrt(Math.pow(jumpPad.x - existing.x, 2) + 
                                     Math.pow(jumpPad.y - existing.y, 2));
            if (distance < minSpacing) {
                return false;
            }
        }
        
        return true;
    }

    // Analyze gaps between platforms
    analyzePlatformGaps(platforms) {
        const gaps = [];
        const sortedPlatforms = [...platforms].sort((a, b) => a.x - b.x);
        
        for (let i = 0; i < sortedPlatforms.length - 1; i++) {
            const current = sortedPlatforms[i];
            const next = sortedPlatforms[i + 1];
            
            const horizontalGap = next.x - next.width/2 - (current.x + current.width/2);
            const verticalGap = Math.abs(next.y - current.y);
            const distance = Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap);
            
            gaps.push({
                from: current,
                to: next,
                distance: distance,
                horizontal: horizontalGap,
                vertical: verticalGap
            });
        }
        
        return gaps;
    }

    // Create jump pad for a specific gap
    createJumpPadForGap(gap, levelData) {
        const typeRules = this.rules.jumpPads.types;
        let type, forceX, forceY;
        
        // Determine jump pad type based on gap characteristics
        if (gap.vertical > gap.horizontal * 2) {
            type = 'vertical';
            forceX = 0;
            forceY = this.calculateRequiredForce(gap.vertical, typeRules.vertical);
        } else if (gap.horizontal > gap.vertical * 2) {
            type = 'horizontal';
            forceX = this.calculateRequiredForce(gap.horizontal, typeRules.horizontal);
            forceY = 5; // Small upward boost
        } else {
            type = 'diagonal';
            forceX = this.calculateRequiredForce(gap.horizontal, typeRules.diagonal);
            forceY = this.calculateRequiredForce(gap.vertical, typeRules.diagonal);
        }
        
        // Position jump pad at edge of first platform
        const x = gap.from.x + gap.from.width/2 - 40;
        const y = gap.from.y - typeRules[type].height; // Place on top of platform with proper height
        
        return {
            type: type,
            x: x,
            y: y,
            width: typeRules[type].width,
            height: typeRules[type].height,
            forceX: forceX,
            forceY: forceY,
            force: forceY, // For vertical pads
            cooldown: typeRules[type].cooldown,
            active: true,
            id: `jumppad_${Date.now()}`
        };
    }

    // Calculate required force for jump
    calculateRequiredForce(distance, typeRules) {
        // Simple physics calculation (would need adjustment based on game physics)
        const requiredForce = Math.sqrt(distance * 0.5) * 2;
        return Math.max(typeRules.minForce || typeRules.minForceY || 10,
                       Math.min(requiredForce, typeRules.maxForce || typeRules.maxForceY || 30));
    }

    // Find vertical platform sections
    findVerticalSections(platforms) {
        const sections = [];
        const verticalThreshold = 100;
        
        for (let i = 0; i < platforms.length - 1; i++) {
            if (Math.abs(platforms[i].y - platforms[i + 1].y) > verticalThreshold) {
                sections.push({
                    lower: platforms[i].y > platforms[i + 1].y ? platforms[i + 1] : platforms[i],
                    upper: platforms[i].y > platforms[i + 1].y ? platforms[i] : platforms[i + 1]
                });
            }
        }
        
        return sections;
    }

    // Create vertical jump pad
    createVerticalJumpPad(section, existingPads) {
        const typeRules = this.rules.jumpPads.types.vertical;
        const x = section.lower.x;
        const y = section.lower.y - typeRules.height; // Place on top of platform with proper height
        
        // Check if jump pad already exists nearby
        for (const pad of existingPads) {
            const distance = Math.sqrt(Math.pow(x - pad.x, 2) + Math.pow(y - pad.y, 2));
            if (distance < this.rules.jumpPads.placement.minSpacing) {
                return null;
            }
        }
        
        return {
            type: 'vertical',
            x: x,
            y: y,
            width: typeRules.width,
            height: typeRules.height,
            force: typeRules.maxForce * 0.8,
            forceX: 0,
            forceY: typeRules.maxForce * 0.8,
            cooldown: typeRules.cooldown,
            active: true,
            id: `jumppad_vertical_${Date.now()}`
        };
    }

    // Fix validation errors
    fixValidationErrors(levelData, validation) {
        for (const error of validation.errors) {
            switch (error.type) {
                case 'RING_SPACING':
                    this.fixRingSpacing(levelData.rings);
                    break;
                case 'PLATFORM_GAP':
                    this.addIntermediatePlatform(levelData, error);
                    break;
                case 'JUMPPAD_LANDING':
                    this.fixJumpPadLanding(levelData, error);
                    break;
                case 'ENEMY_DENSITY':
                    this.reduceEnemyDensity(levelData, error);
                    break;
            }
        }
        
        return levelData;
    }

    // Helper methods for fixing errors
    fixRingSpacing(rings) {
        const minSpacing = this.rules.rings.patterns.line.minSpacing;
        
        for (let i = 0; i < rings.length - 1; i++) {
            for (let j = i + 1; j < rings.length; j++) {
                const distance = Math.sqrt(Math.pow(rings[j].x - rings[i].x, 2) + 
                                         Math.pow(rings[j].y - rings[i].y, 2));
                if (distance < minSpacing) {
                    // Move second ring away
                    const angle = Math.atan2(rings[j].y - rings[i].y, rings[j].x - rings[i].x);
                    rings[j].x = rings[i].x + Math.cos(angle) * minSpacing;
                    rings[j].y = rings[i].y + Math.sin(angle) * minSpacing;
                }
            }
        }
    }

    addIntermediatePlatform(levelData, error) {
        // Parse error message to find gap location
        // Add a platform to bridge the gap
        const x = error.x || 0;
        const y = error.y || 300;
        
        levelData.platforms.push({
            type: 'static',
            x: x,
            y: y,
            width: 150,
            height: 20,
            id: `platform_fix_${Date.now()}`
        });
    }

    fixJumpPadLanding(levelData, error) {
        // Add a platform at the landing point
        const jumpPad = levelData.jumpPads.find(pad => 
            pad.x === error.x && pad.y === error.y
        );
        
        if (jumpPad) {
            const landingPoint = this.calculateLandingPoint(jumpPad);
            levelData.platforms.push({
                type: 'static',
                x: landingPoint.x,
                y: landingPoint.y + 50,
                width: 200,
                height: 20,
                id: `platform_landing_${Date.now()}`
            });
        }
    }

    reduceEnemyDensity(levelData, error) {
        const section = parseInt(error.section);
        const sectionStart = section * 1000;
        const sectionEnd = (section + 1) * 1000;
        
        // Remove some enemies from the section
        const sectionEnemies = levelData.enemies.filter(enemy => 
            enemy.x >= sectionStart && enemy.x < sectionEnd
        );
        
        const toRemove = sectionEnemies.length - this.rules.enemies.placement.maxPerSection;
        for (let i = 0; i < toRemove; i++) {
            const index = levelData.enemies.indexOf(sectionEnemies[i]);
            if (index !== -1) {
                levelData.enemies.splice(index, 1);
            }
        }
    }

    // Helper methods
    getDifficultyForLevel(level) {
        if (level <= 3) return 'easy';
        if (level <= 6) return 'medium';
        return 'hard';
    }

    findNearestPlatform(x, y, platforms) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const platform of platforms) {
            const distance = Math.sqrt(Math.pow(x - platform.x, 2) + Math.pow(y - platform.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = platform;
            }
        }
        
        return nearest;
    }
    
    findPlatformBelow(x, y, platforms) {
        let bestPlatform = null;
        let minYDistance = Infinity;
        
        for (const platform of platforms) {
            // Check if x position is within platform bounds (with some margin)
            const margin = 30; // Allow some overhang
            const onPlatform = x >= platform.x - platform.width/2 - margin && 
                              x <= platform.x + platform.width/2 + margin;
            
            // Platform must be below the y position but not too far
            if (onPlatform && platform.y >= y && platform.y < y + 300) {
                const yDistance = platform.y - y;
                if (yDistance < minYDistance) {
                    minYDistance = yDistance;
                    bestPlatform = platform;
                }
            }
        }
        
        return bestPlatform;
    }
    
    findPlatformAt(x, platforms) {
        // Find any platform at this x position
        for (const platform of platforms) {
            const onPlatform = x >= platform.x - platform.width/2 && 
                              x <= platform.x + platform.width/2;
            if (onPlatform) {
                return platform;
            }
        }
        return null;
    }
    
    isInsidePlatform(ring, platforms) {
        const ringRadius = 10; // Ring collision radius
        
        for (const platform of platforms) {
            const leftEdge = platform.x - platform.width/2;
            const rightEdge = platform.x + platform.width/2;
            const topEdge = platform.y - platform.height/2;
            const bottomEdge = platform.y + platform.height/2;
            
            // Check if ring center is inside platform bounds
            if (ring.x >= leftEdge - ringRadius && 
                ring.x <= rightEdge + ringRadius &&
                ring.y >= topEdge - ringRadius && 
                ring.y <= bottomEdge + ringRadius) {
                return true;
            }
        }
        
        return false;
    }

    calculateLandingPoint(jumpPad) {
        const gravity = 0.5;
        const vx = jumpPad.forceX || 0;
        const vy = jumpPad.forceY || jumpPad.force || 0;
        const time = (2 * vy) / gravity;
        
        return {
            x: jumpPad.x + vx * time,
            y: jumpPad.y
        };
    }
}

// Export for use in main game
// Browser doesn't use CommonJS, so just make it global
window.LevelGeneratorSystem = LevelGeneratorSystem;