import {PlotView} from "./src/plot.js";

// Get reference to UI elements
const plotButton = document.getElementById("plotButton");
const plotContainer = document.getElementById("plotContainer");
const interSectsTable = document.getElementById("intersectsTable");
const tableBody = document.getElementById("intersectsTableBody");

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
    plotContainer.hidden = false;
    const redshiftMatchDist = parseFloat(getValue("redshiftMatchDist"));
    const intersects = plotView.plot(
        parseFloatList(getValue("sl_freq_obs")),
        redshiftMatchDist,
        parseFloat(getValue("figSizeX")),
        parseFloat(getValue("figSizeY")),
        parseFloat(getValue("redshift_down")),
        parseFloat(getValue("redshift_up")),
        parseFloat(getValue("frequency_padding")),
        parseFloat(getValue("nr_of_CO_lines")),
    );

    // Create table of intersects
    intersects.sort((a, b) => a.closestOtherDist - b.closestOtherDist);
    const unsorted = intersects.map((e, i)=>i);
    const groups = [];
    while (unsorted.length > 0) {
        // Move first element to new group
        const group = [unsorted[0]];
        unsorted.splice(0, 1);
        for (let i=0; i<unsorted.length; i++) {
            if (Math.abs(
                intersects[group[0]].redshift -
                intersects[unsorted[i]].redshift
            ) < redshiftMatchDist
            ) {
                // Add to group
                group.push(unsorted[i]);
                // Remove from unsorted
                unsorted.splice(i, 1);
                i--;
            }
        }
        groups.push(group);
    }

    interSectsTable.hidden = false;

    // Fill table
    tableBody.innerHTML = "";
    for (const group of groups) {
        if (group.length <= 1) {
            continue;
        }
        for (let i=0; i<group.length; i++) {
            const row = document.createElement("tr");
            for (const p of [
                "type",
                "redshift",
                "restFreq",
                "frequency",
                "closestOtherDist",
            ]) {
                const d = document.createElement("td");
                d.innerText = intersects[group[i]][p];
                row.appendChild(d);
                tableBody.appendChild(row);
            }

            if (i === group.length - 1) {
                row.style = "border-bottom: 2px solid #555";
            }
        }
    }
};

