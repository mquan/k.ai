let totalTime = 30; // 30 seconds for the timer
let timeLeft = totalTime;
let lastUpdateTime = Date.now();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let gravity = 0.4;
let isJumping = false;
let speed = 2.5;
let score = 0;
let assetsLoaded = 0;
let totalAssets = 4; // Total number of assets

function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        update(); // Start the game loop when all assets are loaded
    }
}

let background = new Image();
background.src = 'game_background.png'; // Background image
background.onload = assetLoaded;

let player = {
    x: 50,
    y: 500,
    width: 60,
    height: 70,
    velocityY: 0,
    velocityX: 0,
    image: new Image()
};
player.image.src = 'character.png';
player.image.onload = assetLoaded;

let platforms = [
    { x: 0, y: 550, width: canvas.width, height: 40, image: new Image() },
    { x: 200, y: 400, width: 100, height: 40, image: new Image() }, // First air platform
    { x: 400, y: 300, width: 100, height: 40, image: new Image() } , // Second air platform
    // Moving platform
    { x: 400, y: 150, width: 150, height: 40, speed: 2, direction: 1, minX: 300, maxX: 500, image: new Image() },

];

platforms.forEach(platform => {
    platform.image.src = 'platform.png';
    platform.image.onload = assetLoaded;
});

let coins = [
    { x: 200, y: 500, size: 30, image: new Image(), collected: false },
    { x: 400, y: 400, size: 30, image: new Image(), collected: false },
    // Add more coins as needed
    { x: 230, y: 360, size: 30, image: new Image(), collected: false },
    { x: 430, y: 260, size: 30, image: new Image(), collected: false },
   // Add more coins as needed
   { x: 730, y: 500, size: 30, image: new Image(), collected: false }, 
   { x: 630, y: 150, size: 100, image: new Image(), collected: false},
   { x: 300, y: 120, size: 30, image: new Image(), collected: false}
]
coins.forEach(coin => {
    coin.image.src = 'coin.png';
    coin.image.onload = assetLoaded;
});

const totalCoins = coins.length;
let gameFinished;

let koopas = [
     { x: 300, y: 490, width: 70, height: 70, speed: 1.0, direction: 1, yDirection: 1, defeated: false, type: 'koopa', yAxis: 0, image: new Image() }, // Example Koopa
     { x: 400, y: 210, width: 70, height: 70, speed: 0.5, direction: -1, yDirection: 1, defeated: false, type: 'flying-pig', yAxis: 210, image: new Image() },

    // Add more Koopas as needed
];
koopas.forEach(koopa => {
    koopa.image.src = `${koopa.type}.png`;
    koopa.image.onload = assetLoaded;
});
totalAssets += koopas.length;

let playerAlive = true;

function update() {
    let now = Date.now();
    let deltaTime = (now - lastUpdateTime) / 1000; // Convert milliseconds to seconds
    lastUpdateTime = now;

    if (!playerAlive || gameFinished) return;
    // Update time left
    timeLeft -= deltaTime;
    if (timeLeft <= 0) {
        playerAlive = false; // Player dies when time runs out
        timeLeft = 0;
    }
    koopas.forEach(koopa => {
        if (!koopa.defeated) {
            koopa.x += koopa.speed * koopa.direction;
            if (koopa.x <= 0 || koopa.x + koopa.width >= canvas.width) {
                koopa.direction *= -1;
            }

            if (koopa.yAxis > 0) {
                koopa.y += koopa.speed * koopa.yDirection;
                if (koopa.y <= koopa.yAxis - 30 || koopa.y >= koopa.yAxis + 30) {
                    koopa.yDirection *= -1;
                }
            }

            // Check for collision with player
            if (player.x < koopa.x + koopa.width &&
                player.x + player.width > koopa.x &&
                player.y < koopa.y + koopa.height &&
                player.y + player.height > koopa.y) {
                
                // Check if player lands on top of Koopa
                if (player.y + player.height - koopa.y < player.velocityY + 10) {
                    koopa.defeated = true; // Koopa is defeated
                    player.velocityY = -5; // Bounce the player up
                } else {
                    playerAlive = false; // Player dies if not landing on top
                }
            }
        }
    });

    player.velocityY += gravity;
    player.y += player.velocityY;
    player.x += player.velocityX;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    platforms.forEach(platform => {
        if (platform.speed) {
            platform.x += platform.speed * platform.direction;
            if (platform.x < platform.minX || platform.x > platform.maxX) {
                platform.direction *= -1; // Change direction
            }
        }

        if (player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            if (player.velocityY >= 0) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                isJumping = false;
            }
        }
    });

    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.size &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.size &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score++;
        }
    });

    if (score === totalCoins) {
       gameFinished = true;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    platforms.forEach(platform => {
        ctx.drawImage(platform.image, platform.x, platform.y, platform.width, platform.height);
    });
    
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.drawImage(coin.image, coin.x, coin.y, coin.size, coin.size);
        }
    });
    ctx.fillStyle = 'blue';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    koopas.forEach(koopa => {
        ctx.drawImage(koopa.image, koopa.x, koopa.y, koopa.width, koopa.height);
    });

    // ... (score display code)
    // Draw timer
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    let formattedTime = Math.ceil(timeLeft);
    ctx.fillText('Time Left: ' + formattedTime, canvas.width - 150, 30);

    if (!playerAlive) {
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    }

    if (gameFinished) {
        ctx.fillText('Game Finished!', canvas.width / 2 - 100, canvas.height / 2);
    }
}

document.addEventListener('keydown', function(event) {
    switch (event.code) {
        case 'Space':
            if (!isJumping) {
                player.velocityY -= 10;
                isJumping = true;
            }
            break;
        case 'ArrowRight':
            player.velocityX = speed;
            break;
        case 'ArrowLeft':
            player.velocityX = -speed;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
        player.velocityX = 0;
    }
});

update();
