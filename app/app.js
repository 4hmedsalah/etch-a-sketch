const canvasContainer = document.querySelector(".canvas-container");
const slider = document.querySelector("#grid-slider");
const gridSizeLabel = document.querySelector(".grid-size-label");

// Ratio of 1 : grid Ratio
const gridRatio = 2;
let currentSize = 12;

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

// Clear the canvas and then add CSS grid properties to the canvas element
function setupNewCanvas(gridSize) {
    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }
    canvasContainer.style.gridTemplateColumns = `repeat(${gridSize * gridRatio}, 1fr)`;
    canvasContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
};

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    gridSizeLabel.textContent = `Grid size: ${this.value} x ${this.value * gridRatio}`;
    currentSize = this.value;
    changeGridSize(this.value);
};

// Add the correct amount of divs to the grid
function addSquares(gridSize) {
    for (let i = 1; i <= gridSize * (gridSize * gridRatio); i++) {
        const gridSquare = document.createElement("div");
        gridSquare.classList.add("grid-square");
        gridSquare.id = `Sq${i}`;
        canvasContainer.appendChild(gridSquare);
    };
};