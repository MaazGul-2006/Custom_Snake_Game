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
    
    const newHeadPos = {
        x: snake.body[0].x + currentDirection.x,
        y: snake.body[0].y + currentDirection.y
    };

    if (newHeadPos.x < 0 || newHeadPos.x >= TILE_COUNT || newHeadPos.y < 0 || newHeadPos.y >= TILE_COUNT) {
        return gameOver('wall');
    }

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
    ctx.fillStyle = "#0d0d0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    
    let playerName = prompt(`Game Over due to hitting a ${deathReason}! Final Score: ${score}\nEnter your name for the leaderboard:`);
    if (playerName && playerName.trim() !== "") {
        postHighScoreToLeaderboard(playerName, score);
    }
    
    nextDirection = { x: 1, y: 0 };
    currentDirection = { x: 1, y: 0 };
    
    initGame();
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

window.onload = () => {
    initGame();
};