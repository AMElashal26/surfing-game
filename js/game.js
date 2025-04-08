class SurfingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.score = 0;
        this.gameOver = false;
        this.waves = [];
        this.lastWaveTime = 0;
        this.waveInterval = 2000;
        this.difficulty = 1;
        this.duckies = [];
        this.lastDuckieTime = 0;
        this.duckieInterval = 2000;

        // Surfer properties
        this.surfer = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 40,
            height: 60,
            velocity: { x: 0, y: 0 },
            rotation: 0,
            isJumping: false,
            jumpForce: -15,
            gravity: 0.8
        };

        // Controls
        this.keys = {
            left: false,
            right: false,
            space: false
        };

        this.setupEventListeners();
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === ' ' && !this.surfer.isJumping) {
                this.keys.space = true;
                this.surfer.isJumping = true;
                this.surfer.velocity.y = this.surfer.jumpForce;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === ' ') this.keys.space = false;
        });
    }

    createWave() {
        const now = Date.now();
        if (now - this.lastWaveTime > this.waveInterval) {
            this.waves.push({
                x: 0,
                y: this.canvas.height - 50,
                width: this.canvas.width,
                height: 30,
                amplitude: Math.random() * 20 + 10,
                frequency: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2
            });
            this.lastWaveTime = now;
        }
    }

    updateWaves() {
        this.waves.forEach(wave => {
            wave.phase += 0.05;
        });
    }

    createDuckie() {
        const now = Date.now();
        if (now - this.lastDuckieTime > this.duckieInterval) {
            const size = 30 + Math.random() * 20;
            this.duckies.push({
                x: this.canvas.width,
                y: this.canvas.height - 50 - size,
                width: size,
                height: size,
                speed: 3 + this.difficulty,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)` // Yellow to orange colors
            });
            this.lastDuckieTime = now;
            this.duckieInterval = Math.max(500, 2000 - (this.difficulty * 200)); // Decrease interval with difficulty
        }
    }

    updateDuckies() {
        this.duckies = this.duckies.filter(duckie => {
            duckie.x -= duckie.speed;
            
            // Check collision with surfer
            if (this.checkCollision(duckie)) {
                if (!this.surfer.isJumping) {
                    this.gameOver = true;
                }
                return false;
            }
            
            return duckie.x + duckie.width > 0;
        });
    }

    checkCollision(duckie) {
        return (
            this.surfer.x < duckie.x + duckie.width &&
            this.surfer.x + this.surfer.width > duckie.x &&
            this.surfer.y < duckie.y + duckie.height &&
            this.surfer.y + this.surfer.height > duckie.y
        );
    }

    updateSurfer() {
        // Horizontal movement
        if (this.keys.left) this.surfer.velocity.x = -5;
        else if (this.keys.right) this.surfer.velocity.x = 5;
        else this.surfer.velocity.x *= 0.9;

        // Vertical movement (jumping)
        if (this.surfer.isJumping) {
            this.surfer.velocity.y += this.surfer.gravity;
            this.surfer.y += this.surfer.velocity.y;

            // Check if surfer has landed
            if (this.surfer.y >= this.canvas.height - 100) {
                this.surfer.y = this.canvas.height - 100;
                this.surfer.isJumping = false;
                this.surfer.velocity.y = 0;
            }
        }

        // Keep surfer within bounds
        this.surfer.x = Math.max(0, Math.min(this.canvas.width - this.surfer.width, this.surfer.x + this.surfer.velocity.x));

        // Update rotation based on movement
        this.surfer.rotation = this.surfer.velocity.x * 0.1;
    }

    drawWaves() {
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, wave.y);

            for (let x = 0; x < wave.width; x += 5) {
                const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
                this.ctx.lineTo(x, y);
            }

            this.ctx.lineTo(wave.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();

            const gradient = this.ctx.createLinearGradient(0, wave.y, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgba(0, 191, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 139, 0.8)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawSurfer() {
        this.ctx.save();
        this.ctx.translate(this.surfer.x + this.surfer.width / 2, this.surfer.y + this.surfer.height / 2);
        this.ctx.rotate(this.surfer.rotation);

        // Draw surfboard
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(-this.surfer.width / 2, -this.surfer.height / 2, this.surfer.width, this.surfer.height);

        // Draw surfer
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.arc(0, -10, 10, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawDuckie(duckie) {
        this.ctx.save();
        this.ctx.translate(duckie.x + duckie.width/2, duckie.y + duckie.height/2);
        
        // Draw duckie body
        this.ctx.fillStyle = duckie.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, duckie.width/2, duckie.height/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw duckie head
        this.ctx.beginPath();
        this.ctx.arc(duckie.width/4, -duckie.height/4, duckie.width/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw beak
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(duckie.width/3, -duckie.height/4);
        this.ctx.lineTo(duckie.width/2, -duckie.height/4);
        this.ctx.lineTo(duckie.width/3, 0);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(duckie.width/3, -duckie.height/3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    updateScore() {
        this.score += Math.abs(this.surfer.velocity.x) * 0.1;
        document.getElementById('score').textContent = Math.floor(this.score);
    }

    updateDifficulty() {
        this.difficulty = Math.min(5, 1 + Math.floor(this.score / 1000));
    }

    gameLoop() {
        if (this.gameOver) {
            this.drawGameOver();
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.createWave();
        this.updateWaves();
        this.createDuckie();
        this.updateDuckies();
        this.updateSurfer();
        this.updateScore();
        this.updateDifficulty();

        this.drawWaves();
        this.duckies.forEach(duckie => this.drawDuckie(duckie));
        this.drawSurfer();

        requestAnimationFrame(() => this.gameLoop());
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${Math.floor(this.score)}`, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('Press R to Restart', this.canvas.width/2, this.canvas.height/2 + 60);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    let game = new SurfingGame();
    
    // Add restart functionality
    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' && game.gameOver) {
            game = new SurfingGame();
        }
    });
}); 