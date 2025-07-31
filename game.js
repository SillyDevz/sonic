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

document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

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
        this.score = 0;
        this.ringCount = 0;
        this.lives = 3;
        this.time = 0;
        this.gameTime = 0;
        this.lastTime = 0;
        
        this.audioManager = new AudioManager();
        this.sonic = new Sonic(100, 200);
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
        this.gameTime += deltaTime;
        this.time = Math.floor(this.gameTime / 1000);
        
        this.sonic.update(this.keys, deltaTime, this);
        
        this.camera.x = this.sonic.x - canvas.width / 2;
        this.camera.x = Math.max(0, this.camera.x);
        
        this.rings.forEach(ring => {
            ring.update(deltaTime);
        });
        this.enemies.forEach(enemy => enemy.update(deltaTime, this));
        
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
            if (!enemy.destroyed && this.checkCollision(this.sonic, enemy)) {
                if (this.sonic.velocity.y > 0 && this.sonic.y < enemy.y) {
                    enemy.destroyed = true;
                    this.sonic.velocity.y = -10;
                    this.score += 100;
                    this.audioManager.playEnemyHit();
                } else if (!this.sonic.invulnerable) {
                    // Knockback effect
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
                this.sonic.velocity.y = -15;
                spring.activate();
                this.audioManager.playSpring();
                this.sonic.spinning = false;
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
        
        // Reset Sonic position
        this.sonic.x = 100;
        this.sonic.y = 200;
        this.sonic.velocity = { x: 0, y: 0 };
        this.sonic.facing = 1;
        this.sonic.running = false;
        this.sonic.spinning = false;
        this.sonic.invulnerable = true;
        this.sonic.invulnerableTimer = 0;
        
        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
        
        // Remove invulnerability after 3 seconds
        setTimeout(() => {
            this.sonic.invulnerable = false;
            this.sonic.invulnerableTimer = 0;
        }, 3000);
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
        
        this.level.render(ctx);
        this.platforms.forEach(platform => platform.render(ctx));
        this.springs.forEach(spring => spring.render(ctx));
        this.enemies.forEach(enemy => enemy.render(ctx));
        this.rings.forEach(ring => ring.render(ctx));
        
        this.sonic.render(ctx);
        
        ctx.restore();
        
        // Draw audio controls info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, canvas.height - 80, 200, 70);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Audio Controls:', 20, canvas.height - 60);
        ctx.fillText(`M - Mute (${this.audioManager.muted ? 'ON' : 'OFF'})`, 20, canvas.height - 40);
        ctx.fillText(`+/- Volume (${Math.round(this.audioManager.masterVolume * 100)}%)`, 20, canvas.height - 20);
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
        
        if ((keys[' '] || keys['ArrowUp']) && (this.isGrounded || this.coyoteTime < this.maxCoyoteTime)) {
            const speedBonus = Math.min(Math.abs(this.velocity.x) * 0.4, 3);
            this.velocity.y = -(this.jumpPower + speedBonus);
            this.spinning = true;
            this.coyoteTime = this.maxCoyoteTime;
            if (game && game.audioManager) {
                game.audioManager.playJump();
            }
        }
        
        if (!keys[' '] && !keys['ArrowUp'] && this.velocity.y < -2 && !this.isGrounded) {
            this.velocity.y *= 0.85;
        }
        
        const gravityMultiplier = this.velocity.y < 0 ? 0.9 : 1.1;
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

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocity = { x: -0.5, y: 0 };
        this.destroyed = false;
        this.patrolStart = x - 50;
        this.patrolEnd = x + 50;
    }
    
    update(deltaTime, game) {
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
        ctx.beginPath();
        ctx.arc(-8 * pixelSize, 8 * pixelSize, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8 * pixelSize, 8 * pixelSize, 4 * pixelSize, 0, Math.PI * 2);
        ctx.fill();
        
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

class Level {
    constructor() {
        this.width = 3000;
        this.height = 400;
    }
    
    create(game) {
        // Create platforms first
        game.platforms.push(new Platform(400, 250, 200, 20));
        game.platforms.push(new Platform(700, 200, 150, 20));
        game.platforms.push(new Platform(1000, 250, 200, 20));
        game.platforms.push(new Platform(1300, 180, 100, 20));
        game.platforms.push(new Platform(1500, 220, 180, 20));
        
        // Place rings above platforms to avoid overlap
        // First line of rings - adjusted to be above ground level
        for (let i = 0; i < 50; i++) {
            const x = 300 + i * 40;
            let y = 220; // Default height above ground
            
            // Check if this x position overlaps with any platform
            for (const platform of game.platforms) {
                if (x >= platform.x && x <= platform.x + platform.width) {
                    // Place ring above the platform
                    y = platform.y - 40;
                }
            }
            
            game.rings.push(new Ring(x, y));
        }
        
        // Second line of rings - already positioned well above platforms
        for (let i = 0; i < 10; i++) {
            game.rings.push(new Ring(800 + i * 40, 120)); // Moved up slightly from 150 to 120
        }
        
        game.enemies.push(new Enemy(500, 290));
        game.enemies.push(new Enemy(900, 290));
        game.enemies.push(new Enemy(1100, 220));
        game.enemies.push(new Enemy(1600, 290));
        
        game.springs.push(new Spring(650, 300));
        game.springs.push(new Spring(1250, 300));
    }
    
    render(ctx) {
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
        
        for (let x = 0; x < this.width; x += 80) {
            const grassHeight = 15 + Math.sin(x * 0.02) * 5;
            ctx.fillStyle = '#44cc44';
            for (let i = 0; i < 5; i++) {
                const bladeX = x + i * 15 + Math.random() * 10;
                const bladeHeight = grassHeight + Math.random() * 10;
                ctx.beginPath();
                ctx.moveTo(bladeX, GROUND_HEIGHT);
                ctx.quadraticCurveTo(bladeX + 2, GROUND_HEIGHT - bladeHeight / 2, bladeX + 4, GROUND_HEIGHT - bladeHeight);
                ctx.quadraticCurveTo(bladeX + 2, GROUND_HEIGHT - bladeHeight / 2, bladeX, GROUND_HEIGHT);
                ctx.fill();
            }
        }
        
        const cloudY = 50;
        for (let x = 100; x < this.width; x += 300) {
            this.drawCloud(ctx, x, cloudY + Math.sin(x * 0.001) * 20);
        }
        
        for (let x = 200; x < this.width; x += 500) {
            this.drawPalmTree(ctx, x, GROUND_HEIGHT);
        }
    }
    
    drawCloud(ctx, x, y) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPalmTree(ctx, x, y) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 10, y - 100, 20, 100);
        
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI - Math.PI / 2;
            const leafX = x + Math.cos(angle) * 40;
            const leafY = y - 100 + Math.sin(angle) * 20;
            
            ctx.beginPath();
            ctx.moveTo(x, y - 100);
            ctx.quadraticCurveTo(leafX, leafY - 20, leafX + Math.cos(angle) * 20, leafY);
            ctx.quadraticCurveTo(leafX, leafY - 10, x, y - 100);
            ctx.fill();
        }
    }
}

const game = new Game();