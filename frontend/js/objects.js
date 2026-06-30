// Static Game Entities and Target Generation Systems
// Uses window.food and window.activeMines declared by game.js

// Holds temporary coordinate blocks that are currently flashing a warning
window.mineWarnings = [];

function spawnFood() {
    let validSpawn = false;
    while (!validSpawn) {
        window.food.x = Math.floor(Math.random() * 20); 
        window.food.y = Math.floor(Math.random() * 20);
        
        if (snake && snake.body) {
            validSpawn = !snake.body.some(segment => segment.x === window.food.x && segment.y === window.food.y);
        } else {
            validSpawn = true;
        }
    }
}

// Stage 1: Reserves a spot, flashes a warning indicator for 1 second, then materializes the bomb
function triggerMineRelocation() {
    if (window.activeMines.length === 0) return;

    // Remove the oldest active mine from the board
    window.activeMines.shift();

    let validSpawn = false;
    let warningCoordinates = { x: 0, y: 0 };

    while (!validSpawn) {
        warningCoordinates.x = Math.floor(Math.random() * 20);
        warningCoordinates.y = Math.floor(Math.random() * 20);

        const collisionWithSnake = snake && snake.body.some(seg => seg.x === warningCoordinates.x && seg.y === warningCoordinates.y);
        const collisionWithFood = (warningCoordinates.x === window.food.x && warningCoordinates.y === window.food.y);
        const collisionWithMines = window.activeMines.some(m => m.x === warningCoordinates.x && m.y === warningCoordinates.y);
        const collisionWithWarnings = window.mineWarnings.some(w => w.x === warningCoordinates.x && w.y === warningCoordinates.y);

        if (!collisionWithSnake && !collisionWithFood && !collisionWithMines && !collisionWithWarnings) {
            validSpawn = true;
        }
    }

    // Push to warning state array
    window.mineWarnings.push(warningCoordinates);

    // After exactly 1 second (1000ms), remove warning sign and drop the actual bomb
    setTimeout(() => {
        window.mineWarnings = window.mineWarnings.filter(w => w !== warningCoordinates);
        // Make sure we don't exceed the max 4 limit during processing
        if (window.activeMines.length < 4) {
            window.activeMines.push(warningCoordinates);
        }
    }, 1000);
}

// Initial direct spawn helper for game setups
function spawnMine() {
    if (window.activeMines.length >= 4) return;
    let validSpawn = false;
    let newMine = { x: 0, y: 0 };

    while (!validSpawn) {
        newMine.x = Math.floor(Math.random() * 20);
        newMine.y = Math.floor(Math.random() * 20);
        const collisionWithSnake = snake && snake.body.some(seg => seg.x === newMine.x && seg.y === newMine.y);
        if (!collisionWithSnake) validSpawn = true;
    }
    window.activeMines.push(newMine);
}

function checkMineCollision(headPos) {
    return window.activeMines.some(mine => mine.x === headPos.x && mine.y === headPos.y);
}

function drawFood(ctx, gridSize) {
    ctx.font = `${gridSize - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", window.food.x * gridSize + gridSize / 2, window.food.y * gridSize + gridSize / 2);
}

function drawMines(ctx, gridSize) {
    ctx.font = `${gridSize - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 1. Render active materialised bombs
    window.activeMines.forEach(mine => {
        ctx.fillText("💣", mine.x * gridSize + gridSize / 2, mine.y * gridSize + gridSize / 2);
    });

    // 2. Render flashing tactical warning indicators
    window.mineWarnings.forEach(warn => {
        // Simple alternate blinking cycle based on current timestamp
        if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillText("⚠️", warn.x * gridSize + gridSize / 2, warn.y * gridSize + gridSize / 2);
        }
    });
}