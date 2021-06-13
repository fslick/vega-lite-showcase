import { v4 as uuidv4 } from "uuid";
import { Spec } from "vega";

const htmlFragment = `<div id="{{selector}}" class="vis"></div><script>let {{selector}} = {{spec}};vegaEmbed("#{{selector}}", {{selector}}, { renderer: "svg", actions: false });</script>`;

export function createHtmlFragment(spec: Spec) {
    const selector = `_${uuidv4().replace(/-/g, "")}`;
    const specAsString = JSON.stringify(spec);
    return htmlFragment
        .replace(/{{selector}}/g, selector)
        .replace(/{{spec}}/g, specAsString);
}
