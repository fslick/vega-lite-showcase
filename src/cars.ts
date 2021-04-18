import { Config, TopLevelSpec, compile } from 'vega-lite';
import { createFolderSync, log, overwriteFileSync } from './lib/common';

const chartName = "cars-scatter-interactive";

const vegaLiteSpec: TopLevelSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "url": "https://vega.github.io/vega-lite/examples/data/cars.json"
    },
    "transform": [
        {
            "calculate": "datum.Origin[0] + datum.Origin[1]",
            "as": "OriginInitial"
        }
    ],
    "mark": "text",
    "encoding": {
        "x": {
            "field": "Horsepower",
            "type": "quantitative"
        },
        "y": {
            "field": "Miles_per_Gallon",
            "type": "quantitative"
        },
        "color": {
            "field": "Origin",
            "type": "nominal",
            "scale": {
                "range": [
                    "purple",
                    "#ff0000",
                    "teal"
                ]
            }
        },
        "text": {
            "field": "OriginInitial",
            "type": "nominal"
        },
        "opacity": {
            "condition": {
                "param": "origin-param",
                "value": 1
            },
            "value": 0.1
        }
    },
    "width": 700,
    "height": 500,
    "params": [
        {
            "name": "origin-param",
            "select": {
                "type": "point",
                "fields": [
                    "Origin"
                ]
            },
            "bind": "legend"
        }
    ]
};

const folderpath = `output/${chartName}`;
createFolderSync(folderpath);

const vegaLiteSpecPath = `${folderpath}/${chartName}.vl.json`;
overwriteFileSync(vegaLiteSpecPath, JSON.stringify(vegaLiteSpec));
log(`Vega-Lite spec: ${vegaLiteSpecPath}`);

const vegaSpec = compile(vegaLiteSpec).spec;
const vegaSpecPath = `${folderpath}/${chartName}.vg.json`;
overwriteFileSync(vegaSpecPath, JSON.stringify(vegaSpec));
log(`Vega spec: ${vegaSpecPath}`);

log("done");