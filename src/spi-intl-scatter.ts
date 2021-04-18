import { Config, TopLevelSpec, compile } from "vega-lite";
import { createFolderSync, log, overwriteFileSync, parseCsv as parseCsv } from "./lib/common";
import * as lookup from "country-code-lookup";

const chartName = "spi-intl-scatter";

type Header = "rank" | "name" | "confed" | "off" | "def" | "spi";
type Row = Record<Header, string>;

async function main() {
    const csv = await parseCsv<Row>("./data/spi_global_rankings_intl.csv");
    const data = csv.map(r => ({ ...r, countryCode: lookup.byCountry(r.name)?.iso2 }))
        .filter(r => r.countryCode)
        .slice(0, 48);

    const vegaLiteSpec: TopLevelSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: data },
        mark: "text",
        encoding: {
            x: {
                field: "off",
                type: "quantitative"
            },
            y: {
                field: "def",
                type: "quantitative",
            },
            color: {
                field: "confed",
                type: "nominal"
            },
            text: {
                field: "countryCode",
                type: "nominal"
            }
        },
        width: 400,
        height: 300
    }

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
}
main();