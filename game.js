const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVEMENT_SPEED = 5;

// Add sprite image loading
const playerSprite = new Image();
playerSprite.src = 'jif-sprite.png';

const enemySprite = new Image();
enemySprite.src = 'gif-sprite.png';

const peanutSprite = new Image();
peanutSprite.src = 'peanut-sprite.png';

// Add loading state
let gameLoaded = false;

// Wait for image to load before starting game
playerSprite.onload = () => {
    gameLoaded = true;
    // Start the game loop once image is loaded
    gameLoop();
};

const player = {
    x: 100,
    y: 300,
    width: 50,  // Adjust size to match sprite proportions
    height: 70,
    velocityY: 0,
    isJumping: false,
    score: 0,
    facingLeft: false // Add direction tracking
};

const peanuts = [];
const obstacles = [];

// Game state
let gameRunning = true;
let keys = {};

// Add after other constants at the top
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 40;

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Spawn peanuts randomly
function spawnPeanut() {
    if (peanuts.length < 5) {
        peanuts.push({
            x: canvas.width + Math.random() * 300,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 30,
            height: 30
        });
    }
}

// Spawn obstacles
function spawnObstacle() {
    if (obstacles.length < 3) {
        obstacles.push({
            x: canvas.width + Math.random() * 400,
            y: canvas.height - 70,
            width: 50,
            height: 70
        });
    }
}

// Add function to reset game state
function resetGame() {
    player.x = 100;
    player.y = 300;
    player.velocityY = 0;
    player.isJumping = false;
    player.score = 0;
    player.facingLeft = false;
    
    obstacles.length = 0;
    peanuts.length = 0;
    
    gameRunning = true;
}

// Add function to check if point is inside button
function isInsideButton(x, y, buttonX, buttonY) {
    return x >= buttonX && 
           x <= buttonX + BUTTON_WIDTH && 
           y >= buttonY && 
           y <= buttonY + BUTTON_HEIGHT;
}

// Add click event listener for replay button
canvas.addEventListener('click', (e) => {
    if (!gameRunning) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        const buttonX = canvas.width/2 - BUTTON_WIDTH/2;
        const buttonY = canvas.height/2 + 80;
        
        if (isInsideButton(clickX, clickY, buttonX, buttonY)) {
            resetGame();
        }
    }
});

// Update game state
function update() {
    if (!gameRunning) return;

    // Player movement
    if (keys['ArrowLeft']) {
        player.x -= MOVEMENT_SPEED;
        player.facingLeft = true;
    }
    if (keys['ArrowRight']) {
        player.x += MOVEMENT_SPEED;
        player.facingLeft = false;
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }

    // Apply gravity
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Ground collision
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Update peanuts
    for (let i = peanuts.length - 1; i >= 0; i--) {
        peanuts[i].x -= 2;
        
        // Collision with player
        if (checkCollision(player, peanuts[i])) {
            peanuts.splice(i, 1);
            player.score += 10;
        }
        
        // Remove if off screen
        if (peanuts[i] && peanuts[i].x < -30) {
            peanuts.splice(i, 1);
        }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 3;
        
        // Collision with player
        if (checkCollision(player, obstacles[i])) {
            gameRunning = false;
        }
        
        // Remove if off screen
        if (obstacles[i].x < -30) {
            obstacles.splice(i, 1);
        }
    }

    // Spawn new elements
    if (Math.random() < 0.02) spawnPeanut();
    if (Math.random() < 0.01) spawnObstacle();
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw game elements
function draw() {
    // Clear canvas and draw background
    ctx.fillStyle = 'rgb(121, 78, 36)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameLoaded) {
        // Show loading message
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('Loading...', canvas.width/2 - 50, canvas.height/2);
        return;
    }

    // Draw player (Jif jar sprite)
    if (player.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(playerSprite, -player.x - player.width, player.y, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    }

    // Draw peanuts (now black)
    peanuts.forEach(peanut => {
        ctx.drawImage(peanutSprite, peanut.x, peanut.y, peanut.width, peanut.height);
    });

    // Draw obstacles (Gif sprites)
    obstacles.forEach(obstacle => {
        ctx.drawImage(enemySprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Update score color for better visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 30);

    // Game over message
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${player.score}`, canvas.width/2 - 70, canvas.height/2 + 40);

        // Draw replay button
        const buttonX = canvas.width/2 - BUTTON_WIDTH/2;
        const buttonY = canvas.height/2 + 80;
        
        // Button background
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT);
        
        // Button text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Play Again', canvas.width/2, buttonY + 25);
        ctx.textAlign = 'left'; // Reset text align for other text
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the initial animation loop to show loading screen
function initialLoop() {
    draw();
    if (!gameLoaded) {
        requestAnimationFrame(initialLoop);
    }
}
initialLoop(); 