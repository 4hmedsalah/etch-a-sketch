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

const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");

const DARKEST_GREY = "rgb(60, 60, 60)";
const LIGHTEST_GREY = "rgb(180, 180, 180)";

undoButton.classList.add('disabled');
redoButton.classList.add('disabled');

// Ratio of 1 : grid Ratio
const gridRatio = 2;
let currentSize = 15;

let mouseDown = false;
canvasContainer.onmousedown = () => mouseDown = true;
canvasContainer.onmouseup = () => {
    mouseDown = false;
    if (currentDrawing.length > 0) {
        undoStack.push([...currentDrawing]); // Create a copy of currentDrawing
        currentDrawing = [];

        // Clear redo stack when new drawing is made
        redoStack = [];
        updateHistoryButtons();
    }
};

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

    undoStack = [];
    redoStack = [];
    updateHistoryButtons();
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
    undoStack = [];
    redoStack = [];
    updateHistoryButtons();

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

// Add state management for undo/redo
let undoStack = [];
let redoStack = [];
const maxStackSize = 50; // Limit stack size to prevent memory issues
let currentDrawing = []; // Track squares modified in current drawing action

// Change the background color of the squares based on the selected mode
function setBg(e) {
    if (drawMode === "Draw") {
        const square = e.target;

        // Check if this square is already in the current drawing
        const isDuplicate = currentDrawing.some(change => change.element === square);
        if (isDuplicate) return; // Skip if square is already in current drawing

        const originalColor = square.style.backgroundColor;

        // Apply new color
        switch (colorChoice) {
            case "Default":
                square.style.backgroundColor = DARKEST_GREY;
                break;
            case "Tint":
                tintBg(e);
                break;
            case "70s":
                colorSwatches(e);
                break;
            case "Picker":
                square.style.backgroundColor = pickedColor;
                break;
        }

        // Add to current drawing array only if it's not a duplicate
        currentDrawing.push({
            element: square,
            initialColor: originalColor,
            newColor: square.style.backgroundColor
        });
    } else {
        const square = e.target;

        // Only register erase if square has a color
        if (square.style.backgroundColor !== "") {
            // Check for duplicates in erase mode too
            const isDuplicate = currentDrawing.some(change => change.element === square);
            if (isDuplicate) return;

            currentDrawing.push({
                element: square,
                initialColor: square.style.backgroundColor,
                newColor: ""
            });
            square.style.backgroundColor = "";
        }
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

// Add undo/redo functions
function undo() {
    if (undoStack.length > 0) {
        const lastDrawing = undoStack.pop();
        redoStack.push(lastDrawing);

        lastDrawing.forEach(change => {
            change.element.style.backgroundColor = change.initialColor;
        });

        updateHistoryButtons();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const drawingToRedo = redoStack.pop();
        undoStack.push(drawingToRedo);

        drawingToRedo.forEach(change => {
            change.element.style.backgroundColor = change.newColor;
        });

        updateHistoryButtons();
    }
}

function updateHistoryButtons() {
    undoButton.classList.toggle('disabled', undoStack.length === 0);
    redoButton.classList.toggle('disabled', redoStack.length === 0);
}

undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        undo();
    }
});

redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        redo();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // For undo: Ctrl+Z
    // For redo: Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();  // Prevent browser's default undo/redo

        if (e.shiftKey && redoStack.length > 0) {
            redo();
        } else if (!e.shiftKey && undoStack.length > 0) {
            undo();
        }
    }
});