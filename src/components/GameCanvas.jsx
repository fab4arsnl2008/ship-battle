import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

// Asset Imports
import starfieldSrc from '../assets/starfield.jpg';
import playerSrc from '../assets/Starship.png';
import enemySrc from '../assets/Borg_Cube.png';
import shootSfx from '../assets/ship_torpedo.wav';
import enemyShootSfx from '../assets/borg_disruptor.wav';
import shieldHitSfx from '../assets/shieldhit.wav';
import explosionSfx from '../assets/ship_explosion.wav';

const GameCanvas = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const { wave, onWaveComplete, onGameOver, onStatsUpdate, isPlaying } = props;

    // Game State Refs (Mutable state outside React render cycle)
    const gameState = useRef({
        player: { x: 0, y: 0, width: 80, height: 80, lives: 5, invulnerable: 0 },
        enemies: [],
        projectiles: [],
        particles: [],
        stars: [],
        lastTime: 0,
        waveInitialized: false,
        bgY: 0,
        enemiesDestroyed: 0,
        totalEnemiesInWave: 15,
        width: 0,
        height: 0
    });

    // Assets Refs
    const assets = useRef({
        images: {},
        audio: {}
    });

    // Load Assets
    useEffect(() => {
        const loadImages = async () => {
            const loadImage = (src, name) => new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    console.log(`Asset loaded: ${name}`);
                    resolve(img);
                };
                img.onerror = (e) => {
                    console.error(`Failed to load asset: ${name}`, e);
                    // Resolve with null so Promise.all doesn't fail, allowing game to start (albeit with missing graphics)
                    resolve(null);
                };
            });

            try {
                const [starfield, player, enemy] = await Promise.all([
                    loadImage(starfieldSrc, 'starfield'),
                    loadImage(playerSrc, 'player'),
                    loadImage(enemySrc, 'enemy')
                ]);

                // Fallback for missing images to prevent crash in draw loop
                assets.current.images = {
                    starfield: starfield,
                    player: player,
                    enemy: enemy
                };

                // Set initialized only after assets attempt to load
                // The game update loop waits for 'waveInitialized' but that's different.
                // We should probably flag that assets are ready.
                // But for now, just letting it flow.
            } catch (err) {
                console.error("Critical error loading assets:", err);
            }
        };

        const loadAudio = () => {
            assets.current.audio = {
                shoot: new Audio(shootSfx),
                enemyShoot: new Audio(enemyShootSfx),
                hit: new Audio(shieldHitSfx),
                explode: new Audio(explosionSfx)
            };
            // Create a pool or allow multi-play by cloning
        };

        loadImages();
        loadAudio();

        // Handle Resize
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                gameState.current.width = window.innerWidth;
                gameState.current.height = window.innerHeight;

                // Reposition player if OOB
                if (gameState.current.player.x > window.innerWidth) gameState.current.player.x = window.innerWidth / 2;
                if (gameState.current.player.y > window.innerHeight) gameState.current.player.y = window.innerHeight - 100;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Initial Player Pos
        gameState.current.player.x = window.innerWidth / 2 - 40;
        gameState.current.player.y = window.innerHeight - 150;

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Exposed Methods
    useImperativeHandle(ref, () => ({
        firePlayer: () => {
            if (!isPlaying || gameState.current.player.lives <= 0) return;
            fireProjectile(gameState.current.player.x + gameState.current.player.width / 2, gameState.current.player.y, 'player');
            playSound('shoot');
        }
    }));

    // Sound Helper
    const playSound = (name) => {
        if (assets.current.audio[name]) {
            const sound = assets.current.audio[name].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => console.log("Audio play error", e));
        }
    };

    // Game Functions
    const spawnWave = (waveNum) => {
        const count = 15;
        const enemies = [];
        const cols = 5;

        for (let i = 0; i < count; i++) {
            enemies.push({
                id: i,
                x: (gameState.current.width / 2) + ((i % cols) - 2) * 120, // Center grid
                y: -200 - (Math.floor(i / cols) * 120),
                width: 70,
                height: 70,
                hp: 1 + (waveNum * 0.5), // More HP later? Or just speed. Let's keep HP simple (1-2 hits)
                // Actually user said enemies destroyed if hit 3 times? No, player destroyed if hit 3 times.
                // Enemies: 1 torpedo usually destroys them or maybe 2 for boss feel? Let's say 2 hits.
                hpCurrent: 2,
                type: 'borg',
                speedY: 1 + (waveNum * 0.5),
                phase: Math.random() * Math.PI * 2
            });
        }
        gameState.current.enemies = enemies;
        gameState.current.totalEnemiesInWave = count;
        gameState.current.enemiesDestroyed = 0;
        gameState.current.waveInitialized = true;
    };

    const fireProjectile = (x, y, owner) => {
        gameState.current.projectiles.push({
            x, y,
            width: 8, height: 20,
            vy: owner === 'player' ? -10 : 5,
            owner
        });
    };

    const spawnExplosion = (x, y) => {
        for (let i = 0; i < 10; i++) {
            gameState.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: 'orange'
            });
        }
    };

    // Input Handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleTouchMove = (e) => {
            e.preventDefault(); // Prevent scrolling
            if (!isPlaying) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            // Center ship on finger
            gameState.current.player.x = (touch.clientX - rect.left) - gameState.current.player.width / 2;
            gameState.current.player.y = (touch.clientY - rect.top) - gameState.current.player.height / 2;
        };

        const handleMouseMove = (e) => {
            if (!isPlaying) return;
            // Allow mouse for testing
            const rect = canvas.getBoundingClientRect();
            gameState.current.player.x = (e.clientX - rect.left) - gameState.current.player.width / 2;
            gameState.current.player.y = (e.clientY - rect.top) - gameState.current.player.height / 2;
        };

        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isPlaying]);


    // Reset wave init on wave change
    useEffect(() => {
        gameState.current.waveInitialized = false;
    }, [wave]);

    // Game Loop
    useEffect(() => {
        let animationFrameId;

        const loop = (timestamp) => {
            gameState.current.lastTime = timestamp;

            update();
            draw();

            if (isPlaying) {
                animationFrameId = requestAnimationFrame(loop);
            }
        };

        // Reset/Init if returning to play
        if (isPlaying) {
            if (!gameState.current.waveInitialized) {
                spawnWave(wave);
                // Reset stats
                // gameState.current.player.lives = 3; // Don't reset lives between waves unless new game
                // Actually logic is: if start over, lives reset (handled by parent probably resetting key or internal reset)
            }
            animationFrameId = requestAnimationFrame(loop);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, wave]);

    // Update Logic
    const update = () => {
        const state = gameState.current;
        const width = state.width;
        const height = state.height;

        // Background Scroll
        state.bgY += 1; // slow scroll
        if (state.bgY >= height) state.bgY = 0;

        // Player Boundary
        if (state.player.x < 0) state.player.x = 0;
        if (state.player.x > width - state.player.width) state.player.x = width - state.player.width;
        if (state.player.y < 0) state.player.y = 0;
        if (state.player.y > height - state.player.height) state.player.y = height - state.player.height;

        // Player Invuln
        if (state.player.invulnerable > 0) state.player.invulnerable--;

        // Enemies
        // Only keep enemies inside or slightly above screen
        state.enemies.forEach(enemy => {
            // Movement - Sine wave + Descend
            enemy.y += enemy.speedY * 0.5; // Descend slowly
            enemy.x += Math.sin((Date.now() / 500) + enemy.phase) * 2;

            // Loop back to top if they go off screen without dying? Or maybe they bounce?
            // "enemies are moving around" - Galaga style loops.
            // Simplified: if they go off bottom, respawn at top?
            if (enemy.y > height) {
                enemy.y = -100;
                enemy.x = Math.random() * (width - 100);
            }

            // Enemy Shooting
            if (Math.random() < 0.001 + (wave * 0.002)) { // Chance to shoot
                // Fire at player
                fireProjectile(enemy.x + enemy.width / 2, enemy.y + enemy.height, 'enemy');
                playSound('enemyShoot');
            }
        });

        // Projectiles
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
            const p = state.projectiles[i];
            p.y += p.vy;

            // Off screen
            if (p.y < -50 || p.y > height + 50) {
                state.projectiles.splice(i, 1);
                continue;
            }

            // Collision
            // Player Bullet hits Enemy
            if (p.owner === 'player') {
                for (let j = state.enemies.length - 1; j >= 0; j--) {
                    const e = state.enemies[j];
                    if (
                        p.x < e.x + e.width &&
                        p.x + p.width > e.x &&
                        p.y < e.y + e.height &&
                        p.y + p.height > e.y
                    ) {
                        // Hit
                        state.projectiles.splice(i, 1);
                        e.hpCurrent--;
                        if (e.hpCurrent <= 0) {
                            // Destroyed
                            state.enemies.splice(j, 1);
                            state.enemiesDestroyed++;
                            spawnExplosion(e.x + e.width / 2, e.y + e.height / 2);
                            playSound('explode');

                            // Check Wave Clear
                            if (state.enemies.length === 0) {
                                onWaveComplete();
                            }
                        } else {
                            // Hit effect?
                        }
                        break; // Bullet removed
                    }
                }
            }
            // Enemy Bullet hits Player
            else if (p.owner === 'enemy') {
                const pl = state.player;
                if (
                    pl.lives > 0 &&
                    pl.invulnerable <= 0 &&
                    p.x < pl.x + pl.width &&
                    p.x + p.width > pl.x &&
                    p.y < pl.y + pl.height &&
                    p.y + p.height > pl.y
                ) {
                    // Player Hit
                    state.projectiles.splice(i, 1);
                    pl.lives--;
                    pl.invulnerable = 120; // 2 seconds at 60fps
                    spawnExplosion(pl.x + pl.width / 2, pl.y + pl.height / 2);

                    if (pl.lives <= 0) {
                        playSound('explode');
                        onGameOver();
                    } else {
                        playSound('hit');
                    }
                }
            }
        }

        // Check Collision Player vs Ship (Crash)
        for (let e of state.enemies) {
            const pl = state.player;
            if (
                pl.lives > 0 &&
                pl.invulnerable <= 0 &&
                e.x < pl.x + pl.width &&
                e.x + e.width > pl.x &&
                e.y < pl.y + pl.height &&
                e.y + e.height > pl.y
            ) {
                pl.lives--;
                pl.invulnerable = 120;
                spawnExplosion(pl.x + pl.width / 2, pl.y + pl.height / 2);
                // Enemy also dies? standard is yes
                // Assuming crash destroys enemy too for fairness? Or just bounces?
                // Let's say enemy explodes too.
                // But finding index is hard in forEach.
                // Keep simple: Player gets hurt, enemy passes through.
                if (pl.lives <= 0) {
                    playSound('explode');
                    onGameOver();
                } else {
                    playSound('hit');
                }
            }
        }

        // Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const part = state.particles[i];
            part.x += part.vx;
            part.y += part.vy;
            part.life -= 0.05;
            if (part.life <= 0) state.particles.splice(i, 1);
        }

        // Update Stats
        if (onStatsUpdate) {
            // Rate limit this? React state updates are fast enough usually for rAF? 
            // Better to throttle to every 10 frames or so.
            if (Math.random() < 0.1) {
                onStatsUpdate({
                    enemiesLeft: state.enemies.length,
                    totalEnemies: state.totalEnemiesInWave,
                    lives: state.player.lives
                });
            }
        }
    };

    // Draw Logic
    const draw = () => {
        const ctx = canvasRef.current.getContext('2d');
        const state = gameState.current;
        const width = state.width;
        const height = state.height;

        ctx.clearRect(0, 0, width, height);

        // Draw Starfield (Tiled and scrolling)
        if (assets.current.images.starfield) {
            const img = assets.current.images.starfield;
            // Draw 2 copies for scroll
            // Since it's a small tile probably (69kb jpg), we need to pattern fill
            const ptrn = ctx.createPattern(img, 'repeat');
            ctx.fillStyle = ptrn;

            // Move the matrix for scrolling
            const matrix = new DOMMatrix();
            matrix.translateSelf(0, state.bgY);
            ptrn.setTransform(matrix);

            ctx.fillRect(0, 0, width, height); // Fill rect clears but we want scroll
            // Actually pattern scroll is tricky with transforms if we clear. 
            // Simpler: Draw image multiple times?
            // Let's stick to fillRect with transforms if 'repeat' logic works.
            // If bgY increases, we just translate.
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);
        }

        // Draw Player
        if (state.player.lives > 0) {
            if (state.player.invulnerable % 10 < 5) { // Blink effect
                if (assets.current.images.player) {
                    ctx.drawImage(assets.current.images.player, state.player.x, state.player.y, state.player.width, state.player.height);
                } else {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
                }
            }
        }

        // Draw Enemies
        state.enemies.forEach(e => {
            if (assets.current.images.enemy) {
                ctx.drawImage(assets.current.images.enemy, e.x, e.y, e.width, e.height);
            } else {
                ctx.fillStyle = 'red';
                ctx.fillRect(e.x, e.y, e.width, e.height);
            }
        });

        // Draw Projectiles
        state.projectiles.forEach(p => {
            ctx.fillStyle = p.owner === 'player' ? '#00d2ff' : '#ff0055';
            ctx.fillRect(p.x, p.y, p.width, p.height);
            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw Particles
        state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    };

    return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
});

export default GameCanvas;
