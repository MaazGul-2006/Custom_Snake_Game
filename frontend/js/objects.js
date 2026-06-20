// Game Objects Data State
let food = { x: 0, y: 0 };
let activeMines = [];

// --- FOOD LOGIC ---
function spawnFood() {
    // Generate random grid coordinates
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);

    // Prevent food from spawning right on top of the snake body
    for (let segment of snake.body) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood(); // Re-roll coordinates
            return;
        }
    }
}

function drawFood(ctx, gridSize) {
    ctx.save();
    // High Graphics Glowing Effect (Neon Crimson Red)
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff2a6d";
    ctx.fillStyle = "#ff2a6d";
    
    ctx.beginPath();
    // Smooth circle instead of a flat square box
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.restore();
}

// --- MINE MECHANICS (Your Custom 3-Second Flash Rule) ---
function spawnMine() {
    let mineX = Math.floor(Math.random() * TILE_COUNT);
    let mineY = Math.floor(Math.random() * TILE_COUNT);

    // Avoid spawning on the snake or on active food coordinates
    if (food.x === mineX && food.y === mineY) return spawnMine();
    for (let segment of snake.body) {
        if (segment.x === mineX && segment.y === mineY) return spawnMine();
    }

    let newMine = {
        x: mineX,
        y: mineY,
        isActive: false,
        spawnTime: Date.now()
    };

    activeMines.push(newMine);

    // Toggles from Warning Light state to Deadly Active Mine state after exactly 3000ms
    setTimeout(() => {
        newMine.isActive = true;
    }, 3000);
}

// Periodically drop fresh mines onto the grid map
setInterval(() => {
    if (typeof snake !== 'undefined' && gameLoopInterval) {
        spawnMine();
    }
}, 7000); // A new mine layout warning triggers every 7 seconds

function checkMineCollision(headPos) {
    for (let mine of activeMines) {
        // Collisions only register if the 3-second warning timer has expired!
        if (mine.isActive && mine.x === headPos.x && mine.y === headPos.y) {
            return true; 
        }
    }
    return false;
}

function drawMines(ctx, gridSize) {
    const now = Date.now();

    activeMines.forEach(mine => {
        ctx.save();
        
        if (!mine.isActive) {
            // --- STATE 1: HIGH GRAPHICS 3-SEC WARNING FLASH ---
            // Uses a sine wave based on time to create a smooth, pulsing visual aura
            let pulseOpacity = 0.3 + 0.5 * Math.abs(Math.sin((now - mine.spawnTime) / 150));
            
            ctx.shadowBlur = 25;
            ctx.shadowColor = "#f57c00"; // Dangerous Amber Warning Glow
            ctx.fillStyle = `rgba(245, 124, 0, ${pulseOpacity})`;
            
            ctx.beginPath();
            ctx.arc(
                mine.x * gridSize + gridSize / 2,
                mine.y * gridSize + gridSize / 2,
                gridSize / 1.5, // Large alert circle
                0,
                2 * Math.PI
            );
            ctx.fill();
            
        } else {
            // --- STATE 2: ACTIVE DEADLY ORB ---
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ff0000"; // Solid Laser Red
            ctx.fillStyle = "#ff3333";
            
            // Draw a spiked or sharp indicator design
            ctx.fillRect(
                mine.x * gridSize + 4,
                mine.y * gridSize + 4,
                gridSize - 8,
                gridSize - 8
            );
        }
        ctx.restore();
    });
}