const canvasContainer = document.querySelector(".canvas-container");
const slider = document.querySelector("#grid-slider");
const gridSizeLabel = document.querySelector(".grid-size-label");
const modeSelector = document.querySelector("#mode-selector");
const colorSelector = document.querySelector('#color-selector');
const colorPicker = document.querySelector('#color-picker');
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

let pickedColor = "#000000"; // Default color for the color picker

// Switch between color modes
function setColor() {
    const colorModes = ["Default", "Tint", "70s", "Picker"];
    let currentIndex = colorModes.indexOf(colorChoice);
    let nextIndex = (currentIndex + 1) % colorModes.length;

    colorChoice = colorModes[nextIndex];
    colorSelector.textContent = colorChoice;

    // Show/hide color picker based on mode
    if (colorChoice === "Picker") {
        colorPicker.classList.add('visible');
    } else {
        colorPicker.classList.remove('visible');
    }
}

// Add color picker change handler
colorPicker.addEventListener('input', (e) => {
    pickedColor = e.target.value;
});

let drawMode = "Draw";
modeSelector.textContent = drawMode;
modeSelector.addEventListener("click", setMode);

// Cycle through draw and erase modes
function setMode() {
    drawMode = drawMode === "Draw" ? "Erase" : "Draw";
    modeSelector.textContent = drawMode;
}

function changeGridSize(gridSize) {
    setupNewCanvas(gridSize);
    addSquares(gridSize);
}

// Initialize the default canvas with size, min, and max grid values
function defaultCanvas(size, min, max) {
    changeGridSize(size);
    slider.setAttribute("value", size);
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    gridSizeLabel.textContent = `Grid size: ${size} x ${size * gridRatio}`;
}

// Input default canvas settings
defaultCanvas(currentSize, 10, 50);//starting rows, min rows , max rows

// Clear the canvas and set up the grid layout
function setupNewCanvas(gridSize) {
    canvasContainer.innerHTML = ""; // Remove all existing grid squares
    canvasContainer.style.gridTemplateColumns = `repeat(${gridSize * gridRatio}, 1fr)`;
    canvasContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
}

// Update the grid size label as the slider is dragged
slider.oninput = function () {
    gridSizeLabel.textContent = `Grid size: ${this.value} x ${this.value * gridRatio}`;
    currentSize = this.value;
};

// Reset the grid only when the user releases the slider handle
slider.onchange = function () {
    // Update the grid size
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

// Dynamically add grid squares to the canvas
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

// Adds a shake animation to the canvas and clears the grid squares
function shakeCanvas() {
    const squares = document.querySelectorAll(".grid-square");
    squares.forEach((square) => (square.style.backgroundColor = "")); // Clear all squares
    appContainer.classList.add("canvas-shake");
    appContainer.addEventListener("animationend", handleAnimationEnd);
}

// Handles the end of the shake animation by removing the animation class
function handleAnimationEnd() {
    appContainer.classList.remove("canvas-shake");
    appContainer.removeEventListener("animationend", handleAnimationEnd);
}

// Add hover effect to grid squares
function mousetrail(e) {
    if (mouseDown) {
        setBg(e); // Change background color if mouse is down
    }
    e.target.classList.add("hover"); // Add hover effect
    e.target.addEventListener("transitionend", () => e.target.classList.remove("hover"));
}

// Change the background color of the squares based on the selected mode
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
            case "Picker":
                e.target.style.backgroundColor = pickedColor;
                break;
        };
    } else {
        e.target.style.backgroundColor = ""; // Erase the background color
    }
}

let colorSelection = 0;

// Cycle through a predefined set of colors for the "70s" mode
function colorSwatches(e) {
    const colors = ["#3F8A8C", "#0C5679", "#0B0835", "#E5340B", "#F28A0F", "#FFE7BD"];
    if (colorSelection > colors.length - 1) {
        colorSelection = 0;
    }
    e.target.style.backgroundColor = colors[colorSelection];
    colorSelection++;
}

// Tint the background color of a square by darkening or resetting it
function tintBg(e) {
    if (e.target.style.backgroundColor === "") {
        e.target.style.backgroundColor = LIGHTEST_GREY; // Set to lightest tint if no color
    } else {
        const currentColor = e.target.style.backgroundColor;
        const currentArray = currentColor.match(/\d+/g).map(Number);

        if (currentColor === DARKEST_GREY) {
            return; // Stop if already the darkest grey
        } else if (currentArray[0] === currentArray[1] && currentArray[0] === currentArray[2]) {
            const newValue = currentArray[0] - 40; // Darken the grey
            e.target.style.backgroundColor = `rgb(${newValue}, ${newValue}, ${newValue})`;
        } else {
            e.target.style.backgroundColor = LIGHTEST_GREY; // Reset to lightest tint if not grey
        }
    }
}