const canvas = document.querySelector("output_canvas");
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

const RGBColourPicker = document.getElementsByClassName("RGB_selector");
const savedDrawings = document.getElementById("saved_images");
const mousePointer = document.getElementById("mouse_pointer");
const currentColourDisplay = document.getElementById("selected_colour");
const lineThicknessLabel = document.getElementById("line_thickness_number");

canvasElement.width = window.innerWidth * 0.7;
canvasElement.height = window.innerHeight * 0.7;

window.addEventListener("resize", () => {
    canvasElement.width = window.innerWidth * 0.7;
    canvasElement.height = window.innerHeight * 0.7;
});

var currX = 0,
    currY = 0,
    prevX = 0,
    prevY = 0;
var red = 255,
    green = 255,
    blue = 255;
var dot_flag = false,
    flag = false;
var colour = "black";
var lineWidth = 2;
var pausedrawing = false;
const coolDown = 2000;
var lastPressedPaused = 0;
var lastPressedRandomColour = 0;
var lastPressedLineThickness = 0;
var lastPressedSave = 0;
var RGBPickerExist = false;
var RGBPickerVisible = false;

function getRGB(x, y) {
    var red = Math.floor(255 * x * x);
    var green = Math.floor(255 * x * (1 - x));
    var blue = Math.floor(255 * (1 - x) * (1 - x));

    return "rgb(" + red + "," + green + "," + blue + ")";
}

function draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = colour;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

function findxy(state, coordinates, ctx) {
    if (state == "down") {
        prevX = currX;
        prevY = currY;
        currX = (coordinates.x - 0.15) * window.innerWidth;
        currY = (coordinates.y - 0.2) * window.innerHeight;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = colour;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (state == "up") {
        flag = false;
    }
    if (state == "move") {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = (coordinates.x - 0.15) * window.innerWidth;
            currY = (coordinates.y - 0.2) * window.innerHeight;
            draw(ctx);
        }
    }
}

function drawCursor(coordinateX, coordinateY) {
    mousePointer.style.left = window.innerWidth * coordinateX + "px";
    mousePointer.style.top = window.innerHeight * coordinateY + "px";
}

function clearCanvas(indexTipCoordinate) {
    if (indexTipCoordinate.x < 0.1 && indexTipCoordinate.y < 0.1) {
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}

function pauseDrawing(indexTipCoordinate) {
    if (indexTipCoordinate.x > 0.79 && indexTipCoordinate.x < 0.89 && indexTipCoordinate.y < 0.12) {
        if (Date.now() - lastPressedPaused > coolDown) {
            pausedrawing = !pausedrawing;
            if (pausedrawing) {
                document.getElementById("pause").textContent = "Nastavi crtanje";
            } else {
                document.getElementById("pause").textContent = "Pauziraj crtanje";
            }

            lastPressedPaused = Date.now();
        }
    }
}

function selectGradient(indexTipCoordinate) {
    if (indexTipCoordinate.y >= 0.02 && indexTipCoordinate.y < 0.17) {
        if (indexTipCoordinate.x > 0.5 && indexTipCoordinate.x < 0.54) {
            red = (1 - (indexTipCoordinate.y - 0.02) / 0.15) * 255;
            RGBColourPicker[0].style.backgroundColor = `rgb(${red}, 0, 0)`;
        } else if (indexTipCoordinate.x > 0.55 && indexTipCoordinate.x < 0.59) {
            green = (1 - (indexTipCoordinate.y - 0.02) / 0.15) * 255;
            RGBColourPicker[1].style.backgroundColor = `rgb(0, ${green}, 0)`;
        } else if (indexTipCoordinate.x > 0.6 && indexTipCoordinate.x < 0.64) {
            blue = (1 - (indexTipCoordinate.y - 0.02) / 0.15) * 255;
            RGBColourPicker[2].style.backgroundColor = `rgb(0, 0, ${blue})`;
        } else if (indexTipCoordinate.x > 0.65) {
            selectColour();
        }

        colour = `rgb(${red}, ${green}, ${blue})`;
        currentColourDisplay.style.backgroundColor = colour;
    }
}

function lineThicknessAdjust(indexTipCoordinate) {
    if (Date.now() - lastPressedLineThickness > coolDown / 3) {
        if (indexTipCoordinate.x > 0.11 && indexTipCoordinate.x < 0.13) {
            if (indexTipCoordinate.y > 0.37 && indexTipCoordinate.y < 0.39) {
                lineWidth++;
                lastPressedLineThickness = Date.now();
            } else if (indexTipCoordinate.y > 0.47 && indexTipCoordinate.y < 0.49) {
                if (lineWidth == 1) return;
                lineWidth--;
                lastPressedLineThickness = Date.now();
            }

            lineThicknessLabel.textContent = lineWidth;
        }
    }
}

function saveDrawing(indexTipCoordinate) {
    if (indexTipCoordinate.x > 0.89 && indexTipCoordinate.x < 0.99 && indexTipCoordinate.y < 0.12) {
        if (Date.now() - lastPressedSave > coolDown) {
            const savedCanvas = document.createElement("canvas");
            const savedCtx = savedCanvas.getContext("2d");

            savedCanvas.width = innerWidth * 0.1;
            savedCanvas.height = innerHeight * 0.1;
            savedCanvas.style.background = "white";
            savedCanvas.style.border = "2px,black,solid";

            savedDrawings.prepend(savedCanvas);

            savedCanvas.style.marginBottom = "5vh";

            savedCtx.drawImage(canvasElement, 0, 0, window.innerWidth * 0.1, window.innerHeight * 0.1);

            lastPressedSave = Date.now();
        }
    }
}

function selectColour() {
    if (Date.now() - lastPressedRandomColour > coolDown) {
        for (i = 0; i < RGBColourPicker.length; i++) {
            if (RGBPickerVisible) {
                RGBColourPicker[i].style.display = "none";
            } else {
                RGBColourPicker[i].style.display = "block";
            }
        }

        RGBPickerVisible = !RGBPickerVisible;
        lastPressedRandomColour = Date.now();
    }
}

function changeColour(indexTipCoordinate) {
    if (window.innerHeight * indexTipCoordinate.y < window.innerWidth * 0.06) {
        if (indexTipCoordinate.x > 0.15 && indexTipCoordinate.x < 0.19) {
            colour = "green";
        } else if (indexTipCoordinate.x > 0.2 && indexTipCoordinate.x < 0.24) {
            colour = "blue";
        } else if (indexTipCoordinate.x > 0.25 && indexTipCoordinate.x < 0.29) {
            colour = "red";
        } else if (indexTipCoordinate.x > 0.3 && indexTipCoordinate.x < 0.34) {
            colour = "yellow";
        } else if (indexTipCoordinate.x > 0.35 && indexTipCoordinate.x < 0.39) {
            colour = "white";
        } else if (indexTipCoordinate.x > 0.4 && indexTipCoordinate.x < 0.44) {
            colour = "black";
        } else if (indexTipCoordinate.x > 0.45 && indexTipCoordinate.x < 0.49) {
            pausedrawing = true;
            document.getElementById("pause").textContent = "Nastavi crtanje";

            selectColour();
        }

        currentColourDisplay.style.backgroundColor = colour;
    }
}

function startDrawing(x, y) {
    if (x.x < 0.15 || x.x > 0.85 || x.y < 0.2 || x.y > 0.9) {
        if (RGBPickerVisible) {
            selectGradient(x);
        } else {
            clearCanvas(x);
            pauseDrawing(x);
            saveDrawing(x);
            changeColour(x);
            lineThicknessAdjust(x);
        }
        return false;
    }
    let distance = Math.sqrt((x.x - y.x) ** 2 + (x.y - y.y) ** 2);
    return distance < 0.09;
}

function onResults(results) {
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            landmarks[8].x = 1 - landmarks[8].x;
            landmarks[4].x = 1 - landmarks[4].x;
            if (landmarks[8]) {
                drawCursor(landmarks[8].x, landmarks[8].y);
                var startdrawing = startDrawing(landmarks[8], landmarks[4]);

                if (!pausedrawing) {
                    if (startdrawing && !flag) {
                        findxy("down", landmarks[8], canvasCtx);
                    } else if (startdrawing && flag) {
                        findxy("move", landmarks[8], canvasCtx);
                    } else {
                        findxy("up", landmarks[8], canvasCtx);
                    }
                }
            }
        }
    }
}

const hands = new Hands({
    locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
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
