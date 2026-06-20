class Snake {
    constructor() {
        // Start in the middle of our grid
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // Load the snake head texture asset
        this.headImage = new Image();
        // You can drop any clean transparent PNG snake head here later!
        this.headImage.src = 'https://i.imgur.com/w9YOLvF.png'; 
    }

    // Moves the snake by appending the new head position and dropping the tail edge
    move(newHeadPos) {
        this.body.unshift(newHeadPos);
        this.body.pop();
    }

    // Traditional growth on food consumption
    grow() {
        // Duplicate the last tail coordinate to expand safely on next frame move
        const tailEnd = { ...this.body[this.body.length - 1] };
        this.body.push(tailEnd);
    }

    // CUSTOM MECHANIC: Eated 4 foods in 25s reward -> Shrink Tail safely
    shrinkTail() {
        if (this.body.length > 3) { // Maintain a viable minimum length
            this.body.pop();
            this.body.pop(); // Remove two segments as an efficient agility reward!
        }
    }

    // CUSTOM MECHANIC: Failed to eat enough food penalty -> Length grows automatically
    growTailPenalty() {
        for (let i = 0; i < 2; i++) {
            const tailEnd = { ...this.body[this.body.length - 1] };
            this.body.push(tailEnd);
        }
    }

    checkSelfCollision(headPos) {
        // Check if head coordinate matches any active tail segments
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === headPos.x && this.body[i].y === headPos.y) {
                return true;
            }
        }
        return false;
    }

    draw(ctx, gridSize) {
        // --- DRAW BODY SEGMENTS WITH ARCADE GLOW ---
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffcc"; // Cyan neon trail glow
        ctx.fillStyle = "rgba(0, 255, 204, 0.8)";

        for (let i = 1; i < this.body.length; i++) {
            ctx.beginPath();
            // Draw smooth circular body cells instead of rigid square blocks
            ctx.arc(
                this.body[i].x * gridSize + gridSize / 2,
                this.body[i].y * gridSize + gridSize / 2,
                gridSize / 2 - 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
        ctx.restore();

        // --- DRAW HEAD SPRITE WITH DIRECTIONAL ROTATION ---
        const head = this.body[0];
        ctx.save();
        
        // Translate center matrix canvas origin directly onto the head tile
        ctx.translate(head.x * gridSize + gridSize / 2, head.y * gridSize + gridSize / 2);
        
        // Compute correct angle based on global directional vector offsets
        let angle = 0;
        if (currentDirection.x === 1) angle = 0;           // Facing Right
        if (currentDirection.x === -1) angle = Math.PI;     // Facing Left
        if (currentDirection.y === 1) angle = Math.PI / 2;  // Facing Down
        if (currentDirection.y === -1) angle = -Math.PI / 2;// Facing Up
        ctx.rotate(angle);

        // If the custom asset image fails to load, fallback gracefully to a sleek geometric indicator
        if (this.headImage.complete && this.headImage.naturalWidth !== 0) {
            ctx.drawImage(this.headImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
        } else {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#00ffcc";
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, gridSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            // Draw a subtle nose/indicator point direction marker
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(gridSize / 4, -4, 6, 8);
        }
        ctx.restore();
    }
}