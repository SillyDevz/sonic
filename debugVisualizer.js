// Debug Visualization System for Level Rules
// This helps visualize and debug the level generation rules

class DebugVisualizer {
    constructor(canvas, levelRules) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rules = levelRules;
        this.enabled = false;
        this.options = {
            showGrid: true,
            showRules: true,
            showValidation: true,
            showSections: true,
            showSpacing: true,
            showPaths: true,
            showRanges: true,
            showStats: true
        };
        this.camera = { x: 0, y: 0 };
        this.zoom = 1;
        this.selectedElement = null;
        this.validationResults = null;
    }

    // Toggle debug mode
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.clear();
        }
    }

    // Clear debug overlay
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Main render method
    render(levelData, player) {
        if (!this.enabled) return;

        // Save context state
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x * this.zoom, -this.camera.y * this.zoom);
        this.ctx.scale(this.zoom, this.zoom);

        // Render different debug layers
        if (this.options.showGrid) this.renderGrid();
        if (this.options.showSections) this.renderSections(levelData.sections);
        if (this.options.showRules) this.renderRules(levelData);
        if (this.options.showSpacing) this.renderSpacing(levelData);
        if (this.options.showPaths) this.renderPaths(levelData);
        if (this.options.showRanges) this.renderRanges(levelData, player);
        if (this.options.showValidation && this.validationResults) {
            this.renderValidation(this.validationResults);
        }

        // Restore context state
        this.ctx.restore();

        // Render UI elements (not affected by camera)
        if (this.options.showStats) this.renderStats(levelData, player);
        this.renderControls();
    }

    // Render grid
    renderGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        const gridSize = 100;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const endX = startX + this.canvas.width / this.zoom + gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endY = startY + this.canvas.height / this.zoom + gridSize;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }

        // Highlight major grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;

        // Major vertical lines every 500 units
        for (let x = Math.floor(startX / 500) * 500; x <= endX; x += 500) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
    }

    // Render level sections
    renderSections(sections) {
        if (!sections) return;

        const sectionColors = {
            speedSection: 'rgba(0, 255, 0, 0.2)',
            platformSection: 'rgba(0, 0, 255, 0.2)',
            combatSection: 'rgba(255, 0, 0, 0.2)',
            bonusSection: 'rgba(255, 255, 0, 0.2)'
        };

        for (const section of sections) {
            this.ctx.fillStyle = sectionColors[section.type] || 'rgba(128, 128, 128, 0.2)';
            this.ctx.fillRect(section.start, 0, section.end - section.start, this.canvas.height / this.zoom);

            // Section label
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(section.type, section.start + 10, 30);
        }
    }

    // Render rule visualizations
    renderRules(levelData) {
        // Platform rules
        for (const platform of levelData.platforms || []) {
            // Min/max gap indicators
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            
            // Draw gap range
            this.ctx.beginPath();
            this.ctx.arc(platform.x, platform.y, this.rules.platforms.placement.minGap, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(platform.x, platform.y, this.rules.platforms.placement.maxGap, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
        }

        // Enemy safe zones around checkpoints
        for (const checkpoint of levelData.checkpoints || []) {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(checkpoint.x, checkpoint.y, this.rules.enemies.placement.safeZoneRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    // Render spacing indicators
    renderSpacing(levelData) {
        // Ring spacing
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;

        for (const ring of levelData.rings || []) {
            if (ring.type === 'normal') {
                this.ctx.beginPath();
                this.ctx.arc(ring.x, ring.y, this.rules.rings.patterns.line.minSpacing / 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        // Enemy spacing
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        for (const enemy of levelData.enemies || []) {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, this.rules.enemies.placement.minSpacing / 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Jump pad spacing
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        for (const jumpPad of levelData.jumpPads || []) {
            this.ctx.beginPath();
            this.ctx.arc(jumpPad.x, jumpPad.y, this.rules.jumpPads.placement.minSpacing / 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    // Render movement paths
    renderPaths(levelData) {
        // Moving platform paths
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;

        for (const platform of levelData.platforms || []) {
            if (platform.type === 'moving' && platform.path) {
                this.ctx.beginPath();
                this.ctx.moveTo(platform.path[0].x, platform.path[0].y);
                for (let i = 1; i < platform.path.length; i++) {
                    this.ctx.lineTo(platform.path[i].x, platform.path[i].y);
                }
                this.ctx.stroke();

                // Path points
                for (const point of platform.path) {
                    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        // Jump pad trajectories
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.setLineDash([10, 5]);

        for (const jumpPad of levelData.jumpPads || []) {
            const trajectory = this.calculateJumpTrajectory(jumpPad);
            
            this.ctx.beginPath();
            this.ctx.moveTo(jumpPad.x, jumpPad.y);
            
            for (const point of trajectory) {
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    // Render detection ranges
    renderRanges(levelData, player) {
        // Enemy detection ranges
        for (const enemy of levelData.enemies || []) {
            // Detection range
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.detectionRange, 0, Math.PI * 2);
            this.ctx.stroke();

            // Attack range
            if (enemy.attackRange) {
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x, enemy.y, enemy.attackRange, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Line to player if in range
            if (player) {
                const distance = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
                if (distance <= enemy.detectionRange) {
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(enemy.x, enemy.y);
                    this.ctx.lineTo(player.x, player.y);
                    this.ctx.stroke();
                }
            }
        }

        // Special ring ranges
        for (const ring of levelData.rings || []) {
            if (ring.type === 'magnet') {
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(ring.x, ring.y, ring.magnetRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }

    // Render validation errors
    renderValidation(validationResults) {
        // Draw error locations
        for (const error of validationResults.errors) {
            this.ctx.strokeStyle = this.getSeverityColor(error.severity);
            this.ctx.lineWidth = 3;
            
            // Draw error indicator at location
            if (error.x !== undefined && error.y !== undefined) {
                this.ctx.beginPath();
                this.ctx.moveTo(error.x - 10, error.y - 10);
                this.ctx.lineTo(error.x + 10, error.y + 10);
                this.ctx.moveTo(error.x + 10, error.y - 10);
                this.ctx.lineTo(error.x - 10, error.y + 10);
                this.ctx.stroke();
                
                // Error type label
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(error.type, error.x + 15, error.y - 5);
            }
        }

        // Draw warning locations
        for (const warning of validationResults.warnings) {
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            this.ctx.lineWidth = 2;
            
            if (warning.x !== undefined && warning.y !== undefined) {
                this.ctx.beginPath();
                this.ctx.arc(warning.x, warning.y, 15, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.fillStyle = 'yellow';
                this.ctx.font = '20px Arial';
                this.ctx.fillText('!', warning.x - 5, warning.y + 7);
            }
        }
    }

    // Render statistics panel
    renderStats(levelData, player) {
        const stats = this.calculateStats(levelData);
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 300, 400);
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Level Debug Stats', 20, 35);
        
        // Stats
        this.ctx.font = '14px Arial';
        let y = 60;
        const lineHeight = 20;
        
        this.ctx.fillText(`Level: ${levelData.number || 'N/A'}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`Difficulty: ${levelData.difficulty || 'N/A'}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`Length: ${levelData.length || 0}`, 20, y);
        y += lineHeight * 1.5;
        
        this.ctx.fillText(`Platforms: ${stats.platformCount}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`  Static: ${stats.staticPlatforms}`, 40, y);
        y += lineHeight;
        this.ctx.fillText(`  Moving: ${stats.movingPlatforms}`, 40, y);
        y += lineHeight;
        this.ctx.fillText(`  Crumbling: ${stats.crumblingPlatforms}`, 40, y);
        y += lineHeight * 1.5;
        
        this.ctx.fillText(`Enemies: ${stats.enemyCount}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`  Basic: ${stats.basicEnemies}`, 40, y);
        y += lineHeight;
        this.ctx.fillText(`  Flying: ${stats.flyingEnemies}`, 40, y);
        y += lineHeight;
        this.ctx.fillText(`  Shielded: ${stats.shieldedEnemies}`, 40, y);
        y += lineHeight * 1.5;
        
        this.ctx.fillText(`Rings: ${stats.ringCount}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`  Normal: ${stats.normalRings}`, 40, y);
        y += lineHeight;
        this.ctx.fillText(`  Special: ${stats.specialRings}`, 40, y);
        y += lineHeight * 1.5;
        
        this.ctx.fillText(`Jump Pads: ${stats.jumpPadCount}`, 20, y);
        y += lineHeight;
        this.ctx.fillText(`Checkpoints: ${stats.checkpointCount}`, 20, y);
        
        // Player info
        if (player) {
            y += lineHeight * 1.5;
            this.ctx.fillText(`Player Pos: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, y);
        }
    }

    // Render debug controls
    renderControls() {
        const x = this.canvas.width - 200;
        let y = 20;
        const lineHeight = 25;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 10, 10, 200, 300);
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Debug Controls', x, y);
        y += lineHeight;
        
        // Options
        this.ctx.font = '12px Arial';
        for (const [option, enabled] of Object.entries(this.options)) {
            this.ctx.fillStyle = enabled ? '#00FF00' : '#FF0000';
            this.ctx.fillText(`[${enabled ? 'X' : ' '}] ${this.formatOptionName(option)}`, x, y);
            y += lineHeight;
        }
        
        // Instructions
        y += lineHeight;
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Press D to toggle debug', x, y);
        y += lineHeight;
        this.ctx.fillText('Press 1-8 to toggle options', x, y);
    }

    // Calculate level statistics
    calculateStats(levelData) {
        const stats = {
            platformCount: 0,
            staticPlatforms: 0,
            movingPlatforms: 0,
            crumblingPlatforms: 0,
            enemyCount: 0,
            basicEnemies: 0,
            flyingEnemies: 0,
            shieldedEnemies: 0,
            projectileEnemies: 0,
            ringCount: 0,
            normalRings: 0,
            specialRings: 0,
            jumpPadCount: 0,
            checkpointCount: 0
        };
        
        // Count platforms
        for (const platform of levelData.platforms || []) {
            stats.platformCount++;
            stats[`${platform.type}Platforms`]++;
        }
        
        // Count enemies
        for (const enemy of levelData.enemies || []) {
            stats.enemyCount++;
            stats[`${enemy.type}Enemies`]++;
        }
        
        // Count rings
        for (const ring of levelData.rings || []) {
            stats.ringCount++;
            if (ring.type === 'normal') {
                stats.normalRings++;
            } else {
                stats.specialRings++;
            }
        }
        
        stats.jumpPadCount = (levelData.jumpPads || []).length;
        stats.checkpointCount = (levelData.checkpoints || []).length;
        
        return stats;
    }

    // Helper methods
    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'rgba(255, 0, 0, 1)';
            case 'high': return 'rgba(255, 128, 0, 1)';
            case 'medium': return 'rgba(255, 255, 0, 1)';
            case 'low': return 'rgba(128, 255, 0, 1)';
            default: return 'rgba(255, 255, 255, 0.5)';
        }
    }

    formatOptionName(option) {
        return option
            .replace(/([A-Z])/g, ' $1')
            .replace(/^show /, '')
            .trim()
            .charAt(0).toUpperCase() + 
            option.replace(/([A-Z])/g, ' $1').replace(/^show /, '').trim().slice(1);
    }

    calculateJumpTrajectory(jumpPad) {
        const points = [];
        const gravity = 0.5;
        const vx = jumpPad.forceX || 0;
        const vy = jumpPad.forceY || jumpPad.force || 0;
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i * 0.1;
            const x = jumpPad.x + vx * t * 10;
            const y = jumpPad.y - (vy * t * 10 - 0.5 * gravity * t * t * 100);
            
            points.push({ x, y });
            
            // Stop when hitting ground
            if (y > jumpPad.y + 100) break;
        }
        
        return points;
    }

    // Set validation results
    setValidationResults(results) {
        this.validationResults = results;
    }

    // Update camera position
    updateCamera(x, y) {
        this.camera.x = x - this.canvas.width / 2;
        this.camera.y = y - this.canvas.height / 2;
    }

    // Handle input
    handleKeyPress(key) {
        switch (key) {
            case 'D':
            case 'd':
                this.toggle();
                break;
            case '1':
                this.options.showGrid = !this.options.showGrid;
                break;
            case '2':
                this.options.showRules = !this.options.showRules;
                break;
            case '3':
                this.options.showValidation = !this.options.showValidation;
                break;
            case '4':
                this.options.showSections = !this.options.showSections;
                break;
            case '5':
                this.options.showSpacing = !this.options.showSpacing;
                break;
            case '6':
                this.options.showPaths = !this.options.showPaths;
                break;
            case '7':
                this.options.showRanges = !this.options.showRanges;
                break;
            case '8':
                this.options.showStats = !this.options.showStats;
                break;
        }
    }
}

// Export for use in main game
// Browser doesn't use CommonJS, so just make it global
window.DebugVisualizer = DebugVisualizer;