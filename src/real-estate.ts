import { Config, TopLevelSpec, compile } from "vega-lite";
import { createFolderSync, log, overwriteFileSync, parseCsvFile } from "./lib/common";
import * as lookup from "country-code-lookup";
import flag from "emoji-flag";

// Dataset: https://datahub.io/stellamaris.sotomayor/real_estate-prices-worldwide

const projectName = "real-estate";

type Header = "Rank"
    | "Country"
    | "City"
    | "Buying_Price_US _$ per_Sq_M."
    | "Rent_per_Month_US_$"
    | "Price/Rent_ Ratio"
    | "%_of_house_price_change_last_year"
    | "%_of_house_price_change_last_5 years"
    | "%_of_house_price_change_last_10 years";
type Row = Record<Header, string>;

let rows: Row[] | undefined = undefined
async function parseCsv() {
    if (!rows) {
        rows = await parseCsvFile<Row>("./data/real_estate.csv");
    }
    return rows;
}

function compileAndSaveSpecs(spec: TopLevelSpec, chartName: string) {
    const folderpath = `output/${projectName}`;
    createFolderSync(folderpath);

    const vegaLiteSpecPath = `${folderpath}/${chartName}.vl.json`;
    overwriteFileSync(vegaLiteSpecPath, JSON.stringify(spec));
    log(`Vega-Lite spec: ${vegaLiteSpecPath}`);

    const vegaSpec = compile(spec).spec;
    const vegaSpecPath = `${folderpath}/${chartName}.vg.json`;
    overwriteFileSync(vegaSpecPath, JSON.stringify(vegaSpec));
    log(`Vega spec: ${vegaSpecPath}`);
}

async function interactiveChart() {
    const chartName = "real-estate-interactive";

    const csv = await parseCsv();
    const data = csv
        .map(r => ({
            "Country": r.Country,
            "City": r.City,
            "Buying Price per m² ($)": r["Buying_Price_US _$ per_Sq_M."],
            "Rent per Month ($)": r.Rent_per_Month_US_$,
            "Continent": lookup.byCountry(r.Country)!.continent,
            "Flag": flag(lookup.byCountry(r.Country)!.iso2)
        }))
        .filter(r => Object.keys(r).every((p => r[(p as keyof typeof r)])))
        .slice(0, 32);

    const vegaLiteSpec: TopLevelSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: data },
        mark: {
            type: "text",
            fontSize: 18
        },
        encoding: {
            x: {
                field: "Rent per Month ($)",
                type: "quantitative",
                axis: {
                    gridDash: [4, 4]
                },
            },
            y: {
                field: "Buying Price per m² ($)",
                type: "quantitative",
                axis: {
                    gridDash: [4, 4]
                }
            },
            color: { field: "Continent" },
            tooltip: [
                { field: "City" },
                { field: "Country" },
                { field: "Buying Price per m² ($)", type: "quantitative" },
                { field: "Rent per Month ($)", type: "quantitative" }
            ],
            text: { field: "Flag" },
            opacity: {
                condition: {
                    param: "continent-selected",
                    value: 1
                },
                value: 0.1
            }
        },
        params: [
            {
                name: "continent-selected",
                select: {
                    type: "point",
                    fields: ["Continent"]
                },
                bind: "legend"
            }
        ],
        width: 600,
        height: 600,
        title: {
            text: "The most expensive cities in the world to buy real estate",
            subtitle: "Hover on the mark to find out more information or highlight the Continent by clicking on its name",
            align: "left",
            anchor: "start"

        },
        config: {
            legend: {
                titleFontSize: 11,
                labelFontSize: 11
            },
            title: {
                fontSize: 14,
                subtitleFontSize: 11
            },
            view: {
                stroke: null
            }
        }
    }

    compileAndSaveSpecs(vegaLiteSpec, chartName);
}

async function representativeScatter() {
    const chartName = "real-estate-scatter";

    const rows = await parseCsv();
    const data = rows
        .map(r => ({
            "Country": r.Country,
            "City": r.City,
            "Continent": lookup.byCountry(r.Country)!.continent,
            "Buying Price per m² ($)": r["Buying_Price_US _$ per_Sq_M."],
            "Rent per Month ($)": r.Rent_per_Month_US_$,
        }))
        .filter(r => Object.keys(r).every((p => r[(p as keyof typeof r)])));

    const highlightedData = [
        "Hong Kong",
        "London",
        "New York",
        "Tokyo",
        "Paris",
        "Singapore",
        "Vienna",
        "Shanghai",
        "Toronto",
        "Sydney",
        "Prague",
        "Moscow",
        "Bermuda",
        "Madrid",
        "Dubai",
        "Istanbul",
        "Bucharest",
        "Cape Town"
    ].map(city => data.find(r => r.City === city)).filter(r => !!r);
    const generalData = data
        .filter(r => !highlightedData.map(d => d!.City).includes(r.City));

    const vegaLiteSpec: TopLevelSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        encoding: {
            x: {
                field: "Rent per Month ($)",
                type: "quantitative",
                axis: { gridDash: [4, 4] },
            },
            y: {
                field: "Buying Price per m² ($)",
                type: "quantitative",
                axis: { gridDash: [4, 4] }
            },
            tooltip: [
                { field: "City" },
                { field: "Country" },
                { field: "Continent" },
                { field: "Buying Price per m² ($)", type: "quantitative" },
                { field: "Rent per Month ($)", type: "quantitative" }
            ]
        },
        layer: [{
            data: { values: generalData },
            mark: {
                type: "point",
                filled: true,
                color: "grey",
                opacity: 0.35,
                size: 75
            }
        }, {
            data: { values: highlightedData },
            mark: {
                type: "point",
                filled: true,
                opacity: 1,
                size: 75
            },
            encoding: {
                color: {
                    field: "Continent",
                    scale: { range: ["#ffbf00", "#e86af0", "#ee4035", "#0392cf", "#028900"] }
                }
            }
        }, {
            data: { values: highlightedData },
            mark: {
                type: "text",
                align: "center",
                dy: -11
            },
            encoding: {
                text: { field: "City" },
                tooltip: null
            }
        }],
        width: 600,
        height: 600,
        title: {
            text: "The most expensive cities in the world to buy real estate",
            subtitle: "You can hover over the dots to find out more information",
            align: "left",
            anchor: "start"
        },
        config: {
            legend: {
                titleFontSize: 11,
                labelFontSize: 11
            },
            title: {
                fontSize: 14,
                subtitleFontSize: 11
            },
            view: { stroke: null }
        }
    }

    compileAndSaveSpecs(vegaLiteSpec, chartName);
}

async function main() {
    await interactiveChart();
    console.log("");

    await representativeScatter();
    console.log("");
    log("done");
}
main();