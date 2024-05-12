const canvas = document.querySelector(".output_canvas");
const dotCanvas = document.createElement("canvas");
const dotCtx = dotCanvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

dotCanvas.width = window.innerWidth;
dotCanvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    dotCanvas.width = window.innerWidth;
    dotCanvas.height = window.innerHeight;
});

const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const timerElement = document.getElementById("timer");

document.body.appendChild(dotCanvas);

dotCanvas.style.position = "absolute";
dotCanvas.style.top = "0";
dotCanvas.style.left = "0";
dotCanvas.style.zIndex = "1";

var score = 0;
var dotNumber = 3;
var secondsLeft = 3;
var gameRunning = false;
var listOfDots = [];
let timerId;

function getRGB(x, y) {
    var red = Math.floor(255 * x * x);
    var green = Math.floor(255 * x * (1 - x));
    var blue = Math.floor(255 * (1 - x) * (1 - x));

    return "rgb(" + red + "," + green + "," + blue + ")";
}

function drawCircle(coordinateX, coordinateY, ctx) {
    ctx.beginPath();
    ctx.arc(coordinateX * window.innerWidth, coordinateY * window.innerHeight, 50, 0, 2 * Math.PI);
    ctx.fillStyle = getRGB(coordinateX, coordinateY);
    ctx.fill();
    ctx.closePath();
}

function resetRandomSquare() {
    return [Math.random(), Math.random()];
}

function updateScore() {
    var scoreView = document.getElementById("scoreView");
    scoreView.innerText = score;
}

function startTimer(durationInSeconds, onTick, onFinish) {
    let timeRemaining = durationInSeconds;
    let timerId;

    onTick(Math.floor(timeRemaining / 60), timeRemaining % 60);

    timerId = setInterval(() => {
        timeRemaining--;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        onTick(minutes, seconds);

        if (timeRemaining < 0) {
            clearInterval(timerId);
            onFinish();
        }
    }, 1000);

    return timerId;
}

function updateTimer(minutes, seconds) {
    timerElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function finishTimer() {
    listOfDots = [];
    dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    updateTimer(0, 0);
    gameRunning = false;
}

function checkIfInIt(coordinateX, coordinateY) {
    for (var i of listOfDots) {
        if (Math.abs(coordinateX - i[0]) * window.innerWidth + Math.abs(coordinateY - i[1]) * window.innerHeight < 95) {
            score += 1;
            updateScore();
            listOfDots = listOfDots.filter((item) => item !== i);
            drawDots();
        }
    }
}

function drawDots() {
    dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    if (listOfDots.length !== 0) {
        for (const dot of listOfDots) {
            drawCircle(dot[0], dot[1], dotCtx);
        }
    } else {
        dotNumber += 2;
        secondsLeft += 1;
        clearInterval(timerId);
        timerId = startTimer(secondsLeft, updateTimer, finishTimer);
        ThrowDots();
    }
}

function ThrowDots() {
    for (var i = 0; i < dotNumber; i++) {
        listOfDots[i] = resetRandomSquare();
        console.log(listOfDots[i][0], listOfDots[i][1]);
    }

    drawDots();
}

function startGame(indexTipCoordinate) {
    if (1 - indexTipCoordinate.x < 0.1 && indexTipCoordinate.y < 0.1) {
        gameRunning = true;
        score = 0;
        dotNumber = 3;
        secondsLeft = 3;
        timerId = startTimer(secondsLeft, updateTimer, finishTimer);
        ThrowDots();
        updateScore();
    }
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width * -1, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            if (gameRunning) {
                checkIfInIt(1 - landmarks[8].x, landmarks[8].y);
            } else startGame(landmarks[8]);
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
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
});
camera.start();
