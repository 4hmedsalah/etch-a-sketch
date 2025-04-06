const canvasContainer = document.querySelector(".canvas-container");
const slider = document.querySelector("#grid-slider");
const gridSizeLabel = document.querySelector(".grid-size-label");
const modeSelector = document.querySelector("#mode-selector");
const colorSelector = document.querySelector('#color-selector');
const buttons = document.querySelectorAll(".control");
const appContainer = document.querySelector(".app-container");
const shakeButton = document.querySelector("#shake-button");
const btnSound = new Audio("assets/sounds/click-sound.wav");

const DARKEST_GREY = "rgb(60, 60, 60)";
const LIGHTEST_GREY = "rgb(180, 180, 180)";

// Ratio of 1 : grid Ratio
const gridRatio = 2;
let currentSize = 15;

let mouseDown = false;
window.onmousedown = () => mouseDown = true;
window.onmouseup = () => mouseDown = false;

let colorChoice = "Default";
colorSelector.textContent = colorChoice;
colorSelector.addEventListener('click', setColor);

function setColor() {
    const colorModes = ["Default", "Tint", "70s"];
    let currentIndex = colorModes.indexOf(colorChoice);
    let nextIndex = (currentIndex + 1) % colorModes.length;

    colorChoice = colorModes[nextIndex];
    colorSelector.textContent = colorChoice;
}

let drawMode = "Draw";
modeSelector.textContent = drawMode;
modeSelector.addEventListener("click", setMode);

function setMode() {
    if (drawMode === "Draw") {
        drawMode = "Erase";
    } else {
        drawMode = "Draw";
    };
    modeSelector.textContent = drawMode;
};

function changeGridSize(gridSize) {
    setupNewCanvas(gridSize);
    addSquares(gridSize);
};

// Setup default canvas
function defaultCanvas(size, min, max) {
    changeGridSize(size);
    slider.setAttribute("value", size);
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    gridSizeLabel.textContent = `Grid size: ${size} x ${size * gridRatio}`;
};

// Input default canvas settings
defaultCanvas(currentSize, 10, 50);//starting rows, min rows , max rows

// Clear the canvas and set up the grid layout
function setupNewCanvas(gridSize) {
    canvasContainer.innerHTML = ""; // Remove all existing grid squares
    canvasContainer.style.gridTemplateColumns = `repeat(${gridSize * gridRatio}, 1fr)`;
    canvasContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
};

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    gridSizeLabel.textContent = `Grid size: ${this.value} x ${this.value * gridRatio}`;
    currentSize = this.value;
    changeGridSize(this.value);
};

// Add button click sound
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        btnSound.currentTime = 0;
        btnSound.volume = 0.3; // Sets the volume to 30%
        btnSound.play();
    });
});

// Add the correct amount of divs to the grid
function addSquares(gridSize) {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= gridSize * (gridSize * gridRatio); i++) {
        const gridSquare = document.createElement("div");
        gridSquare.classList.add("grid-square");
        gridSquare.id = `Sq${i}`;
        gridSquare.addEventListener("mousedown", setBg);
        gridSquare.addEventListener("mouseover", mousetrail);
        fragment.appendChild(gridSquare);
    }
    canvasContainer.appendChild(fragment);
}

shakeButton.addEventListener("click", shakeCanvas);

function handleAnimationEnd() {
    appContainer.classList.remove("canvas-shake");
    appContainer.removeEventListener("animationend", handleAnimationEnd);
}

// Adds a shake animation to the canvas and clears the grid squares
function shakeCanvas() {
    const squares = document.querySelectorAll(".grid-square");
    squares.forEach(square => square.style.backgroundColor = "");
    appContainer.classList.add("canvas-shake");
    appContainer.addEventListener("animationend", handleAnimationEnd);
}

// Add hover effect
function mousetrail(e) {
    if (mouseDown) {
        setBg(e);
    }
    e.target.classList.add("hover");
    e.target.addEventListener("transitionend", () => e.target.classList.remove("hover"));
};

// Change the background color of the squares
function setBg(e) {
    if (drawMode === "Draw") {
        switch (colorChoice) {
            case "Default":
                e.target.style.backgroundColor = DARKEST_GREY; // Default color
                break;
            case "Tint":
                tintBg(e);
                break;
            case "70s":
                colorSwatches(e);
                break;
        };
    } else {
        e.target.style.backgroundColor = ""; // Erase the background color
    }
};

let colorSelection = 0;

function colorSwatches(e) {
    const colors = ["#3F8A8C", "#0C5679", "#0B0835", "#E5340B", "#F28A0F", "#FFE7BD"];
    if (colorSelection > colors.length - 1) { colorSelection = 0; };
    e.target.style.backgroundColor = colors[colorSelection];
    colorSelection++;
}

//This function is used for the 'Tint' draw mode
function tintBg(e) {
    //If there's no bg color on the square, set it to the lightest tint
    if (e.target.style.backgroundColor === "") {
        e.target.style.backgroundColor = LIGHTEST_GREY;

        //Otherwise, get the RGB value of the current bg color and map it to an array
    } else {
        const currentColor = e.target.style.backgroundColor;
        const currentArray = currentColor.match(/\d+/g).map(Number);

        //If the color is already the darkest grey, stop tinting
        if (currentColor === DARKEST_GREY) {
            return;

            //Otherwise, if the color is grey, make it darker
        } else if (currentArray[0] === currentArray[1] && currentArray[0] === currentArray[2]) {
            const newValue = currentArray[0] - 40;
            e.target.style.backgroundColor = `rgb(${newValue}, ${newValue}, ${newValue})`;

            //If it's a color other than grey, also set it to the lightest tint
        } else {
            e.target.style.backgroundColor = LIGHTEST_GREY;
        };
    };
};