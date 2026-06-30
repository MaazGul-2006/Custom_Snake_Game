// Analytics and Leaderboard Web Bridge Engine
const BACKEND_URL = "http://127.0.0.1:5000/api";

// Tracking state variables for a single game run
window.gameStartTime = null;
window.passedChallengesCount = 0;
window.failedChallengesCount = 0;

window.trackGameStart = function() {
    window.gameStartTime = Date.now();
    window.passedChallengesCount = 0;
    window.failedChallengesCount = 0;
    console.log("Telemetry session initialized successfully.");
};

// Track custom rush achievements/failures on the fly
window.logRushEvent = function(wasSuccessful) {
    if (wasSuccessful) {
        window.passedChallengesCount++;
    } else {
        window.failedChallengesCount++;
    }
};

// Automatically fires when gameOver() is called in game.js
window.sendMatchTelemetry = function(deathReason) {
    if (!window.gameStartTime) return;
    
    const gameDurationSeconds = Math.floor((Date.now() - window.gameStartTime) / 1000);

    const payload = {
        death_reason: deathReason,
        duration: gameDurationSeconds,
        passed_challenges: window.passedChallengesCount,
        failed_challenges: window.failedChallengesCount
    };

    fetch(`${BACKEND_URL}/analytics`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => console.log("Analytics synced:", data))
    .catch(err => console.error("Analytics syncing failed:", err));
};

// Submit score directly to SQLite
window.postHighScoreToLeaderboard = function(playerName, finalScore) {
    fetch(`${BACKEND_URL}/scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ player_name: playerName, score: finalScore })
    })
    .then(response => response.json())
    .then(data => console.log("Score logged:", data))
    .catch(err => console.error("Error posting score:", err));
};
