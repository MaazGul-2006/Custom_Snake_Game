// Global Configuration & Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 20; // 20x20 pixel blocks
const TILE_COUNT = canvas.width / GRID_SIZE; // 20 tiles across and down

// Game State Tracking Variables
let snake;
let gameLoopInterval;
let score = 0;

// Custom Timers & Tracking (Your Custom Mechanics)
let foodTimer = 10;
let foodInterval;

let rushTimer = 25;
let rushInterval;
let foodEatenInWindow = 0;

// Controls
let nextDirection = { x: 1, y: 0 }; // Default: Moving Right
let currentDirection = { x: 1, y: 0 };

// Initialize the game environment
function initGame() {
    snake = new Snake(); 
    score = 0;
    foodEatenInWindow = 0;
    
    // Signal to analytics.js that a fresh game session has begun
    trackGameStart(); 
    
    // Initial Spawning Checks
    spawnFood();
    // Clear any old leftover mines from previous games and drop a clean one
    activeMines = []; 
    spawnMine();
    
    // Reset DOM Display
    document.getElementById("score-val").innerText = score;
    document.getElementById("rush-count-val").innerText = foodEatenInWindow;
    
    // Start Central Processes
    startTimers();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(update, 120); // 120ms frame updates
}

// Custom Pacing Timers
function startTimers() {
    if(foodInterval) clearInterval(foodInterval);
    if(rushInterval) clearInterval(rushInterval);
    
    foodTimer = 10;
    rushTimer = 25;
    
    document.getElementById("food-timer-val").innerText = foodTimer;
    document.getElementById("rush-timer-val").innerText = rushTimer;
    
    // 10-Second Food Cycle
    foodInterval = setInterval(() => {
        foodTimer--;
        document.getElementById("food-timer-val").innerText = foodTimer;
        if (foodTimer <= 0) {
            spawnFood(); // Despawn and relocate food
            foodTimer = 10;
        }
    }, 1000);

    // 25-Second Rush Cycle
    rushInterval = setInterval(() => {
        rushTimer--;
        document.getElementById("rush-timer-val").innerText = rushTimer;
        
        if (rushTimer <= 0) {
            // Evaluate your custom crowd-wisdom criteria rules
            evaluateRushPerformance(); 
            rushTimer = 25; // Reset window
            document.getElementById("rush-timer-val").innerText = rushTimer;
        }
    }, 1000);
}

// Evaluate length adjustments based on speed-run metrics
function evaluateRushPerformance() {
    if (foodEatenInWindow >= 4) {
        snake.shrinkTail(); // Reward for fast play
        logRushEvent(true);  // Log success for crowd wisdom analytics
    } else if (foodEatenInWindow < 3) {
        snake.growTailPenalty(); // Penalty for slow play
        logRushEvent(false); // Log failure penalty
    }
    
    // Reset window counter
    foodEatenInWindow = 0;
    document.getElementById("rush-count-val").innerText = foodEatenInWindow;
}

// Core Game Loop: Update Phase
function update() {
    currentDirection = nextDirection;
    
    // Move Head Location ahead
    const newHeadPos = {
        x: snake.body[0].x + currentDirection.x,
        y: snake.body[0].y + currentDirection.y
    };

    // Edge Check: Out-Of-Bounds Boundary Walls
    if (newHeadPos.x < 0 || newHeadPos.x >= TILE_COUNT || newHeadPos.y < 0 || newHeadPos.y >= TILE_COUNT) {
        return gameOver('wall');
    }

    // Static Object Matrix Evaluations (Collisions)
    if (snake.checkSelfCollision(newHeadPos)) return gameOver('self');
    if (checkMineCollision(newHeadPos)) return gameOver('mine');

    // Check if food was collected
    if (newHeadPos.x === food.x && newHeadPos.y === food.y) {
        score += 10;
        foodEatenInWindow++;
        document.getElementById("score-val").innerText = score;
        document.getElementById("rush-count-val").innerText = foodEatenInWindow;
        
        snake.grow(); 
        spawnFood();
        foodTimer = 10; // Reset food decay timer
        document.getElementById("food-timer-val").innerText = foodTimer;
    } else {
        snake.move(newHeadPos);
    }

    render();
}

// Core Game Loop: Rendering Phase
function render() {
    // Clear canvas frame
    ctx.fillStyle = "#0d0d0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Entities
    snake.draw(ctx, GRID_SIZE);
    drawFood(ctx, GRID_SIZE);
    drawMines(ctx, GRID_SIZE);
}

// Unified Game Over Handler
function gameOver(deathReason) {
    clearInterval(gameLoopInterval);
    clearInterval(foodInterval);
    clearInterval(rushInterval);
    
    // Send telemetry records to Python/SQL in the background
    sendMatchTelemetry(deathReason); 
    
    // Prompt for leaderboard submission
    let playerName = prompt(`Game Over due to hitting a ${deathReason}! Final Score: ${score}\nEnter your name for the leaderboard:`);
    if (playerName && playerName.trim() !== "") {
        postHighScoreToLeaderboard(playerName, score);
    }
    
    // Reset controls back to default right-facing movement on restart
    nextDirection = { x: 1, y: 0 };
    currentDirection = { x: 1, y: 0 };
    
    initGame();
}

// Capture Keyboard Inputs cleanly
window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":
            if (currentDirection.y !== 0) break; // Block 180-degree reverse self-destruction
            nextDirection = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (currentDirection.y !== 0) break;
            nextDirection = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (currentDirection.x !== 0) break;
            nextDirection = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (currentDirection.x !== 0) break;
            nextDirection = { x: 1, y: 0 };
            break;
    }
});

// Kick off immediately on file read
window.onload = () => {
    initGame();
};