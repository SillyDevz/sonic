// Level Design Rules and Configuration for Sonic Game
// This file defines consistent rules for all game elements to ensure balanced gameplay

const LEVEL_RULES = {
    // Ring Configuration Rules
    rings: {
        // Ring collection patterns
        patterns: {
            line: {
                minSpacing: 50,      // Minimum distance between rings in a line
                maxSpacing: 80,      // Maximum distance between rings in a line
                minCount: 3,         // Minimum rings in a line pattern
                maxCount: 6          // Maximum rings in a line pattern (reduced from 10)
            },
            arc: {
                minRadius: 60,       // Minimum radius for ring arcs (reduced from 100)
                maxRadius: 120,      // Maximum radius for ring arcs (reduced from 300)
                minCount: 3,         // Minimum rings in an arc (reduced from 5)
                maxCount: 8          // Maximum rings in an arc (reduced from 15)
            },
            circle: {
                minRadius: 50,       // Minimum radius for ring circles (reduced from 80)
                maxRadius: 80,       // Maximum radius for ring circles (reduced from 150)
                ringCount: 6         // Standard number of rings in a circle (reduced from 8)
            }
        },
        // Placement rules
        placement: {
            minHeight: 50,           // Minimum height from ground
            maxHeight: 200,          // Maximum height from ground (reduced from 400)
            minDistanceFromHazard: 100, // Keep rings away from hazards
            rewardValue: 1,          // Points per ring
            protectionDuration: 1000 // Ring protection duration in ms
        },
        // Special ring types
        special: {
            superRing: {
                value: 10,           // Equivalent to 10 normal rings
                spawnChance: 0.05,   // 5% chance to spawn
                glowRadius: 30       // Visual glow effect radius
            },
            magnetRing: {
                value: 5,            // Equivalent to 5 normal rings
                magnetRadius: 150,   // Attraction radius
                spawnChance: 0.03    // 3% chance to spawn
            }
        }
    },

    // Jump Pad Configuration Rules
    jumpPads: {
        types: {
            vertical: {
                minForce: 15,        // Minimum upward velocity
                maxForce: 30,        // Maximum upward velocity
                width: 60,           // Standard width
                height: 20,          // Standard height
                cooldown: 100        // Milliseconds before reactivation
            },
            diagonal: {
                minForceX: 10,       // Minimum horizontal velocity
                maxForceX: 20,       // Maximum horizontal velocity
                minForceY: 10,       // Minimum vertical velocity
                maxForceY: 25,       // Maximum vertical velocity
                angle: 45,           // Default angle in degrees
                width: 80,           // Standard width
                height: 30           // Standard height
            },
            horizontal: {
                minForce: 15,        // Minimum horizontal velocity
                maxForce: 35,        // Maximum horizontal velocity
                width: 100,          // Standard width
                height: 20,          // Standard height
                direction: 'right'   // Default direction
            }
        },
        placement: {
            minSpacing: 200,         // Minimum distance between jump pads
            maxConsecutive: 3,       // Maximum jump pads in sequence
            sequenceSpacing: 150,    // Distance between pads in sequence
            heightVariation: 100,    // Max height difference in sequence
            nearPlatformOffset: 10   // Distance from platform edges
        },
        visual: {
            activeColor: '#00FF00',  // Color when active
            inactiveColor: '#808080', // Color during cooldown
            particleCount: 10,       // Particles on activation
            soundVolume: 0.6         // Sound effect volume
        }
    },

    // Platform Configuration Rules
    platforms: {
        types: {
            static: {
                minWidth: 100,       // Minimum platform width
                maxWidth: 400,       // Maximum platform width
                height: 20,          // Standard platform height
                friction: 0.8        // Surface friction
            },
            moving: {
                minWidth: 120,       // Minimum width for moving platforms
                maxWidth: 200,       // Maximum width for moving platforms
                minSpeed: 50,        // Minimum movement speed (pixels/sec)
                maxSpeed: 150,       // Maximum movement speed (pixels/sec)
                minPath: 100,        // Minimum path length
                maxPath: 500,        // Maximum path length
                pauseDuration: 1000  // Pause at path ends (ms)
            },
            crumbling: {
                minWidth: 80,        // Minimum width
                maxWidth: 150,       // Maximum width
                stability: 1000,     // Time before crumbling (ms)
                respawnTime: 5000,   // Time to respawn (ms)
                warningTime: 300,    // Warning shake duration (ms)
                particleCount: 20    // Particles when crumbling
            },
            rotating: {
                minRadius: 100,      // Minimum rotation radius
                maxRadius: 200,      // Maximum rotation radius
                minSpeed: 0.5,       // Min rotation speed (radians/sec)
                maxSpeed: 2.0,       // Max rotation speed (radians/sec)
                platformCount: 4     // Platforms per rotation
            }
        },
        placement: {
            minGap: 80,             // Minimum gap between platforms (reduced from 150)
            maxGap: 250,            // Maximum gap between platforms (reduced from 350)
            minHeight: 50,          // Minimum height from ground
            maxHeight: 400,         // Maximum height from ground (reduced from 600)
            verticalSpacing: 80,    // Vertical spacing for climbing sections (reduced from 100)
            safetyMargin: 30        // Edge safety margin (reduced from 50)
        },
        difficulty: {
            easy: {
                gapMultiplier: 0.8,  // Smaller gaps
                widthMultiplier: 1.2, // Wider platforms
                speedMultiplier: 0.7  // Slower moving platforms
            },
            medium: {
                gapMultiplier: 1.0,  // Standard gaps
                widthMultiplier: 1.0, // Standard width
                speedMultiplier: 1.0  // Standard speed
            },
            hard: {
                gapMultiplier: 1.3,  // Larger gaps
                widthMultiplier: 0.8, // Narrower platforms
                speedMultiplier: 1.4  // Faster moving platforms
            }
        }
    },

    // Enemy Configuration Rules
    enemies: {
        types: {
            basic: {
                health: 1,           // Hit points
                speed: 100,          // Movement speed (pixels/sec)
                damage: 1,           // Damage dealt to player
                points: 100,         // Points for defeating
                detectionRange: 200, // Player detection range
                attackRange: 50,     // Attack activation range
                respawnTime: 0       // No respawn
            },
            flying: {
                health: 1,
                speed: 120,
                damage: 1,
                points: 150,
                detectionRange: 250,
                hoverHeight: 150,    // Height above ground
                diveSpeed: 300,      // Dive attack speed
                patrolRadius: 200    // Patrol area radius
            },
            shielded: {
                health: 3,
                speed: 80,
                damage: 2,
                points: 300,
                detectionRange: 150,
                shieldRegenTime: 3000, // Shield regeneration time
                vulnerableTime: 2000   // Time vulnerable after shield break
            },
            projectile: {
                health: 2,
                speed: 50,
                damage: 1,
                points: 200,
                detectionRange: 300,
                fireRate: 2000,      // Milliseconds between shots
                projectileSpeed: 200, // Projectile speed
                projectileDamage: 1
            }
        },
        placement: {
            minSpacing: 150,         // Minimum distance between enemies (reduced from 300)
            maxPerSection: 12,       // Maximum enemies per screen section (increased from 5)
            difficultyScaling: 1.2,  // Enemy increase per level
            safeZoneRadius: 300,     // No enemies near checkpoints (reduced from 500)
            spawnProtectionRadius: 800, // No enemies near player spawn point
            grouping: {
                maxGroupSize: 5,     // Maximum enemies in a group (increased from 3)
                groupSpacing: 80,    // Spacing within groups (reduced from 100)
                groupTypes: ['same', 'mixed'] // Group composition
            }
        },
        behavior: {
            patrol: {
                pathLength: 200,     // Default patrol path length
                pauseDuration: 500,  // Pause at path ends
                turnSpeed: 2.0       // Rotation speed (radians/sec)
            },
            chase: {
                maxDistance: 400,    // Maximum chase distance
                acceleration: 500,   // Chase acceleration
                giveUpTime: 3000     // Time before returning to patrol
            },
            attack: {
                telegraphTime: 500,  // Attack warning time (ms)
                cooldown: 1500,      // Attack cooldown (ms)
                knockback: 200       // Player knockback distance
            }
        },
        drops: {
            ring: {
                chance: 0.3,         // 30% chance to drop rings
                minAmount: 1,        // Minimum rings dropped
                maxAmount: 5         // Maximum rings dropped
            },
            powerup: {
                chance: 0.1,         // 10% chance to drop powerup
                types: ['speed', 'shield', 'invincibility']
            }
        }
    },

    // Level Section Rules
    sections: {
        types: {
            speedSection: {
                length: 600,         // Section length
                ringDensity: 0.5,    // Moderate ring density
                enemyDensity: 0.6,   // Enemies in speed sections
                platformDensity: 0.4 // Some platforms for variety
            },
            platformSection: {
                length: 500,
                ringDensity: 0.6,    // Good amount of rings
                enemyDensity: 0.8,   // More enemies
                platformDensity: 0.8, // Good amount of platforms
                jumpPadDensity: 0.8  // More springs to connect platforms
            },
            combatSection: {
                length: 400,
                ringDensity: 0.3,    // Few rings in combat areas
                enemyDensity: 1.5,   // Many enemies
                platformDensity: 0.5, // Some platforms for combat
                coverElements: true
            },
            bonusSection: {
                length: 300,
                ringDensity: 0.8,    // More rings in bonus areas
                enemyDensity: 0.2,   // Few enemies
                platformDensity: 0.6, // Good platforms for bonus areas
                specialRings: true
            }
        },
        transitions: {
            buffer: 50,             // Buffer zone between sections (reduced from 200)
            warningDistance: 100,   // Distance to show section change
            smoothing: true         // Smooth difficulty transitions
        }
    },

    // Difficulty Progression Rules
    progression: {
        levels: {
            1: { multiplier: 1.0, newEnemyTypes: ['basic'] },
            2: { multiplier: 1.2, newEnemyTypes: ['flying'] },
            3: { multiplier: 1.4, newEnemyTypes: [] },
            4: { multiplier: 1.6, newEnemyTypes: ['projectile'] },
            5: { multiplier: 1.8, newEnemyTypes: ['shielded'] },
            6: { multiplier: 2.0, newEnemyTypes: [] },
            7: { multiplier: 2.3, newEnemyTypes: [] },
            8: { multiplier: 2.6, newEnemyTypes: [] },
            9: { multiplier: 3.0, newEnemyTypes: [] },
            10: { multiplier: 3.5, newEnemyTypes: [] }
        },
        scaling: {
            enemyHealth: 1.2,       // Health multiplier per level
            enemySpeed: 1.1,        // Speed multiplier per level
            enemyDamage: 1.15,      // Damage multiplier per level
            platformGaps: 1.1,      // Gap size multiplier
            ringValue: 1.0          // Rings stay consistent
        }
    },

    // Checkpoint and Save Rules
    checkpoints: {
        spacing: 1500,              // Distance between checkpoints (reduced from 2000)
        activationRadius: 100,      // Activation detection radius
        respawnOffset: 50,          // Respawn position offset
        healAmount: 0,              // Rings restored on respawn
        invincibilityTime: 2000     // Invincibility after respawn
    },
    
    // Level constants
    constants: {
        groundHeight: 320,          // Ground level in the game
        minPlatformHeight: 50,      // Minimum height above ground for platforms
        maxPlatformHeight: 250      // Maximum height above ground for platforms
    }
};

// Helper functions for level generation
const LevelGenerator = {
    // Generate a ring pattern based on type
    generateRingPattern(type, x, y, config = {}) {
        const rings = [];
        const rules = LEVEL_RULES.rings.patterns[type];
        
        switch(type) {
            case 'line':
                const count = config.count || Math.floor(Math.random() * 
                    (rules.maxCount - rules.minCount + 1)) + rules.minCount;
                const spacing = config.spacing || Math.floor(Math.random() * 
                    (rules.maxSpacing - rules.minSpacing + 1)) + rules.minSpacing;
                
                for (let i = 0; i < count; i++) {
                    rings.push({
                        x: x + (i * spacing),
                        y: y,
                        type: 'normal'
                    });
                }
                break;
                
            case 'arc':
                const arcCount = config.count || Math.floor(Math.random() * 
                    (rules.maxCount - rules.minCount + 1)) + rules.minCount;
                const radius = config.radius || Math.floor(Math.random() * 
                    (rules.maxRadius - rules.minRadius + 1)) + rules.minRadius;
                
                for (let i = 0; i < arcCount; i++) {
                    const angle = (Math.PI / arcCount) * i;
                    rings.push({
                        x: x + Math.cos(angle) * radius,
                        y: y - Math.sin(angle) * radius,
                        type: 'normal'
                    });
                }
                break;
                
            case 'circle':
                const circleRadius = config.radius || Math.floor(Math.random() * 
                    (rules.maxRadius - rules.minRadius + 1)) + rules.minRadius;
                
                for (let i = 0; i < rules.ringCount; i++) {
                    const angle = (2 * Math.PI / rules.ringCount) * i;
                    rings.push({
                        x: x + Math.cos(angle) * circleRadius,
                        y: y + Math.sin(angle) * circleRadius,
                        type: 'normal'
                    });
                }
                break;
        }
        
        return rings;
    },
    
    // Validate enemy placement
    validateEnemyPlacement(x, y, existingEnemies, checkpoints) {
        const rules = LEVEL_RULES.enemies.placement;
        
        // Check distance from other enemies
        for (const enemy of existingEnemies) {
            const distance = Math.sqrt(Math.pow(x - enemy.x, 2) + Math.pow(y - enemy.y, 2));
            if (distance < rules.minSpacing) {
                return false;
            }
        }
        
        // Check safe zones around checkpoints
        for (const checkpoint of checkpoints) {
            const distance = Math.sqrt(Math.pow(x - checkpoint.x, 2) + Math.pow(y - checkpoint.y, 2));
            if (distance < rules.safeZoneRadius) {
                return false;
            }
        }
        
        return true;
    },
    
    // Calculate difficulty-adjusted values
    getDifficultyAdjustedValue(baseValue, level, scalingFactor) {
        const progression = LEVEL_RULES.progression.levels[level] || 
                          LEVEL_RULES.progression.levels[10];
        return baseValue * progression.multiplier * scalingFactor;
    },
    
    // Get platform configuration for difficulty
    getPlatformConfig(difficulty, type) {
        const baseConfig = LEVEL_RULES.platforms.types[type];
        const difficultyMods = LEVEL_RULES.platforms.difficulty[difficulty];
        
        return {
            ...baseConfig,
            width: baseConfig.minWidth * difficultyMods.widthMultiplier,
            speed: baseConfig.minSpeed * difficultyMods.speedMultiplier,
            gap: LEVEL_RULES.platforms.placement.minGap * difficultyMods.gapMultiplier
        };
    }
};

// Export for use in main game
// Browser doesn't use CommonJS, so just make them global
window.LEVEL_RULES = LEVEL_RULES;
window.LevelGenerator = LevelGenerator;