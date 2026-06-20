import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'game_leaderboard.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table 1: High Scores Leaderboard
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            date_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table 2: Crowd Wisdom Analytics (Tracks where people struggle)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            death_reason TEXT NOT NULL,       -- 'wall', 'mine', 'self', etc.
            game_duration_seconds INTEGER,
            rush_challenges_passed INTEGER,   -- Times they hit 4 food in 25s
            rush_challenges_failed INTEGER    -- Times they grew as a penalty
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully!")

if __name__ == '__main__':
    init_db()