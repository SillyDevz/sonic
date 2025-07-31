const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const GRAVITY = 0.35;
const GROUND_HEIGHT = 320;
const GAME_SPEED_MULTIPLIER = 1.2;

let isFullscreen = false;
let scaleFactor = 1;

function toggleFullscreen() {
    const gameContainer = document.getElementById('gameContainer');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) {
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.msRequestFullscreen) {
            gameContainer.msRequestFullscreen();
        }
        gameContainer.classList.add('fullscreen');
        isFullscreen = true;
        resizeCanvas();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        gameContainer.classList.remove('fullscreen');
        isFullscreen = false;
        resizeCanvas();
    }
}

function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const gameAspectRatio = 800 / 400;
    const windowAspectRatio = windowWidth / windowHeight;
    
    if (isFullscreen) {
        if (windowAspectRatio > gameAspectRatio) {
            scaleFactor = windowHeight / 400;
            canvas.style.width = (800 * scaleFactor) + 'px';
            canvas.style.height = windowHeight + 'px';
        } else {
            scaleFactor = windowWidth / 800;
            canvas.style.width = windowWidth + 'px';
            canvas.style.height = (400 * scaleFactor) + 'px';
        }
    } else {
        if (windowAspectRatio > gameAspectRatio) {
            scaleFactor = windowHeight / 400;
            canvas.style.width = (800 * scaleFactor) + 'px';
            canvas.style.height = windowHeight + 'px';
        } else {
            scaleFactor = windowWidth / 800;
            canvas.style.width = windowWidth + 'px';
            canvas.style.height = (400 * scaleFactor) + 'px';
        }
    }
}

// Fullscreen button removed

document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

window.addEventListener('resize', resizeCanvas);

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        document.getElementById('gameContainer').classList.remove('fullscreen');
        isFullscreen = false;
        resizeCanvas();
    }
}

window.addEventListener('load', () => {
    resizeCanvas();
});

resizeCanvas();

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.muted = false;
        this.sounds = {};
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }
    
    createSound(frequency, duration, type = 'square', volume = 0.3) {
        if (!this.audioContext || this.muted) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Error creating sound:', e);
        }
    }
    
    playJump() {
        this.createSound(400, 0.1, 'square', 0.3);
        setTimeout(() => this.createSound(600, 0.1, 'square', 0.2), 50);
        // Add a subtle higher harmonic for richness
        this.createSound(800, 0.08, 'sine', 0.1);
    }
    
    playRingCollect() {
        this.createSound(800, 0.05, 'sine', 0.3);
        setTimeout(() => this.createSound(1200, 0.1, 'sine', 0.25), 30);
        // Add sparkle effect
        setTimeout(() => this.createSound(1600, 0.05, 'triangle', 0.15), 60);
    }
    
    playEnemyHit() {
        this.createSound(150, 0.2, 'sawtooth', 0.4);
        this.createSound(100, 0.3, 'square', 0.3);
        // Add impact punch
        this.createSound(60, 0.15, 'sine', 0.35);
        setTimeout(() => this.createSound(80, 0.1, 'triangle', 0.2), 100);
    }
    
    playSpring() {
        this.createSound(200, 0.1, 'sine', 0.4);
        setTimeout(() => this.createSound(400, 0.1, 'sine', 0.3), 50);
        setTimeout(() => this.createSound(800, 0.15, 'sine', 0.25), 100);
        // Add metallic resonance
        this.createSound(1600, 0.08, 'triangle', 0.15);
        setTimeout(() => this.createSound(2400, 0.05, 'sine', 0.1), 150);
    }
    
    playHurt() {
        this.createSound(200, 0.15, 'square', 0.4);
        this.createSound(150, 0.2, 'sawtooth', 0.3);
    }
    
    playGameOver() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createSound(400 - i * 50, 0.2, 'square', 0.3);
            }, i * 100);
        }
    }
    
    playRingLoss() {
        this.createSound(300, 0.1, 'square', 0.2);
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createSound(250 - i * 30, 0.05, 'sine', 0.15);
            }, i * 30);
        }
    }
    
    playLevelStart() {
        this.createSound(440, 0.1, 'sine', 0.3);
        setTimeout(() => this.createSound(554, 0.1, 'sine', 0.3), 100);
        setTimeout(() => this.createSound(659, 0.1, 'sine', 0.3), 200);
        setTimeout(() => this.createSound(880, 0.2, 'sine', 0.4), 300);
    }
    
    playSpeedBoost() {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.createSound(400 + i * 100, 0.05, 'sawtooth', 0.2);
            }, i * 20);
        }
    }
    
    playLand() {
        this.createSound(80, 0.05, 'sine', 0.3);
        this.createSound(60, 0.08, 'triangle', 0.2);
    }
    
    playCheckpoint() {
        this.createSound(523, 0.1, 'sine', 0.3);
        setTimeout(() => this.createSound(659, 0.1, 'sine', 0.3), 100);
        setTimeout(() => this.createSound(784, 0.1, 'sine', 0.3), 200);
        setTimeout(() => this.createSound(1047, 0.2, 'sine', 0.4), 300);
    }
    
    playExtraLife() {
        const notes = [523, 659, 784, 1047, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createSound(freq, 0.15, 'sine', 0.35);
            }, i * 100);
        });
    }
    
    playBackgroundMusic() {
        if (!this.audioContext || this.muted) return;
        
        // Stop any existing music before starting new
        this.stopBackgroundMusic();
        
        const playNote = (frequency, startTime, duration = 0.1) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gainNode.gain.setValueAtTime(0.1 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        const bass = [130.81, 146.83, 164.81, 130.81];
        const melody = [
            [261.63, 329.63, 392.00, 329.63],
            [293.66, 349.23, 440.00, 349.23],
            [329.63, 392.00, 493.88, 392.00],
            [261.63, 329.63, 392.00, 523.25]
        ];
        
        this.musicInterval = setInterval(() => {
            const currentTime = this.audioContext.currentTime;
            
            bass.forEach((note, i) => {
                playNote(note, currentTime + i * 0.25, 0.2);
            });
            
            melody[Math.floor(Math.random() * melody.length)].forEach((note, i) => {
                playNote(note, currentTime + i * 0.25, 0.15);
            });
        }, 1000);
    }
    
    stopBackgroundMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.muted;
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

class Game {
    constructor() {
        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.rings = [];
        this.enemies = [];
        this.platforms = [];
        this.springs = [];
        this.checkpoints = [];
        this.score = 0;
        this.ringCount = 0;
        this.lives = 3;
        this.time = 0;
        this.gameTime = 0;
        this.lastTime = 0;
        this.lastCheckpoint = { x: 100, y: 200 };
        this.levelComplete = false;
        this.currentLevel = 1;
        
        this.audioManager = new AudioManager();
        this.sonic = new Sonic(100, 200);
        this.player = this.sonic; // Reference for enemies
        this.level = new Level();
        
        this.setupEventListeners();
        this.init();
    }
    
    init() {
        this.level.create(this);
        this.lastTime = performance.now();
        this.audioManager.playLevelStart();
        this.audioManager.playBackgroundMusic();
        this.gameLoop();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Audio controls
            if (e.key.toLowerCase() === 'm') {
                this.audioManager.toggleMute();
            } else if (e.key === '+' || e.key === '=') {
                this.audioManager.setVolume(this.audioManager.masterVolume + 0.1);
            } else if (e.key === '-' || e.key === '_') {
                this.audioManager.setVolume(this.audioManager.masterVolume - 0.1);
            }
            
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
    }
    
    update(deltaTime) {
        // Only update timer if level is not complete
        if (!this.levelComplete) {
            this.gameTime += deltaTime;
            this.time = Math.floor(this.gameTime / 1000);
        }
        
        this.sonic.update(this.keys, deltaTime, this);
        this.level.update(deltaTime, this.camera);
        
        this.camera.x = this.sonic.x - canvas.width / 2;
        this.camera.x = Math.max(0, this.camera.x);
        
        this.rings.forEach(ring => {
            ring.update(deltaTime);
        });
        this.enemies.forEach(enemy => enemy.update(deltaTime, this));
        this.springs.forEach(spring => spring.update(deltaTime));
        this.checkpoints.forEach(checkpoint => checkpoint.update(deltaTime));
        
        this.checkCollisions();
        this.updateUI();
    }
    
    checkCollisions() {
        this.rings = this.rings.filter(ring => {
            if (!ring.collected && ring.collectDelay <= 0 && this.checkCollision(this.sonic, ring)) {
                ring.collected = true;
                this.ringCount++;
                this.score += 10;
                this.audioManager.playRingCollect();
                
                // Check for extra life at 100 rings
                if (this.ringCount >= 100) {
                    this.lives++;
                    this.ringCount = 0;
                    this.audioManager.playExtraLife();
                }
                
                return false;
            }
            // Remove rings that have expired
            if (ring.bouncing && ring.lifetime >= ring.maxLifetime) {
                return false;
            }
            return !ring.collected;
        });
        
        this.enemies.forEach(enemy => {
            if (!enemy.destroyed && enemy.checkCollision(this.sonic)) {
                const fromAbove = this.sonic.velocity.y > 0 && this.sonic.y < enemy.y;
                
                if (fromAbove && enemy.takeDamage(true)) {
                    // Enemy defeated from above
                    this.sonic.velocity.y = -10;
                    this.score += enemy.points;
                    this.audioManager.playEnemyHit();
                } else if (!fromAbove && enemy instanceof ShieldRobot && enemy.shieldActive) {
                    // Shield blocked the attack
                    enemy.takeDamage(false);
                    this.audioManager.playSpring(); // Shield block sound
                    // Bounce Sonic back
                    const knockbackX = this.sonic.x < enemy.x ? -8 : 8;
                    this.sonic.velocity.x = knockbackX;
                    this.sonic.velocity.y = -6;
                } else if (!this.sonic.invulnerable && !(fromAbove && enemy.takeDamage(true))) {
                    // Sonic takes damage
                    const knockbackX = this.sonic.x < enemy.x ? -3 : 3;
                    this.sonic.velocity.x = knockbackX;
                    this.sonic.velocity.y = -6;
                    
                    this.sonic.hit();
                    this.audioManager.playHurt();
                    if (this.ringCount > 0) {
                        this.spawnLostRings();
                        this.audioManager.playRingLoss();
                        this.ringCount = 0;
                    } else {
                        this.lives--;
                        if (this.lives <= 0) {
                            this.gameOver();
                        } else {
                            this.resetSonic();
                        }
                    }
                }
            }
        });
        
        this.springs.forEach(spring => {
            if (this.checkCollision(this.sonic, spring) && !spring.cooldown) {
                // Springs should always launch at full power, ignoring any existing velocity
                this.sonic.velocity.y = -22;  // Moderate spring bounce
                // Add slight forward momentum if moving
                if (Math.abs(this.sonic.velocity.x) > 0.1) {
                    this.sonic.velocity.x *= 1.2; // Slight speed boost
                }
                spring.activate();
                this.audioManager.playSpring();
                this.sonic.spinning = false;
                this.sonic.isGrounded = false;
                this.sonic.springLaunched = true;
                this.sonic.springLaunchTimer = 2000; // Prevent jump input until landing
            }
        });
        
        // Checkpoint collisions
        this.checkpoints.forEach(checkpoint => {
            if (this.checkCollision(this.sonic, checkpoint)) {
                if (checkpoint.activate()) {
                    if (checkpoint.isGoal) {
                        // Level complete!
                        this.levelComplete = true;
                        this.audioManager.playLevelStart(); // Victory sound
                        this.score += 1000; // Bonus points
                        
                        // Show completion message and move to next level
                        setTimeout(() => {
                            this.nextLevel();
                        }, 3000);
                    } else {
                        // Regular checkpoint
                        this.lastCheckpoint = { x: checkpoint.x, y: checkpoint.y - 50 };
                        this.audioManager.playCheckpoint();
                        this.score += 100;
                    }
                }
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    spawnLostRings() {
        const ringCount = Math.min(this.ringCount, 20);
        const centerX = this.sonic.x + this.sonic.width / 2;
        const centerY = this.sonic.y - 10; // Spawn from above Sonic
        
        
        for (let i = 0; i < ringCount; i++) {
            const angle = (Math.PI * 2 / ringCount) * i;
            // Spawn rings at a distance from Sonic to prevent immediate collection
            const spawnRadius = 30; // Minimum distance from Sonic
            const spawnX = centerX + Math.cos(angle) * spawnRadius;
            const spawnY = centerY + Math.sin(angle) * spawnRadius * 0.5;
            const ring = new Ring(spawnX - 10, spawnY - 10);
            
            // Classic Sonic ring scatter pattern with more upward force
            const speed = 5 + Math.random() * 3;
            ring.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 12 // Even stronger upward force
            };
            ring.bouncing = true;
            ring.lifetime = 0;
            ring.collectDelay = 500; // 0.5 second delay before collection
            this.rings.push(ring);
            
        }
    }
    
    resetSonic() {
        // Clear any scattered rings
        this.rings = this.rings.filter(ring => !ring.bouncing);
        
        // Reset Sonic to last checkpoint
        this.sonic.x = this.lastCheckpoint.x;
        this.sonic.y = this.lastCheckpoint.y;
        this.sonic.velocity = { x: 0, y: 0 };
        this.sonic.facing = 1;
        this.sonic.running = false;
        this.sonic.spinning = false;
        this.sonic.invulnerable = true;
        this.sonic.invulnerableTimer = 0;
        
        // Reset camera to checkpoint
        this.camera.x = Math.max(0, this.lastCheckpoint.x - canvas.width / 2);
        this.camera.y = 0;
        
        // Remove invulnerability after 3 seconds
        setTimeout(() => {
            this.sonic.invulnerable = false;
            this.sonic.invulnerableTimer = 0;
        }, 3000);
    }
    
    nextLevel() {
        // Clear current level
        this.rings = [];
        this.enemies = [];
        this.platforms = [];
        this.springs = [];
        this.checkpoints = [];
        
        // Increment level
        this.currentLevel++;
        
        // Reset level state
        this.levelComplete = false;
        this.lastCheckpoint = { x: 100, y: 200 };
        
        // Reset timer and ring count
        this.time = 0;
        this.gameTime = 0;
        this.ringCount = 0;
        
        // Reset Sonic position
        this.sonic.x = 100;
        this.sonic.y = 200;
        this.sonic.velocity = { x: 0, y: 0 };
        this.camera.x = 0;
        
        // Create new level (for now, recreate the same level)
        // In a full game, you'd have different level layouts
        this.level = new Level();
        this.level.create(this);
        
        // Play level start sound
        this.audioManager.playLevelStart();
    }
    
    gameOver() {
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playGameOver();
        setTimeout(() => {
            alert('Game Over! Score: ' + this.score);
            location.reload();
        }, 600);
    }
    
    updateUI() {
        document.getElementById('rings').textContent = this.ringCount;
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    render() {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8E8');
        gradient.addColorStop(1, '#C8E8F8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        this.level.render(ctx, this.camera);
        this.platforms.forEach(platform => platform.render(ctx));
        this.checkpoints.forEach(checkpoint => checkpoint.render(ctx));
        this.springs.forEach(spring => spring.render(ctx));
        this.enemies.forEach(enemy => enemy.render(ctx));
        this.rings.forEach(ring => ring.render(ctx));
        
        this.sonic.render(ctx);
        
        ctx.restore();
        
        // Draw audio controls info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(10, canvas.height - 25, 100, 20);
        ctx.fillStyle = '#aaa';
        ctx.font = '9px Arial';
        ctx.fillText(`♪ ${this.audioManager.muted ? 'MUTE' : Math.round(this.audioManager.masterVolume * 100) + '%'}`, 15, canvas.height - 12);
        
        // Draw custom HUD
        this.drawHUD(ctx);
        
        // Draw level complete message
        if (this.levelComplete) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Score: ${this.score}`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Time: ${Math.floor(this.time / 60)}:${(this.time % 60).toString().padStart(2, '0')}`, canvas.width / 2, canvas.height / 2 + 40);
            
            ctx.font = '18px Arial';
            ctx.fillText('Moving to next level...', canvas.width / 2, canvas.height / 2 + 80);
            
            ctx.textAlign = 'left';
        }
    }
    
    drawHUD(ctx) {
        // HUD background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 560, 40);
        
        // Ring icon and value
        this.drawRingIcon(ctx, 25, 30);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(this.ringCount.toString(), 50, 36);
        
        // Score label and value
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('SCORE:', 110, 36);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(this.score.toString(), 165, 36);
        
        // Time icon and value
        this.drawClockIcon(ctx, 260, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, 285, 36);
        
        // Lives icon and value
        this.drawSonicHeadIcon(ctx, 370, 30);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`×${this.lives}`, 395, 36);
        
        // Level indicator
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('LEVEL:', 460, 36);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(this.currentLevel.toString(), 510, 36);
    }
    
    drawRingIcon(ctx, x, y) {
        const pixelSize = 1.5;
        
        // Outer ring
        ctx.fillStyle = '#FFD700';
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const rx = Math.cos(angle) * 10;
            const ry = Math.sin(angle) * 10;
            ctx.fillRect(x + rx - pixelSize, y + ry - pixelSize, pixelSize * 2, pixelSize * 2);
        }
        
        // Inner ring
        ctx.fillStyle = '#FFA500';
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const rx = Math.cos(angle) * 6;
            const ry = Math.sin(angle) * 6;
            ctx.fillRect(x + rx - pixelSize/2, y + ry - pixelSize/2, pixelSize, pixelSize);
        }
        
        // Shine effect
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(x - 6, y - 10, pixelSize * 2, pixelSize * 2);
        ctx.fillRect(x + 4, y + 6, pixelSize, pixelSize);
    }
    
    drawClockIcon(ctx, x, y) {
        const pixelSize = 1.5;
        
        // Clock outer circle
        ctx.fillStyle = '#4169E1';
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
            const rx = Math.cos(angle) * 11;
            const ry = Math.sin(angle) * 11;
            ctx.fillRect(x + rx - pixelSize, y + ry - pixelSize, pixelSize * 2, pixelSize * 2);
        }
        
        // Clock face
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        
        // Clock center
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Hour marks (12, 3, 6, 9)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 1, y - 8, 2, 3);   // 12
        ctx.fillRect(x + 5, y - 1, 3, 2);   // 3
        ctx.fillRect(x - 1, y + 5, 2, 3);   // 6
        ctx.fillRect(x - 8, y - 1, 3, 2);   // 9
        
        // Clock hands
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 3, y - 4);
        ctx.stroke();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 6);
        ctx.stroke();
    }
    
    drawSonicHeadIcon(ctx, x, y) {
        const pixelSize = 1.5;
        
        // Head base
        ctx.fillStyle = '#0066FF';
        ctx.fillRect(x - 8, y - 8, 16, 16);
        
        // Spikes
        ctx.fillStyle = '#0044CC';
        // Top spike
        ctx.fillRect(x - 3, y - 11, 6, 3);
        ctx.fillRect(x - 1, y - 13, 2, 2);
        
        // Back spikes
        ctx.fillRect(x - 11, y - 6, 3, 5);
        ctx.fillRect(x - 13, y - 4, 2, 3);
        ctx.fillRect(x - 11, y + 1, 3, 5);
        ctx.fillRect(x - 13, y + 2, 2, 3);
        
        // Face details
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(x + 1, y - 1, 7, 6);
        
        // Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 3, y - 5, 5, 5);
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 5, y - 3, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5.5, y - 2.5, 1, 1);
        
        // Nose
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 1, 2, 2);
    }
    
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) * GAME_SPEED_MULTIPLIER;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Sonic {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 44;
        this.velocity = { x: 0, y: 0 };
        this.speed = 0.08;
        this.maxSpeed = 4.5;
        this.jumpPower = 14;
        this.acceleration = 0.035;
        this.deceleration = 0.92;
        this.airAcceleration = 0.025;
        this.airDeceleration = 0.98;
        this.isGrounded = false;
        this.facing = 1;
        this.running = false;
        this.spinning = false;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.coyoteTime = 0;
        this.maxCoyoteTime = 100;
        this.speedBoostPlayed = false;
        this.springLaunched = false;
        this.springLaunchTimer = 0;
    }
    
    update(keys, deltaTime, game) {
        const accel = this.isGrounded ? this.acceleration : this.airAcceleration;
        const decel = this.isGrounded ? this.deceleration : this.airDeceleration;
        
        if (keys['ArrowLeft']) {
            if (this.velocity.x > 0) {
                this.velocity.x *= 0.85;
            }
            this.velocity.x -= accel * deltaTime;
            this.facing = -1;
            this.running = true;
        } else if (keys['ArrowRight']) {
            if (this.velocity.x < 0) {
                this.velocity.x *= 0.85;
            }
            this.velocity.x += accel * deltaTime;
            this.facing = 1;
            this.running = true;
        } else {
            this.velocity.x *= decel;
            if (Math.abs(this.velocity.x) < 0.1) {
                this.velocity.x = 0;
                this.running = false;
            }
        }
        
        if (this.running && this.isGrounded) {
            this.animationTimer += deltaTime;
            const animSpeed = Math.max(50, 150 - Math.abs(this.velocity.x) * 20);
            if (this.animationTimer > animSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }
        } else if (!this.isGrounded) {
            this.animationFrame = 0;
        }
        
        this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.x));
        
        // Play speed boost sound when reaching high speed
        if (Math.abs(this.velocity.x) > this.maxSpeed * 0.8 && !this.speedBoostPlayed && this.isGrounded) {
            if (game && game.audioManager) {
                game.audioManager.playSpeedBoost();
            }
            this.speedBoostPlayed = true;
        } else if (Math.abs(this.velocity.x) < this.maxSpeed * 0.6) {
            this.speedBoostPlayed = false;
        }
        
        // Update spring launch timer
        if (this.springLaunched) {
            this.springLaunchTimer -= deltaTime;
            // Clear spring launch when timer expires or when starting to fall
            if (this.springLaunchTimer <= 0 || this.velocity.y >= 0) {
                this.springLaunched = false;
            }
        }
        
        if ((keys[' '] || keys['ArrowUp']) && (this.isGrounded || this.coyoteTime < this.maxCoyoteTime) && !this.springLaunched) {
            const speedBonus = Math.min(Math.abs(this.velocity.x) * 0.4, 3);
            this.velocity.y = -(this.jumpPower + speedBonus);
            this.spinning = true;
            this.coyoteTime = this.maxCoyoteTime;
            if (game && game.audioManager) {
                game.audioManager.playJump();
            }
        }
        
        if (!keys[' '] && !keys['ArrowUp'] && this.velocity.y < -2 && !this.isGrounded && !this.springLaunched) {
            this.velocity.y *= 0.85;
        }
        
        const gravityMultiplier = this.springLaunched ? 1.0 : (this.velocity.y < 0 ? 0.9 : 1.1);
        this.velocity.y += GRAVITY * gravityMultiplier;
        
        this.x += this.velocity.x * deltaTime * 0.06;
        this.y += this.velocity.y * deltaTime * 0.06;
        
        const wasGrounded = this.isGrounded;
        this.isGrounded = false;
        if (this.y + this.height >= GROUND_HEIGHT) {
            this.y = GROUND_HEIGHT - this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.spinning = false;
            this.springLaunched = false; // Clear spring launch on landing
            if (!wasGrounded && game && game.audioManager) {
                game.audioManager.playLand();
            }
        }
        
        game.platforms.forEach(platform => {
            if (this.velocity.y > 0 &&
                this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height + this.velocity.y) {
                this.y = platform.y - this.height;
                this.velocity.y = 0;
                this.isGrounded = true;
                this.spinning = false;
                this.springLaunched = false; // Clear spring launch on landing
                if (!wasGrounded && game && game.audioManager) {
                    game.audioManager.playLand();
                }
            }
        });
        
        if (wasGrounded && !this.isGrounded) {
            this.coyoteTime = 0;
        } else if (!this.isGrounded) {
            this.coyoteTime += deltaTime;
        }
        
        if (this.invulnerable) {
            this.invulnerableTimer += deltaTime;
            if (this.invulnerableTimer > 200) {
                this.invulnerableTimer = 0;
            }
        }
    }
    
    hit() {
        this.invulnerable = true;
        this.invulnerableTimer = 0;
        setTimeout(() => {
            this.invulnerable = false;
            this.invulnerableTimer = 0;
        }, 2000);
    }
    
    render(ctx) {
        if (this.invulnerable && this.invulnerableTimer > 100) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (this.spinning) {
            this.drawSpinBall(ctx);
        } else {
            ctx.scale(this.facing, 1);
            this.drawSonic(ctx);
        }
        
        ctx.restore();
    }
    
    drawSonic(ctx) {
        const pixelSize = 1.5;
        
        // Head spikes (quills)
        ctx.fillStyle = '#0044cc';
        // Back spikes
        ctx.fillRect(-15 * pixelSize, -12 * pixelSize, 8 * pixelSize, 4 * pixelSize);
        ctx.fillRect(-17 * pixelSize, -8 * pixelSize, 10 * pixelSize, 4 * pixelSize);
        ctx.fillRect(-18 * pixelSize, -4 * pixelSize, 12 * pixelSize, 4 * pixelSize);
        
        // Top spikes
        ctx.fillRect(-6 * pixelSize, -20 * pixelSize, 12 * pixelSize, 4 * pixelSize);
        ctx.fillRect(-4 * pixelSize, -22 * pixelSize, 8 * pixelSize, 4 * pixelSize);
        
        // Head (main blue part)
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(-8 * pixelSize, -16 * pixelSize, 16 * pixelSize, 12 * pixelSize);
        ctx.fillRect(-6 * pixelSize, -18 * pixelSize, 12 * pixelSize, 4 * pixelSize);
        
        // Face (tan/peach)
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(-4 * pixelSize, -14 * pixelSize, 10 * pixelSize, 8 * pixelSize);
        ctx.fillRect(-2 * pixelSize, -6 * pixelSize, 8 * pixelSize, 2 * pixelSize);
        
        // Eyes (connected white part)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2 * pixelSize, -12 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.fillRect(0 * pixelSize, -10 * pixelSize, 2 * pixelSize, 3 * pixelSize);
        ctx.fillRect(3 * pixelSize, -10 * pixelSize, 2 * pixelSize, 3 * pixelSize);
        
        // Nose
        ctx.fillStyle = '#000000';
        ctx.fillRect(2 * pixelSize, -6 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        
        // Body (blue)
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(-6 * pixelSize, -4 * pixelSize, 12 * pixelSize, 10 * pixelSize);
        ctx.fillRect(-4 * pixelSize, 6 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        // Belly (tan circle)
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(0, 2 * pixelSize, 5 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms (blue)
        ctx.fillStyle = '#0066ff';
        if (this.running) {
            // Running arms
            const armAngle = Math.sin(this.animationFrame * Math.PI / 2) * 0.3;
            ctx.save();
            ctx.rotate(armAngle);
            ctx.fillRect(6 * pixelSize, -2 * pixelSize, 6 * pixelSize, 4 * pixelSize);
            ctx.restore();
            ctx.save();
            ctx.rotate(-armAngle);
            ctx.fillRect(-12 * pixelSize, -2 * pixelSize, 6 * pixelSize, 4 * pixelSize);
            ctx.restore();
        } else {
            ctx.fillRect(6 * pixelSize, 0, 4 * pixelSize, 4 * pixelSize);
            ctx.fillRect(-10 * pixelSize, 0, 4 * pixelSize, 4 * pixelSize);
        }
        
        // Gloves (white)
        ctx.fillStyle = '#ffffff';
        if (this.running) {
            const armAngle = Math.sin(this.animationFrame * Math.PI / 2) * 0.3;
            ctx.save();
            ctx.rotate(armAngle);
            ctx.fillRect(10 * pixelSize, -3 * pixelSize, 5 * pixelSize, 6 * pixelSize);
            ctx.restore();
            ctx.save();
            ctx.rotate(-armAngle);
            ctx.fillRect(-15 * pixelSize, -3 * pixelSize, 5 * pixelSize, 6 * pixelSize);
            ctx.restore();
        } else {
            ctx.fillRect(8 * pixelSize, -1 * pixelSize, 5 * pixelSize, 6 * pixelSize);
            ctx.fillRect(-13 * pixelSize, -1 * pixelSize, 5 * pixelSize, 6 * pixelSize);
        }
        
        // Legs
        const legOffset = this.running ? Math.sin(this.animationFrame * Math.PI / 2) * 3 : 0;
        
        // Blue legs
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(-3 * pixelSize, 12 * pixelSize, 3 * pixelSize, 4 * pixelSize + legOffset);
        ctx.fillRect(0 * pixelSize, 12 * pixelSize, 3 * pixelSize, 4 * pixelSize - legOffset);
        
        // Socks (white stripe on shoes)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4 * pixelSize, 16 * pixelSize + legOffset, 5 * pixelSize, 2 * pixelSize);
        ctx.fillRect(0 * pixelSize, 16 * pixelSize - legOffset, 5 * pixelSize, 2 * pixelSize);
        
        // Shoes (red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-5 * pixelSize, 18 * pixelSize + legOffset, 7 * pixelSize, 5 * pixelSize);
        ctx.fillRect(-1 * pixelSize, 18 * pixelSize - legOffset, 7 * pixelSize, 5 * pixelSize);
        
        // White stripe on shoes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4 * pixelSize, 19 * pixelSize + legOffset, 5 * pixelSize, 1 * pixelSize);
        ctx.fillRect(0 * pixelSize, 19 * pixelSize - legOffset, 5 * pixelSize, 1 * pixelSize);
    }
    
    drawSpinBall(ctx) {
        ctx.rotate(Date.now() * 0.05);
        
        ctx.fillStyle = '#0066ff';
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI / 4);
            ctx.fillRect(-2, -20, 4, 40);
            ctx.restore();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Ring {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.rotation = 0;
        this.velocity = { x: 0, y: 0 };
        this.bouncing = false;
        this.lifetime = 0;
        this.maxLifetime = 5000; // 5 seconds
        this.flickerStart = 3000; // Start flickering after 3 seconds
        this.collectDelay = 0; // Delay before ring can be collected
    }
    
    update(deltaTime) {
        this.rotation += deltaTime * 0.005;
        
        if (this.collectDelay > 0) {
            this.collectDelay -= deltaTime;
        }
        
        if (this.bouncing) {
            this.lifetime += deltaTime;
            
            if (this.lifetime >= this.maxLifetime) {
                this.collected = true;
                return;
            }
            
            // Apply physics
            this.velocity.y += GRAVITY * 0.7;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Ground collision
            if (this.y + this.height >= GROUND_HEIGHT) {
                this.y = GROUND_HEIGHT - this.height;
                this.velocity.y *= -0.5;
                this.velocity.x *= 0.8;
                
                if (Math.abs(this.velocity.y) < 1) {
                    this.velocity.x *= 0.9;
                }
            }
        }
    }
    
    render(ctx) {
        // Flicker effect when about to disappear
        if (this.bouncing && this.lifetime > this.flickerStart) {
            const flickerRate = (this.lifetime - this.flickerStart) / (this.maxLifetime - this.flickerStart);
            if (Math.floor(flickerRate * 10) % 3 === 0) return; // Less aggressive flickering
        }
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Add glow effect for bouncing rings
        if (this.bouncing) {
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 10;
        }
        
        // Draw ring (same style for both normal and bouncing)
        ctx.strokeStyle = '#ffdd00';
        ctx.lineWidth = this.bouncing ? 5 : 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Base Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.destroyed = false;
        this.points = 100;
        this.animationFrame = 0;
    }
    
    update(deltaTime, game) {
        if (this.destroyed) return;
        this.animationFrame = (this.animationFrame + 0.02) % 2;
    }
    
    render(ctx) {
        // Override in subclasses
    }
    
    checkCollision(sonic) {
        if (this.destroyed) return false;
        
        const dx = (sonic.x + sonic.width/2) - (this.x + this.width/2);
        const dy = (sonic.y + sonic.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 40;
    }
    
    takeDamage(fromAbove) {
        this.destroyed = true;
        return true;
    }
}

// Walking Robot Enemy (Original)
class WalkingRobot extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.velocity = { x: -0.5, y: 0 };
        this.patrolStart = x - 50;
        this.patrolEnd = x + 50;
    }
    
    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.destroyed) return;
        
        this.x += this.velocity.x;
        
        if (this.x <= this.patrolStart || this.x >= this.patrolEnd) {
            this.velocity.x *= -1;
        }
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        const pixelSize = 2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-12 * pixelSize, -10 * pixelSize, 24 * pixelSize, 16 * pixelSize);
        
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-10 * pixelSize, -8 * pixelSize, 20 * pixelSize, 12 * pixelSize);
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(-8 * pixelSize, -12 * pixelSize, 3 * pixelSize, 4 * pixelSize);
        ctx.fillRect(5 * pixelSize, -12 * pixelSize, 3 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6 * pixelSize, -6 * pixelSize, 4 * pixelSize, 4 * pixelSize);
        ctx.fillRect(2 * pixelSize, -6 * pixelSize, 4 * pixelSize, 4 * pixelSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(-5 * pixelSize, -5 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        ctx.fillRect(3 * pixelSize, -5 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        
        ctx.fillStyle = '#333333';
        const legOffset = Math.sin(this.animationFrame * Math.PI) * 2;
        ctx.beginPath();
        ctx.arc(-8 * pixelSize, 8 * pixelSize + legOffset, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8 * pixelSize, 8 * pixelSize - legOffset, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Flying Bee Enemy
class FlyingBee extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.centerX = x;
        this.centerY = y;
        this.radius = 100;
        this.angle = 0;
        this.wingFlap = 0;
        this.points = 150;
        this.width = 40;
        this.height = 40;
    }
    
    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.destroyed) return;
        
        // Circular patrol pattern
        this.angle += 0.02;
        this.x = this.centerX + Math.cos(this.angle) * this.radius;
        this.y = this.centerY + Math.sin(this.angle * 2) * 30; // Figure-8 pattern
        
        // Wing flapping
        this.wingFlap = (this.wingFlap + 0.3) % (Math.PI * 2);
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        const pixelSize = 2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // Direction facing
        const direction = Math.cos(this.angle) < 0 ? -1 : 1;
        ctx.scale(direction, 1);
        
        // Bee body
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(-10 * pixelSize, -8 * pixelSize, 20 * pixelSize, 16 * pixelSize);
        
        // Black stripes
        ctx.fillStyle = '#000000';
        for (let i = -8; i <= 8; i += 8) {
            ctx.fillRect(i * pixelSize, -8 * pixelSize, 4 * pixelSize, 16 * pixelSize);
        }
        
        // Head
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-12 * pixelSize, 0, 6 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-14 * pixelSize, -2 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        ctx.fillRect(-14 * pixelSize, 2 * pixelSize, 2 * pixelSize, 2 * pixelSize);
        
        // Wings
        const wingOffset = Math.sin(this.wingFlap) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-2 * pixelSize, (-12 - wingOffset) * pixelSize, 8 * pixelSize, 4 * pixelSize);
        ctx.fillRect(-2 * pixelSize, (8 + wingOffset) * pixelSize, 8 * pixelSize, 4 * pixelSize);
        
        // Stinger
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(10 * pixelSize, 0);
        ctx.lineTo(14 * pixelSize, 0);
        ctx.lineTo(12 * pixelSize, -2 * pixelSize);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Shield Robot Enemy
class ShieldRobot extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.shieldActive = true;
        this.shieldCooldown = 0;
        this.points = 200;
        this.facing = 1;
        this.width = 50;
        this.height = 50;
    }
    
    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.destroyed) return;
        
        // Shield management
        if (!this.shieldActive && this.shieldCooldown > 0) {
            this.shieldCooldown--;
            if (this.shieldCooldown === 0) {
                this.shieldActive = true;
            }
        }
        
        // Face Sonic
        if (game.player) {
            this.facing = game.player.x > this.x ? 1 : -1;
        }
    }
    
    takeDamage(fromAbove) {
        if (this.shieldActive && !fromAbove) {
            // Shield blocks frontal attacks
            this.shieldCooldown = 120;
            this.shieldActive = false;
            return false; // Attack blocked
        }
        this.destroyed = true;
        return true;
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        const pixelSize = 2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(this.facing, 1);
        
        // Robot body
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-12 * pixelSize, -10 * pixelSize, 24 * pixelSize, 20 * pixelSize);
        
        // Head
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-10 * pixelSize, -16 * pixelSize, 20 * pixelSize, 8 * pixelSize);
        
        // Eye
        ctx.fillStyle = this.shieldActive ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, -12 * pixelSize, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-10 * pixelSize, 10 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        ctx.fillRect(2 * pixelSize, 10 * pixelSize, 8 * pixelSize, 6 * pixelSize);
        
        // Shield
        if (this.shieldActive) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 20 * pixelSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shield glow effect
            const glowPhase = (Date.now() % 1000) / 1000;
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.3 + glowPhase * 0.3})`;
            ctx.lineWidth = 6;
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Spike Ball Enemy
class SpikeBall extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.centerX = x;
        this.centerY = y - 100;
        this.swingRadius = 100;
        this.angle = 0;
        this.points = 250;
        this.rotationAngle = 0;
        this.width = 50;
        this.height = 50;
    }
    
    update(deltaTime, game) {
        super.update(deltaTime, game);
        if (this.destroyed) return;
        
        // Pendulum swing
        this.angle = Math.sin(Date.now() * 0.001) * Math.PI / 3;
        this.x = this.centerX + Math.sin(this.angle) * this.swingRadius;
        this.y = this.centerY + Math.cos(this.angle) * this.swingRadius;
        
        // Ball rotation
        this.rotationAngle += 0.05;
    }
    
    takeDamage(fromAbove) {
        // Spike balls can't be defeated
        return false;
    }
    
    render(ctx) {
        if (this.destroyed) return;
        
        const pixelSize = 2;
        
        ctx.save();
        
        // Draw chain
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.stroke();
        
        // Draw spike ball
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle);
        
        // Ball core
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(0, 0, 12 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes
        ctx.fillStyle = '#34495e';
        for (let i = 0; i < 8; i++) {
            const spikeAngle = (i / 8) * Math.PI * 2;
            ctx.save();
            ctx.rotate(spikeAngle);
            ctx.beginPath();
            ctx.moveTo(12 * pixelSize, 0);
            ctx.lineTo(18 * pixelSize, -2 * pixelSize);
            ctx.lineTo(18 * pixelSize, 2 * pixelSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    render(ctx) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#228b22';
        ctx.fillRect(this.x, this.y, this.width, 10);
    }
}

class Spring {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 20;
        this.compressed = false;
        this.compressionTimer = 0;
        this.cooldown = false;
    }
    
    activate() {
        this.compressed = true;
        this.compressionTimer = 200;
        this.cooldown = true;
        setTimeout(() => { this.cooldown = false; }, 500);
    }
    
    update(deltaTime) {
        if (this.compressed) {
            this.compressionTimer -= deltaTime;
            if (this.compressionTimer <= 0) {
                this.compressed = false;
            }
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#ff0000';
        const height = this.compressed ? this.height / 2 : this.height;
        ctx.fillRect(this.x, this.y + (this.height - height), this.width, height);
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 5, this.y + (this.height - height), this.width - 10, 5);
    }
}

class Checkpoint {
    constructor(x, y, isGoal = false) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 80;
        this.activated = false;
        this.isGoal = isGoal;
        this.animationFrame = 0;
        this.flagWave = 0;
    }
    
    update(deltaTime) {
        this.animationFrame += deltaTime * 0.001;
        this.flagWave = Math.sin(this.animationFrame * 3) * 0.1;
    }
    
    activate() {
        if (!this.activated) {
            this.activated = true;
            return true;
        }
        return false;
    }
    
    render(ctx) {
        const pixelSize = 2;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height);
        
        // Pole
        ctx.fillStyle = this.activated ? '#FFD700' : '#C0C0C0';
        ctx.fillRect(-2 * pixelSize, -40 * pixelSize, 4 * pixelSize, 40 * pixelSize);
        
        // Ball on top
        ctx.beginPath();
        ctx.arc(0, -40 * pixelSize, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Flag
        ctx.save();
        ctx.translate(2 * pixelSize, -35 * pixelSize);
        ctx.rotate(this.flagWave);
        
        if (this.isGoal) {
            // Goal flag - checkered pattern
            const flagWidth = 20 * pixelSize;
            const flagHeight = 15 * pixelSize;
            const squareSize = 5 * pixelSize;
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 4; col++) {
                    ctx.fillStyle = (row + col) % 2 === 0 ? '#000000' : '#FFFFFF';
                    ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
                }
            }
            
            // Red border
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, flagWidth, flagHeight);
        } else {
            // Checkpoint flag - solid color
            ctx.fillStyle = this.activated ? '#00FF00' : '#FF0000';
            ctx.fillRect(0, 0, 20 * pixelSize, 15 * pixelSize);
            
            // Star symbol
            ctx.fillStyle = '#FFFFFF';
            ctx.save();
            ctx.translate(10 * pixelSize, 7.5 * pixelSize);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 144 - 90) * Math.PI / 180;
                const r = i % 2 === 0 ? 5 * pixelSize : 2.5 * pixelSize;
                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        ctx.restore();
        
        // Base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-5 * pixelSize, -2 * pixelSize, 10 * pixelSize, 4 * pixelSize);
        
        ctx.restore();
    }
}

class Level {
    constructor() {
        this.width = 6000;  // Doubled level length
        this.height = 400;
        
        // Animation properties
        this.animationTime = 0;
        this.clouds = [];
        this.birds = [];
        this.backgroundLayers = [];
        
        // Initialize animated elements
        this.initializeAnimations();
    }
    
    initializeAnimations() {
        // Create cloud objects with position and speed
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: 50 + Math.random() * 100,
                speed: 0.5 + Math.random() * 1,
                size: 0.8 + Math.random() * 0.4
            });
        }
        
        // Create birds
        for (let i = 0; i < 3; i++) {
            this.birds.push({
                x: Math.random() * this.width,
                y: 100 + Math.random() * 150,
                speed: 1 + Math.random() * 2,
                wingPhase: Math.random() * Math.PI * 2,
                amplitude: 20 + Math.random() * 20
            });
        }
        
        // Create background layers for parallax
        this.backgroundLayers = [
            { speed: 0.2, elements: [] }, // Far mountains
            { speed: 0.5, elements: [] }, // Mid hills
            { speed: 0.8, elements: [] }  // Near decorations
        ];
        
        // Waterfall properties
        this.waterfallParticles = [];
        this.waterfallX = 1800;
        this.initializeWaterfall();
        
        // Fireflies/particles
        this.fireflies = [];
        this.initializeFireflies();
    }
    
    initializeFireflies() {
        // Create floating fireflies
        for (let i = 0; i < 15; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: 50 + Math.random() * 250,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3,
                brightness: Math.random(),
                brightSpeed: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 2
            });
        }
    }
    
    initializeWaterfall() {
        // Create waterfall particles
        for (let i = 0; i < 50; i++) {
            this.waterfallParticles.push({
                x: this.waterfallX + Math.random() * 40 - 20,
                y: Math.random() * 200,
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    create(game) {
        // Section 1: Basic platforms (0-1000)
        game.platforms.push(new Platform(400, 250, 200, 20));
        game.platforms.push(new Platform(700, 200, 150, 20));
        game.platforms.push(new Platform(1000, 250, 200, 20));
        game.platforms.push(new Platform(1300, 180, 100, 20));
        game.platforms.push(new Platform(1500, 220, 180, 20));
        
        // Section 2: Stepped platforms (2000-3000)
        game.platforms.push(new Platform(2000, 280, 150, 20));
        game.platforms.push(new Platform(2200, 240, 150, 20));
        game.platforms.push(new Platform(2400, 200, 150, 20));
        game.platforms.push(new Platform(2600, 160, 100, 20));
        game.platforms.push(new Platform(2800, 200, 200, 20));
        
        // Section 3: Gap jumping (3000-4000)
        game.platforms.push(new Platform(3000, 250, 100, 20));
        game.platforms.push(new Platform(3200, 230, 100, 20));
        game.platforms.push(new Platform(3400, 210, 100, 20));
        game.platforms.push(new Platform(3600, 190, 100, 20));
        game.platforms.push(new Platform(3800, 250, 200, 20));
        
        // Section 4: Complex platforming (4000-5000)
        game.platforms.push(new Platform(4000, 280, 80, 20));
        game.platforms.push(new Platform(4150, 240, 80, 20));
        game.platforms.push(new Platform(4300, 200, 80, 20));
        game.platforms.push(new Platform(4450, 160, 80, 20));
        game.platforms.push(new Platform(4600, 200, 150, 20));
        game.platforms.push(new Platform(4800, 250, 200, 20));
        
        // Section 5: Final platforms (5000-6000)
        game.platforms.push(new Platform(5000, 230, 150, 20));
        game.platforms.push(new Platform(5200, 190, 100, 20));
        game.platforms.push(new Platform(5400, 150, 100, 20));
        game.platforms.push(new Platform(5600, 200, 200, 20));
        game.platforms.push(new Platform(5850, 250, 150, 20));
        
        // Place rings throughout the level
        // Section 1 rings
        for (let i = 0; i < 20; i++) {
            const x = 300 + i * 40;
            let y = 220;
            for (const platform of game.platforms) {
                if (x >= platform.x && x <= platform.x + platform.width) {
                    y = platform.y - 40;
                }
            }
            game.rings.push(new Ring(x, y));
        }
        
        // Floating ring formations
        for (let i = 0; i < 8; i++) {
            game.rings.push(new Ring(800 + i * 40, 120));
        }
        
        // Section 2 rings - stepped pattern
        for (let i = 0; i < 5; i++) {
            game.rings.push(new Ring(2100 + i * 40, 240 - i * 20));
        }
        for (let i = 0; i < 5; i++) {
            game.rings.push(new Ring(2300 + i * 40, 140 + i * 20));
        }
        
        // Section 3 rings - over gaps
        for (let i = 0; i < 15; i++) {
            game.rings.push(new Ring(3050 + i * 80, 180));
        }
        
        // Section 4 rings - challenging placement
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI;
            game.rings.push(new Ring(4200 + i * 40, 150 - Math.sin(angle) * 50));
        }
        
        // Section 5 rings - bonus area
        for (let i = 0; i < 20; i++) {
            game.rings.push(new Ring(5100 + i * 35, 100 + (i % 2) * 40));
        }
        
        // Section 1: Basic enemies
        game.enemies.push(new WalkingRobot(500, 290));
        game.enemies.push(new WalkingRobot(900, 290));
        game.enemies.push(new FlyingBee(1100, 200));
        game.enemies.push(new WalkingRobot(1600, 290));
        
        // Section 2: Mixed enemies (2000-3000)
        game.enemies.push(new ShieldRobot(2100, 290));
        game.enemies.push(new FlyingBee(2300, 180));
        game.enemies.push(new WalkingRobot(2500, 290));
        game.enemies.push(new SpikeBall(2700, 350));
        game.enemies.push(new WalkingRobot(2900, 290));
        
        // Section 3: Challenging area (3000-4000)
        game.enemies.push(new FlyingBee(3100, 200));
        game.enemies.push(new ShieldRobot(3300, 290));
        game.enemies.push(new SpikeBall(3500, 350));
        game.enemies.push(new WalkingRobot(3700, 290));
        game.enemies.push(new FlyingBee(3900, 180));
        
        // Section 4: Gauntlet (4000-5000)
        game.enemies.push(new ShieldRobot(4100, 290));
        game.enemies.push(new ShieldRobot(4200, 290));
        game.enemies.push(new SpikeBall(4400, 350));
        game.enemies.push(new FlyingBee(4500, 200));
        game.enemies.push(new FlyingBee(4600, 180));
        game.enemies.push(new WalkingRobot(4800, 290));
        
        // Section 5: Final challenge (5000-6000)
        game.enemies.push(new SpikeBall(5100, 350));
        game.enemies.push(new ShieldRobot(5300, 290));
        game.enemies.push(new FlyingBee(5400, 200));
        game.enemies.push(new SpikeBall(5600, 350));
        game.enemies.push(new WalkingRobot(5700, 290));
        game.enemies.push(new ShieldRobot(5800, 290));
        
        // Springs throughout the level
        game.springs.push(new Spring(650, 300));
        game.springs.push(new Spring(1250, 300));
        game.springs.push(new Spring(1800, 300));
        game.springs.push(new Spring(2550, 140));  // Platform at y=160, spring at platform-20
        game.springs.push(new Spring(3150, 300));
        game.springs.push(new Spring(3750, 230));   // Platform at y=250, spring at platform-20
        game.springs.push(new Spring(4050, 300));
        game.springs.push(new Spring(4550, 140));   // Platform at y=160, spring at platform-20
        game.springs.push(new Spring(5150, 300));
        game.springs.push(new Spring(5500, 130));   // Platform at y=150, spring at platform-20
        game.springs.push(new Spring(5900, 300));
        
        // Checkpoints and goal
        game.checkpoints.push(new Checkpoint(1500, 240)); // End of section 1
        game.checkpoints.push(new Checkpoint(2500, 240)); // Middle of section 2  
        game.checkpoints.push(new Checkpoint(3500, 240)); // Middle of section 3
        game.checkpoints.push(new Checkpoint(4500, 240)); // Middle of section 4
        game.checkpoints.push(new Checkpoint(5950, 240, true)); // Goal flag at end
    }
    
    update(deltaTime, camera) {
        this.animationTime += deltaTime * 0.001;
        
        // Update cloud positions
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -100) {
                cloud.x = this.width + 100;
            }
        });
        
        // Update bird positions
        this.birds.forEach(bird => {
            bird.x -= bird.speed;
            bird.wingPhase += deltaTime * 0.01;
            if (bird.x < -50) {
                bird.x = this.width + 50;
                bird.y = 100 + Math.random() * 150;
            }
        });
        
        // Update waterfall particles
        this.waterfallParticles.forEach(particle => {
            particle.y += particle.speed;
            if (particle.y > GROUND_HEIGHT + 50) {
                particle.y = 0;
                particle.x = this.waterfallX + Math.random() * 40 - 20;
            }
        });
        
        // Update fireflies
        this.fireflies.forEach(firefly => {
            firefly.x += firefly.vx;
            firefly.y += firefly.vy;
            firefly.brightness += firefly.brightSpeed;
            
            if (firefly.brightness > 1 || firefly.brightness < 0) {
                firefly.brightSpeed *= -1;
            }
            
            // Wrap around screen
            if (firefly.x < 0) firefly.x = this.width;
            if (firefly.x > this.width) firefly.x = 0;
            if (firefly.y < 50) firefly.vy = Math.abs(firefly.vy);
            if (firefly.y > 350) firefly.vy = -Math.abs(firefly.vy);
            
            // Random direction changes
            if (Math.random() < 0.01) {
                firefly.vx = (Math.random() - 0.5) * 0.5;
                firefly.vy = (Math.random() - 0.5) * 0.3;
            }
        });
    }
    
    render(ctx, camera) {
        // Draw parallax background layers
        this.renderBackgroundLayers(ctx, camera);
        
        // Draw animated clouds
        this.clouds.forEach(cloud => {
            this.drawAnimatedCloud(ctx, cloud.x, cloud.y, cloud.size);
        });
        
        // Draw birds
        this.birds.forEach(bird => {
            const birdY = bird.y + Math.sin(this.animationTime * 2 + bird.wingPhase) * bird.amplitude;
            this.drawBird(ctx, bird.x, birdY, bird.wingPhase);
        });
        
        // Ground layers
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, GROUND_HEIGHT + 40, this.width, canvas.height - GROUND_HEIGHT);
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, GROUND_HEIGHT + 20, this.width, 20);
        
        ctx.fillStyle = '#228b22';
        ctx.fillRect(0, GROUND_HEIGHT, this.width, 20);
        
        const pattern = 40;
        ctx.fillStyle = '#33bb33';
        for (let x = 0; x < this.width; x += pattern * 2) {
            ctx.fillRect(x, GROUND_HEIGHT, pattern, 20);
        }
        
        // Animated grass
        for (let x = 0; x < this.width; x += 80) {
            const grassHeight = 15 + Math.sin(x * 0.02) * 5;
            ctx.fillStyle = '#44cc44';
            for (let i = 0; i < 5; i++) {
                const bladeX = x + i * 15 + Math.sin(this.animationTime + x * 0.1) * 3;
                const bladeHeight = grassHeight + Math.sin(this.animationTime * 2 + i) * 5;
                const swayOffset = Math.sin(this.animationTime * 1.5 + x * 0.01 + i) * 2;
                
                ctx.beginPath();
                ctx.moveTo(bladeX, GROUND_HEIGHT);
                ctx.quadraticCurveTo(
                    bladeX + 2 + swayOffset, 
                    GROUND_HEIGHT - bladeHeight / 2, 
                    bladeX + 4 + swayOffset * 2, 
                    GROUND_HEIGHT - bladeHeight
                );
                ctx.quadraticCurveTo(
                    bladeX + 2 + swayOffset, 
                    GROUND_HEIGHT - bladeHeight / 2, 
                    bladeX, 
                    GROUND_HEIGHT
                );
                ctx.fill();
            }
        }
        
        // Animated palm trees
        for (let x = 200; x < this.width; x += 500) {
            this.drawAnimatedPalmTree(ctx, x, GROUND_HEIGHT);
        }
        
        // Draw waterfall
        this.drawWaterfall(ctx);
        
        // Draw fireflies
        this.fireflies.forEach(firefly => {
            const alpha = firefly.brightness * 0.8;
            ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
            ctx.shadowBlur = firefly.size * 3;
            ctx.shadowColor = 'rgba(255, 255, 100, 0.5)';
            
            ctx.beginPath();
            ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        });
    }
    
    drawWaterfall(ctx) {
        // Draw waterfall background rocks
        ctx.fillStyle = '#696969';
        ctx.fillRect(this.waterfallX - 30, 0, 80, GROUND_HEIGHT);
        
        // Draw water source
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(this.waterfallX - 20, 0, 40, 20);
        
        // Draw waterfall particles
        this.waterfallParticles.forEach(particle => {
            ctx.fillStyle = `rgba(135, 206, 250, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw splash at bottom
        const splashTime = this.animationTime * 3;
        ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
        for (let i = 0; i < 5; i++) {
            const splashX = this.waterfallX + (i - 2) * 15;
            const splashY = GROUND_HEIGHT + Math.sin(splashTime + i) * 10;
            const splashSize = 5 + Math.sin(splashTime + i * 0.5) * 3;
            
            ctx.beginPath();
            ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw mist effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        const mistRadius = 30 + Math.sin(splashTime * 0.5) * 10;
        ctx.beginPath();
        ctx.arc(this.waterfallX, GROUND_HEIGHT, mistRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderBackgroundLayers(ctx, camera) {
        // Draw distant mountains
        ctx.fillStyle = '#9370DB';
        for (let i = 0; i < 5; i++) {
            const mountainX = i * 600 - (camera.x * 0.2) % 600;
            const mountainHeight = 200 + Math.sin(i * 1.5) * 50;
            ctx.beginPath();
            ctx.moveTo(mountainX, GROUND_HEIGHT);
            ctx.lineTo(mountainX + 300, GROUND_HEIGHT - mountainHeight);
            ctx.lineTo(mountainX + 600, GROUND_HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw mid-distance hills
        ctx.fillStyle = '#7B68EE';
        for (let i = 0; i < 8; i++) {
            const hillX = i * 400 - (camera.x * 0.5) % 400;
            const hillHeight = 120 + Math.sin(i * 2) * 30;
            ctx.beginPath();
            ctx.arc(hillX + 200, GROUND_HEIGHT, hillHeight, Math.PI, 0, true);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    drawAnimatedCloud(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const wobble = Math.sin(this.animationTime + x * 0.01) * 2;
        
        ctx.beginPath();
        ctx.arc(x + wobble, y, 25 * size, 0, Math.PI * 2);
        ctx.arc(x + 25 * size + wobble, y - 5, 35 * size, 0, Math.PI * 2);
        ctx.arc(x + 50 * size + wobble, y, 25 * size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBird(ctx, x, y, wingPhase) {
        ctx.fillStyle = '#333333';
        
        // Body
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        const wingAngle = Math.sin(wingPhase) * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.quadraticCurveTo(x - 15, y - 5 + wingAngle * 10, x - 20, y + wingAngle * 15);
        ctx.quadraticCurveTo(x - 15, y, x - 5, y);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 5, y);
        ctx.quadraticCurveTo(x + 15, y - 5 - wingAngle * 10, x + 20, y - wingAngle * 15);
        ctx.quadraticCurveTo(x + 15, y, x + 5, y);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x - 12, y + 2);
        ctx.lineTo(x - 8, y + 2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawAnimatedPalmTree(ctx, x, y) {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 10, y - 100, 20, 100);
        
        // Add trunk texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y - i * 20);
            ctx.lineTo(x + 10, y - i * 20 - 5);
            ctx.stroke();
        }
        
        // Animated leaves
        ctx.fillStyle = '#228B22';
        const sway = Math.sin(this.animationTime * 0.8 + x * 0.01) * 0.1;
        
        for (let i = 0; i < 5; i++) {
            const baseAngle = (i / 5) * Math.PI - Math.PI / 2;
            const angle = baseAngle + sway;
            const leafX = x + Math.cos(angle) * 40;
            const leafY = y - 100 + Math.sin(angle) * 20;
            
            ctx.beginPath();
            ctx.moveTo(x, y - 100);
            
            // Add more detail to leaves
            for (let j = 0; j < 3; j++) {
                const segmentAngle = angle + (j - 1) * 0.1;
                const segmentX = x + Math.cos(segmentAngle) * (30 + j * 10);
                const segmentY = y - 100 + Math.sin(segmentAngle) * (15 + j * 5);
                ctx.quadraticCurveTo(segmentX, segmentY - 10, segmentX + Math.cos(segmentAngle) * 10, segmentY);
            }
            
            ctx.quadraticCurveTo(leafX, leafY - 10, x, y - 100);
            ctx.fill();
        }
        
        // Add coconuts
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 3; i++) {
            const coconutAngle = i * 2 + this.animationTime * 0.5;
            const coconutX = x + Math.cos(coconutAngle) * 15;
            const coconutY = y - 95 + Math.sin(coconutAngle) * 5;
            ctx.beginPath();
            ctx.arc(coconutX, coconutY, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

const game = new Game();