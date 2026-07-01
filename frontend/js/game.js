// Global Configuration & Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 20; 
const TILE_COUNT = canvas.width / GRID_SIZE; 

// Game State Tracking Variables
let snake;
let gameLoopInterval;
let score = 0;

// Central Shared Variables
window.activeMines = [];
window.food = { x: 5, y: 5 };

// Custom Timers & Tracking
let foodTimer = 10;
let foodInterval;

let rushTimer = 25;
let rushInterval;
let foodEatenInWindow = 0;

let mineShiftInterval;

// Controls
let nextDirection = { x: 1, y: 0 }; 
let currentDirection = { x: 1, y: 0 };

function initGame() {
    // Sharp Rendering Engine Fix for Blurry Displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    
    // Set explicit CSS sizing bounds
    canvas.style.width = "400px";
    canvas.style.height = "400px";

    // Re-initialize active avatar properties explicitly from configuration values
    if (snake) {
        snake.avatar = window.gameConfig.avatar;
        snake.color = window.gameConfig.primaryColor;
    }
    snake = new Snake(); 
    score = 0;
    foodEatenInWindow = 0;
    
    trackGameStart(); 
    spawnFood();
    
    window.activeMines = []; 
    for (let i = 0; i < 4; i++) {
        spawnMine();
    }
    
    document.getElementById("score-val").innerText = score;
    document.getElementById("rush-count-val").innerText = foodEatenInWindow;
    
    startTimers();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(update, 180); 
}

function startTimers() {
    if(foodInterval) clearInterval(foodInterval);
    if(rushInterval) clearInterval(rushInterval);
    if(mineShiftInterval) clearInterval(mineShiftInterval);
    
    foodTimer = 10;
    rushTimer = 25;
    
    document.getElementById("food-timer-val").innerText = foodTimer;
    document.getElementById("rush-timer-val").innerText = rushTimer;
    
    foodInterval = setInterval(() => {
        foodTimer--;
        document.getElementById("food-timer-val").innerText = foodTimer;
        if (foodTimer <= 0) {
            spawnFood(); 
            foodTimer = 10;
        }
    }, 1000);

    rushInterval = setInterval(() => {
        rushTimer--;
        document.getElementById("rush-timer-val").innerText = rushTimer;
        
        if (rushTimer <= 0) {
            evaluateRushPerformance(); 
            rushTimer = 25; 
            document.getElementById("rush-timer-val").innerText = rushTimer;
        }
    }, 1000);

    mineShiftInterval = setInterval(() => {
        triggerMineRelocation();
        if (window.activeMines.length > 0) {
            window.activeMines.shift();
            spawnMine();
        }
    }, 5000);
}

function evaluateRushPerformance() {
    if (foodEatenInWindow >= 4) {
        snake.shrinkTail(); 
        logRushEvent(true);  
    } else if (foodEatenInWindow < 3) {
        snake.growTailPenalty(); 
        logRushEvent(false); 
    }
    
    foodEatenInWindow = 0;
    document.getElementById("rush-count-val").innerText = foodEatenInWindow;
}

function update() {
    currentDirection = nextDirection;
    
    let newX = snake.body[0].x + currentDirection.x;
    let newY = snake.body[0].y + currentDirection.y;

    // BOUNDARY PHYSICS HANDLER
    if (window.gameConfig.wallRule === "wrap") {
        // Quantum Wrap Mode: Teleport to opposite side
        if (newX < 0) newX = TILE_COUNT - 1;
        if (newX >= TILE_COUNT) newX = 0;
        if (newY < 0) newY = TILE_COUNT - 1;
        if (newY >= TILE_COUNT) newY = 0;
    } else {
        // Hard Walls Mode: Instant Crash
        if (newX < 0 || newX >= TILE_COUNT || newY < 0 || newY >= TILE_COUNT) {
            return gameOver('wall');
        }
    }

    const newHeadPos = { x: newX, y: newY };

    if (snake.checkSelfCollision(newHeadPos)) return gameOver('self');
    if (checkMineCollision(newHeadPos)) return gameOver('mine');

    if (newHeadPos.x === window.food.x && newHeadPos.y === window.food.y) {
        score += 10;
        foodEatenInWindow++;
        document.getElementById("score-val").innerText = score;
        document.getElementById("rush-count-val").innerText = foodEatenInWindow;
        
        snake.grow(); 
        spawnFood();
        foodTimer = 10; 
        document.getElementById("food-timer-val").innerText = foodTimer;
    } else {
        snake.move(newHeadPos);
    }

    render();
}

function render() {
    const computedStyles = getComputedStyle(document.body);
    const canvasBgColor = computedStyles.getPropertyValue('--bg-canvas').trim() || '#0b0d17';

    // Clear the board using the correct dimensions
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, 400, 400);

    // Render game objects cleanly
    snake.draw(ctx, GRID_SIZE);
    drawFood(ctx, GRID_SIZE);
    drawMines(ctx, GRID_SIZE);
}

function gameOver(deathReason) {
    clearInterval(gameLoopInterval);
    clearInterval(foodInterval);
    clearInterval(rushInterval);
    clearInterval(mineShiftInterval);
    
    sendMatchTelemetry(deathReason); 
    
    alert(`Game Over due to hitting a ${deathReason}! Final Score: ${score}`);
    
    // Reset inputs
    nextDirection = { x: 1, y: 0 };
    currentDirection = { x: 1, y: 0 };
    
    // Toggle interface back to menu configuration card 
    document.getElementById("sandbox-core").classList.add("hidden");
    document.getElementById("start-menu").classList.remove("hidden");
}

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp":
            if (currentDirection.y !== 0) break; 
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

// Global Configuration Objects used across scripts
window.gameConfig = {
    avatar: 'snake',
    foodType: 'apple',
    level: '1',
    wallRule: 'solid',
    primaryColor: '#2ecc71'
};

// Fired when clicking the green "Launch Mission" button
function launchConfiguredGame() {
    // 1. Gather all selections from the menu dropdowns
    window.gameConfig.avatar = document.getElementById("animal-select").value;
    window.gameConfig.foodType = document.getElementById("food-select").value;
    window.gameConfig.level = document.getElementById("level-select").value;
    window.gameConfig.wallRule = document.getElementById("wall-select").value;
    window.gameConfig.primaryColor = document.getElementById("color-select").value;

    // 2. Handle Theme Switcher UI classes dynamically
    const selectedTheme = document.getElementById("theme-select").value;
    if (selectedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // 3. Toggle visibility layers (Hide menu card, display canvas arena)
    document.getElementById("start-menu").classList.add("hidden");
    document.getElementById("sandbox-core").classList.remove("hidden");

    // 4. Fire up the actual engines!
    initGame();
}

// Esc Key Listener to exit back to Configuration Panel smoothly during a run
window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        clearInterval(gameLoopInterval);
        clearInterval(foodInterval);
        clearInterval(rushInterval);
        clearInterval(mineShiftInterval);
        
        document.getElementById("sandbox-core").classList.add("hidden");
        document.getElementById("start-menu").classList.remove("hidden");
    }
});