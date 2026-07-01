class Snake {
    constructor() {
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
    }

    move(newHeadPos) {
        this.body.unshift(newHeadPos); 
        this.body.pop(); 
            
                 
    }

    grow() {
        const tailEnd = this.body[this.body.length - 1];
        this.body.push({ x: tailEnd.x, y: tailEnd.y });
    }

    shrinkTail() {
        if (this.body.length > 3) {
            this.body.pop();
            console.log("Pacing window met: Snake tail length reduced.");
        }
        else {
            console.log("Snake is at minimum length; cannot shrink further.");
        }
    }

    growTailPenalty() {
        const tailEnd = this.body[this.body.length - 1];
        this.body.push({ x: tailEnd.x, y: tailEnd.y });
        console.log("Pacing window failed: Snake tail length expanded.");
    }

    checkSelfCollision(headPos) {
        return this.body.some(segment => segment.x === headPos.x && segment.y === headPos.y);
    }

    draw(ctx, gridSize) {
        // Pull values straight from the configuration state store on every tick
        const selectedColor = window.gameConfig.primaryColor || '#2ecc71';
        const currentAvatar = window.gameConfig.avatar || 'snake';

        this.body.forEach((segment, index) => {
            if (index === 0) {
                const hX = segment.x * gridSize + gridSize / 2;
                const hY = segment.y * gridSize + gridSize / 2;
                const r = gridSize / 2;

                let angle = 0;
                if (typeof currentDirection !== 'undefined') {
                    if (currentDirection.x === 1) angle = 0;
                    if (currentDirection.x === -1) angle = Math.PI;
                    if (currentDirection.y === 1) angle = Math.PI / 2;
                    if (currentDirection.y === -1) angle = -Math.PI / 2;
                }

                ctx.save();
                ctx.translate(hX, hY);
                ctx.rotate(angle);

                // Check string values matches from HTML selectors exactly
                if (currentAvatar === 'snake') {
                    ctx.strokeStyle = "#e74c3c";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(r + 6, 0);
                    ctx.moveTo(r + 6, 0); ctx.lineTo(r + 9, -3);
                    ctx.moveTo(r + 6, 0); ctx.lineTo(r + 9, 3);
                    ctx.stroke();
                } else if (currentAvatar === 'caterpillar') {
                    ctx.strokeStyle = "#8e44ad";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(r * 0.3, -r * 0.4); ctx.lineTo(r + 4, -r * 0.7);
                    ctx.moveTo(r * 0.3, r * 0.4); ctx.lineTo(r + 4, r * 0.7);
                    ctx.stroke();
                } else if (currentAvatar === 'dragon') {
                    ctx.strokeStyle = "#d35400";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(r * 0.5, 0); ctx.lineTo(r + 8, -r * 0.4);
                    ctx.moveTo(r * 0.5, 0); ctx.lineTo(r + 8, r * 0.4);
                    ctx.stroke();
                }

                ctx.fillStyle = selectedColor;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 1.1, r * 0.9, 0, 0, 2 * Math.PI);
                ctx.fill();

                // Bright High-Contrast Eye Rings for Light Mode compatibility
                ctx.fillStyle = currentAvatar === 'dragon' ? '#ff3f34' : '#f1c40f';
                ctx.beginPath();
                ctx.arc(r * 0.2, -r * 0.4, 3, 0, 2 * Math.PI);
                ctx.arc(r * 0.2, r * 0.4, 3, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = "#000000";
                ctx.fillRect(r * 0.2, -r * 0.4 - 1.5, 1, 3);
                ctx.fillRect(r * 0.2, r * 0.4 - 1.5, 1, 3);

                ctx.rotate(-angle);
                ctx.font = `${gridSize - 4}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("👑", 0, -6);

                ctx.restore();
            } else {
                ctx.fillStyle = selectedColor;
                const totalSegments = this.body.length;
                const tailFactor = (totalSegments - index) / totalSegments;
                const currentBlockSize = gridSize * (0.75 + 0.25 * tailFactor);
                
                const offset = (gridSize - currentBlockSize) / 2;
                const xPos = segment.x * gridSize + offset;
                const yPos = segment.y * gridSize + offset;
                const radius = currentBlockSize / 3;

                ctx.beginPath();
                ctx.moveTo(xPos + radius, yPos);
                ctx.lineTo(xPos + currentBlockSize - radius, yPos);
                ctx.quadraticCurveTo(xPos + currentBlockSize, yPos, xPos + currentBlockSize, yPos + radius);
                ctx.lineTo(xPos + currentBlockSize, yPos + currentBlockSize - radius);
                ctx.quadraticCurveTo(xPos + currentBlockSize, yPos + currentBlockSize - radius, xPos + currentBlockSize - radius, yPos + currentBlockSize);
                ctx.lineTo(xPos + radius, yPos + currentBlockSize);
                ctx.quadraticCurveTo(xPos, yPos + currentBlockSize, xPos, yPos + currentBlockSize - radius);
                ctx.lineTo(xPos, yPos + radius);
                ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
                ctx.closePath();
                ctx.fill();
            }
        });
    }
}