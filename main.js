import {PlotView} from "./src/plot.js";

// Get reference to UI elements
const plotButton = document.getElementById("plotButton");
const plotContainer = document.getElementById("plotContainer");

// Make sure plots are appended to the correct container
document.pyodideMplTarget = plotContainer;

// Initialise plot view
const plotView = new PlotView();

// Helpers to parse input
function getValue(id) {
    return document.getElementById(id).value;
}
function parseFloatList(text) {
    return text.split(",").map(s=>parseFloat(s));
}


// Create the plot on button press
plotButton.onclick = () => {
    plotView.plot(
        parseFloatList(getValue("sl_freq_obs")),
        parseFloat(getValue("redshiftMatchDist")),
        parseFloat(getValue("figSizeX")),
        parseFloat(getValue("figSizeY")),
        parseFloat(getValue("redshift_down")),
        parseFloat(getValue("redshift_up")),
        parseFloat(getValue("frequency_padding")),
        parseFloat(getValue("nr_of_CO_lines")),
    );
};

