from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app) # Allows your frontend web page to talk to this backend safely

DB_PATH = os.path.join(os.path.dirname(__file__), 'game_leaderboard.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Endpoint 1: Submit a new high score
@app.route('/api/scores', methods=['POST'])
def add_score():
    data = request.get_json()
    player_name = data.get('player_name', 'Anonymous')
    score = data.get('score', 0)
    
    conn = get_db_connection()
    conn.execute('INSERT INTO leaderboard (player_name, score) VALUES (?, ?)', (player_name, score))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Score saved!"}), 201

# Endpoint 2: Fetch Top 5 scores for the leaderboard overlay
@app.route('/api/scores', methods=['GET'])
def get_scores():
    conn = get_db_connection()
    scores = conn.execute('SELECT player_name, score, date_achieved FROM leaderboard ORDER BY score DESC LIMIT 5').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in scores])

# Endpoint 3: Collect Crowd Wisdom analytics data on game over
@app.route('/api/analytics', methods=['POST'])
def save_analytics():
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO game_analytics 
        (death_reason, game_duration_seconds, rush_challenges_passed, rush_challenges_failed) 
        VALUES (?, ?, ?, ?)
    ''', (
        data.get('death_reason'),
        data.get('duration'),
        data.get('passed_challenges'),
        data.get('failed_challenges')
    ))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Analytics logged for crowd analysis."}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)