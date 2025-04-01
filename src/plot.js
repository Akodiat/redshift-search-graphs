
/*global vegaEmbed */

function range(size) {
    return [...Array(size).keys()];
}

const c = 299792458; // m/s
// all freq. in GHz
const restFreqs = new Map([
    ["CO10",   115.27120180],
    ["HCN10",  88.63393600],
    ["H2O211", 752.03314300],
    ["H2O202", 987.92675900],
    ["SIII33", (1e-9)*c/(33.48e-6)], // SIII
    ["SiII34", (1e-9)*c/(34.82e-6)],
    ["OIII52", (1e-9)*c/(51.81e-6)],
    ["NIII57", (1e-9)*c/(57.32e-6)],
    ["OI63",   (1e-9)*c/(63.18e-6)],
    ["OIII88", (1e-9)*c/(88.36e-6)],
    ["NII121", (1e-9)*c/(121.9e-6)],
    ["OI145",  (1e-9)*c/(145.5e-6)],
    ["CII157", (1e-9)*c/(157.7e-6)],
    ["CI370",  (1e-9)*c/(370.5e-6)],
    ["CI609",  (1e-9)*c/(609.6e-6)],
    ["NII205", (1e-9)*c/(205e-6)]
]);

class PlotView {
    constructor(elementId="plotContainer") {
        this.elementId = elementId;
    }

    plot(
        filter_down, filter_up, z_phot=-99, sl_freq_obs=[-99],
        figSizeX=6, figSizeY=4, redshift_down=0, redshift_up=7,
        single_line_colour='#FFD79F', multi_line_colour='#9DDBFF',
        LSBUSB=False, nr_of_CO_lines = 20, dzUncertainty=0.13
    ) {
        const dataSize = 400;

        // Calculate x-axis values
        const redshiftArray = range(dataSize).map(
            i => redshift_down + i*(redshift_up-redshift_down)/dataSize
        );

        const filter_down_min = Math.min(...filter_down);
        const frequency_down = filter_down_min * 0.85;
        const frequency_diff = filter_down_min * 0.15;
        const frequency_up = Math.max(...filter_up) + frequency_diff;

        const data = [];

        const lines = [
            ...range(nr_of_CO_lines).map(i => (
                {
                    type: "CO",
                    restFreq: (i+1)*restFreqs.get("CO10")
                }
            )),
            ...["OIII52", "NIII57", "OI63", "OIII88", "NII121", "OI145",
                "CII157", "NII205", "CI370", "CI609", "H2O211", "H2O202"].map(type=>({
                type,
                restFreq: restFreqs.get(type),
            }))
        ];

        for (let i=0; i<lines.length; i++) {
            const l = lines[i];
            data.push(
                ...redshiftArray.map(redshift=>(
                    {
                        frequency: l.restFreq / (1 + redshift),
                        redshift: redshift,
                        index: i,
                        type: l.type,
                        isCO: l.type !== "CO",
                        restFreq: l.restFreq,
                    }
                ))
            );
        }

        // Find all intersections
        const intersects = lines.flatMap(l=>
            sl_freq_obs.map(f=>({
                frequency: f,
                redshift: (l.restFreq / f) - 1,
                type: l.type,
                restFreq: l.restFreq,
                closestOtherDist: Infinity
            }))
        ).filter(v=> (
            v.redshift >= redshift_down &&
            v.redshift <= redshift_up
        ));

        // List all line types that are actually plotted
        const relevantMolecules = ["CO", ...new Set(data.filter(v => (
            v.type !== "CO" &&
            v.redshift >= redshift_down &&
            v.redshift <= redshift_up &&
            v.frequency >= frequency_down &&
            v.frequency <= frequency_up
        )).map(v=>v.type))];

        for (const p1 of intersects) {
            for (const p2 of intersects) {
                if (p1.frequency !== p2.frequency) {
                    const dist = Math.abs(p1.redshift - p2.redshift);
                    p1.closestOtherDist = Math.min(p1.closestOtherDist, dist)
                    p2.closestOtherDist = Math.min(p2.closestOtherDist, dist)
                }
            }
        }
        const maxDist = Math.max(...intersects.map(p=>p.closestOtherDist));

        const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const vlSpec = {
            $schema: "https://vega.github.io/schema/vega-lite/v6.json",
            width: "container",
            height: 200,
            layer: [
                {
                    data: {values: data},
                    mark: {type: "line", tooltip: {content: "data"}, clip: true, color: "lightgrey", strokeWidth: 1},
                    encoding: {
                        x: {
                            field: "redshift",
                            type: "quantitative",
                            axis: {title: "Redshift [z]", grid: false},
                        },
                        y: {
                            field: "frequency",
                            type: "quantitative",
                            axis: {title: "Frequency [GHz]", grid: false},
                            scale: {domain: [frequency_down, frequency_up]}
                        },
                        detail: {field: "index", type: "nominal"},
                        strokeDash: {
                            field: "type",
                            type: "nominal",
                            title: "Molecule",
                            scale: {
                                domain: relevantMolecules,
                                range: relevantMolecules.map(
                                    (v,i) => [i, i]
                                )
                            },
                            legend: {
                                orient: "bottom", padding: 5
                            },
                        },
                    }
                },
                {
                    data: {values: intersects},
                    mark: {type: "rule", strokeWidth: 5, opacity: 0.5},
                    encoding: {
                        x: {
                            field: "redshift",
                            type: "quantitative",
                        },
                        color: {
                            field: "closestOtherDist",
                            type: "quantitative",
                            scale: {domain: [maxDist, 0], scheme: "goldred"},
                            title: "Distance to match [z]",
                            legend: {
                                orient: "bottom"
                            },
                        }
                    }
                },
                {
                    data: {values: sl_freq_obs.map(v=>({frequency: v}))},
                    mark: {type: "rule", strokeWidth: 0.5, opacity: 0.1},
                    encoding: {
                        y: {
                            field: "frequency",
                            type: "quantitative",
                        }
                    }
                },
                {
                    data: {values: intersects},
                    mark: {type: "point", size: 150, color: "black", tooltip: {content: "data"}},
                    encoding: {
                        x: {
                            field: "redshift",
                            type: "quantitative",
                        },
                        y: {
                            field: "frequency",
                            type: "quantitative",
                        },
                        color: {
                            field: "closestOtherDist",
                            type: "quantitative",
                            scale: {domain: [maxDist, 0]}
                        }
                    }
                }

            ]
        };
        // Embed the visualization in the container
        vegaEmbed("#"+this.elementId, vlSpec);
    }
}

export {PlotView};