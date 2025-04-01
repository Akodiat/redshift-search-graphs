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
function getBool(id) {
    return document.getElementById(id).checked;
}
function parseFloatList(text) {
    return text.split(",").map(s=>parseFloat(s));
}


// Create the plot on button press
plotButton.onclick = () => {
    plotView.plot(
        parseFloatList(getValue("filter_down")),
        parseFloatList(getValue("filter_up")),
        parseFloat(getValue("z_phot")),
        parseFloatList(getValue("sl_freq_obs")),
        parseFloat(getValue("figSizeX")),
        parseFloat(getValue("figSizeY")),
        parseFloat(getValue("redshift_down")),
        parseFloat(getValue("redshift_up")),
        getValue("single_line_colour"),
        getValue("multi_line_colour"),
        getBool("LSBUSB"),
        parseFloat(getValue("nr_of_CO_lines")),
        parseFloat(getValue("dzUncertainty"))
    );
};

