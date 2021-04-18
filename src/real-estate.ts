import { Config, TopLevelSpec, compile } from "vega-lite";
import { createFolderSync, log, overwriteFileSync, parseCsv } from "./lib/common";
import * as lookup from "country-code-lookup";
// import * as flag from "emoji-flag";

var flag = require('emoji-flag'); // TODO typings

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
async function parseData() {
    if (!rows) {
        rows = await parseCsv<Row>("./data/real_estate.csv");
    }
    const data = rows
        .map(r => ({
            "Country": r.Country,
            "City": r.City,
            "Buying Price per m² ($)": r["Buying_Price_US _$ per_Sq_M."],
            "Rent per Month ($)": r.Rent_per_Month_US_$,
            "Continent": lookup.byCountry(r.Country)!.continent,
            "Region": lookup.byCountry(r.Country)!.region,
            "Flag": flag(lookup.byCountry(r.Country)!.iso2)
        }))
        .filter(r => Object.keys(r).every((p => r[(p as keyof typeof r)])));
    return data;
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

    const data = await parseData();

    const vegaLiteSpec: TopLevelSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: data },
        mark: {
            type: "text",
            filled: true,
            fontSize: 18
        },
        encoding: {
            x: {
                field: "Rent per Month ($)",
                type: "quantitative"
            },
            y: {
                field: "Buying Price per m² ($)",
                type: "quantitative",
            },
            color: { field: "Continent" },
            tooltip: [
                { field: "City" },
                { field: "Country" },
                { field: "Rent per Month ($)", type: "quantitative" }],
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
        config: {
            legend: {
            }
        }
    }

    compileAndSaveSpecs(vegaLiteSpec, chartName);
}

async function representativeScatter() {
    const chartName = "real-estate-scatter";

    const data = await parseData();

   const vegaLiteSpec: TopLevelSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        encoding: {
            x: {
                field: "Rent per Month ($)",
                type: "quantitative"
            },
            y: {
                field: "Buying Price per m² ($)",
                type: "quantitative",
            },
            color: { field: "Continent" },
            tooltip: [
                { field: "City" },
                { field: "Country" },
                { field: "Rent per Month ($)", type: "quantitative" },
                { field: "Buying Price per m² ($)", type: "quantitative" }
            ]
        },
        params: [
        ],
        layer: [{
            data: { values: data },
            mark: {
                type: "point",
                filled: true,
                size: 60
            },
            encoding: {
                opacity: {
                    condition: {
                        param: "continent-selected-2",
                        value: 1
                    },
                    value: 0.067
                }
            },
            params: [
                {
                    name: "continent-selected-2",
                    select: {
                        type: "point",
                        fields: ["Continent"]
                    },
                    bind: "legend"
                }
            ]
        }, {
            data: { values: data },
            mark: {
                type: "text",
                align: "center",
                dy: -10
            },
            encoding: {
                text: {
                    field: "Flag",
                },
                opacity: {
                    condition: {
                        param: "continent-selected-1",
                        value: 1
                    },
                    value: 0.067
                }
            },
            params: [
                {
                    name: "continent-selected-1",
                    select: {
                        type: "point",
                        fields: ["Continent"]
                    },
                    bind: "legend"
                }
            ]
        }],
        width: 500,
        height: 500,
        config: {
            legend: {
            }
        }
    }

    compileAndSaveSpecs(vegaLiteSpec, chartName);
}

async function main() {
    await interactiveChart();
    await representativeScatter();
    log("done");
}
main();