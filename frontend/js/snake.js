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
        this.body.forEach((segment, index) => {
            if (index === 0) {
                // --- DESIGNING A REAL SNAKE HEAD WITH THE CROWN ---
                const hX = segment.x * gridSize + gridSize / 2;
                const hY = segment.y * gridSize + gridSize / 2;
                const r = gridSize / 2;

                // Determine rotation angle based on current movement direction
                let angle = 0;
                if (typeof currentDirection !== 'undefined') {
                    if (currentDirection.x === 1) angle = 0;          // Right
                    if (currentDirection.x === -1) angle = Math.PI;    // Left
                    if (currentDirection.y === 1) angle = Math.PI / 2; // Down
                    if (currentDirection.y === -1) angle = -Math.PI / 2;// Up
                }

                ctx.save();
                ctx.translate(hX, hY);
                ctx.rotate(angle);

                // 1. Draw the Little Red Flicking Tongue
                ctx.strokeStyle = "#e74c3c";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(r + 6, 0); 
                ctx.moveTo(r + 6, 0);
                ctx.lineTo(r + 9, -3); 
                ctx.moveTo(r + 6, 0);
                ctx.lineTo(r + 9, 3);  
                ctx.stroke();

                // 2. Draw Main Head Base (Sleek Reptile Oval)
                ctx.fillStyle = "#2ecc71"; 
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 1.1, r * 0.9, 0, 0, 2 * Math.PI);
                ctx.fill();

                // 3. Draw Piercing Reptile Eyes (Left & Right)
                ctx.fillStyle = "#f1c40f"; // Golden Eyes
                ctx.beginPath();
                ctx.arc(r * 0.2, -r * 0.4, 2.5, 0, 2 * Math.PI); 
                ctx.arc(r * 0.2, r * 0.4, 2.5, 0, 2 * Math.PI);  
                ctx.fill();

                // Slit Pupils
                ctx.fillStyle = "#000000";
                ctx.fillRect(r * 0.2, -r * 0.4 - 1.5, 0.8, 3);
                ctx.fillRect(r * 0.2, r * 0.4 - 1.5, 0.8, 3);

                // 4. DRAW THE ROYAL CROWN ON TOP
                // We un-rotate the canvas context briefly so the crown always stays right-side up!
                ctx.rotate(-angle);
                ctx.font = `${gridSize - 4}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                // Shifted slightly upward (-6) so it sits proudly on the snake's head
                ctx.fillText("👑", 0, -6);

                ctx.restore();
            } else {
                // --- TAPERED SERPENT BODY ---
                ctx.fillStyle = "#2ecc71"; 
                
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

                // Inner Scale Detail
                ctx.fillStyle = "#27ae60"; 
                ctx.fillRect(xPos + currentBlockSize/3, yPos + currentBlockSize/3, currentBlockSize/3, currentBlockSize/3);
            }
        });
    }
}