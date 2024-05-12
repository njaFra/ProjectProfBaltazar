const canvas = document.querySelector(".output_canvas");
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

const container = document.getElementsByClassName("container")[0];
const mousePointer = document.getElementById("mouse_pointer");
const gameOverLabel = document.getElementById("gameOver");
const scoreList = document.getElementById("scoreList");
var fallingApples = document.getElementsByClassName("falling_apples");

canvasElement.width = window.innerWidth * 0.7;
canvasElement.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvasElement.width = window.innerWidth * 0.7;
    canvasElement.height = window.innerHeight;

    newHeight = window.innerHeight;
    newWidth = window.innerWidth;

    for (const apple of fallingApples) {
        apple.style.top = apple.offsetTop * (newHeight / oldHeight) + "px";
        apple.style.left = apple.offsetLeft * (newWidth / oldWidth) + "px";
    }

    oldHeight = newHeight;
    oldWidth = newWidth;
});

const fruitType = ["apple", "grape", "pear"];
var oldHeight = window.innerHeight,
    oldWidth = window.innerWidth;
var newHeight, newWidth;
var randomSquareX = 0,
    randomSquareY = 0;
var score = 0;
var fallSpeed = 0.01;
var gameRunning = false;
var spawnCoolDown = 1500;
var lastSpawnedApple = 0;
var BestScores = [];
updateBestScore();

function getRGB(x, y) {
    var red = Math.floor(255 * x * x);
    var green = Math.floor(255 * x * (1 - x));
    var blue = Math.floor(255 * (1 - x) * (1 - x));

    return "rgb(" + red + "," + green + "," + blue + ")";
}

function drawCursor(coordinateX, coordinateY) {
    mousePointer.style.left = window.innerWidth * coordinateX + "px";
    mousePointer.style.top = window.innerHeight * coordinateY + "px";
}

function resetRandomSquare() {
    randomSquareX = Math.random();
    randomSquareY = -50;
}

function updateScore() {
    var scoreView = document.getElementById("scoreView");
    scoreView.innerText = score;
}

function updateBestScore() {
    scoreList.innerText = "";
    BestScores.sort(function (a, b) {
        return b - a;
    });
    for (var i = 0; i < 5; i++) {
        scoreList.innerText += `${i + 1}. `;
        if (BestScores[i]) {
            scoreList.innerHTML += `${BestScores[i]}`;
        } else {
            scoreList.innerHTML += `---`;
        }
        scoreList.innerText += "\n";
    }
}

function checkIfInIt(apple) {
    xDiff = apple.offsetLeft - mousePointer.offsetLeft;
    yDiff = apple.offsetTop - mousePointer.offsetTop;
    if (Math.abs(xDiff) + Math.abs(yDiff) < 95) {
        score += 1;
        fallSpeed += 0.0005;
        spawnCoolDown -= 15;
        updateScore();
        container.removeChild(apple);
    }
}

function checkIfFallen(topPosition) {
    if (topPosition > 0.95 * window.innerHeight) {
        fallSpeed = 0.01;
        BestScores.push(score);
        score = 0;
        spawnCoolDown = 2000;
        gameRunning = false;

        updateBestScore();
        gameOverLabel.style.display = "block";
    }
}

function spawnApple() {
    const apple = document.createElement("img");
    apple.className = "falling_apples";
    var randomFruit = fruitType[Math.round(Math.random() * 1000) % 3];
    apple.src = `../pictures/${randomFruit}.png`;

    resetRandomSquare();

    apple.style.top = randomSquareY + "px";
    apple.style.left = window.innerWidth * (0.15 + randomSquareX * 0.66) + "px";

    container.append(apple);
}

function runGame() {
    if (Date.now() - lastSpawnedApple > spawnCoolDown) {
        let randSpawnInt = Math.random();
        if (randSpawnInt < 0.2) {
            spawnApple();
        }
        if (randSpawnInt < 0.05) {
            spawnApple();
        }
        spawnApple();
        lastSpawnedApple = Date.now();
    }

    fallingApples = document.getElementsByClassName("falling_apples");

    for (const apple of fallingApples) {
        apple.style.top = apple.offsetTop + fallSpeed * window.innerHeight + "px";
        checkIfFallen(apple.offsetTop);
        checkIfInIt(apple);
    }
}

function startGame(indexTipCoordinate) {
    if (indexTipCoordinate.x < 0.1 && indexTipCoordinate.y < 0.1) {
        gameRunning = true;
        updateScore();

        while (fallingApples[0]) {
            fallingApples[0].parentNode.removeChild(fallingApples[0]);
        }

        gameOverLabel.style.display = "none";
    }
}

function onResults(results) {
    canvasCtx.save();

    if (gameRunning) {
        runGame();
    }

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            if (landmarks[8]) {
                landmarks[8].x = 1 - landmarks[8].x;
                drawCursor(landmarks[8].x, landmarks[8].y);
                if (!gameRunning) {
                    startGame(landmarks[8]);
                }
            }
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `../node_modules/@mediapipe/hands/${file}`;
    },
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: window.width,
    height: window.height,
});
camera.start();
