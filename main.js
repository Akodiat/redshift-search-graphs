// Get reference to UI elements
const loadingIndicator = document.getElementById("loadingIndicator");
const inputs = document.getElementById("inputs");
const plotButton = document.getElementById("plotButton");
const plotContainer = document.getElementById("plotContainer");

document.pyodideMplTarget = plotContainer;

function getValue(id) {
    return document.getElementById(id).value;
}

function getBool(id) {
    return document.getElementById(id).checked;
}

function parseFloatList(text) {
    return text.split(",").map(s=>parseFloat(s));
}

window.addEventListener("load", () => {
    plot();
});

async function plot() {
    // Setup pyodide
    // eslint-disable-next-line no-undef
    let pyodide = await loadPyodide();

    // Load numpy
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("numpy");
    await micropip.install("matplotlib");

    // Downloading a single file
    await pyodide.runPythonAsync(`
        from pyodide.http import pyfetch
        response = await pyfetch("./rsg.py")
        with open("rsg.py", "wb") as f:
            f.write(await response.bytes())
    `);
    const rsg = pyodide.pyimport("rsg");

    // Remove loading indicator and show inputs
    loadingIndicator.hidden = true;
    inputs.hidden = false;

    plotButton.onclick = () => {
        rsg.RSGplot(
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
        plotContainer.hidden = false;
    };
}