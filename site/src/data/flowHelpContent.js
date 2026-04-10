/**

 * Per-step help for Home Assistant config / options dialogs.

 * Linked from HA via: #/doc/setup-help#flow-step-<id> or #flow-step-options-<id>

 *

 * Editing:

 * - Prose & layout: HTML fragments under ../content/flowhelp/bodies/{en,fr}/<key>.html

 *   (one file per step_key; your editor gets real HTML, not nested template literals).

 * - Short titles: ../content/flowhelp/titles.en.json and titles.fr.json

 * - Shell chrome (header, TOC labels): site/lang/en|fr/flowhelp.json via build-i18n

 */



import titlesEn from "../content/flowhelp/titles.en.json";

import titlesFr from "../content/flowhelp/titles.fr.json";



const bodiesEnRaw = import.meta.glob("../content/flowhelp/bodies/en/*.html", {

  eager: true,

  query: "?raw",

  import: "default",

});

const bodiesFrRaw = import.meta.glob("../content/flowhelp/bodies/fr/*.html", {

  eager: true,

  query: "?raw",

  import: "default",

});



function mapBodies(modules) {

  const out = {};

  for (const [path, html] of Object.entries(modules)) {

    const m = /\/([^/]+)\.html$/.exec(path);

    if (m) out[m[1]] = html;

  }

  return out;

}



function buildBag(titles, bodies, langLabel) {

  const bag = {};

  for (const key of Object.keys(titles)) {

    const body = bodies[key];

    if (body === undefined) {

      throw new Error(

        `flowHelpContent: missing ${langLabel} body for "${key}" (add bodies/${langLabel}/${key}.html)`,

      );

    }

    bag[key] = { title: titles[key], body_html: body };

  }

  for (const key of Object.keys(bodies)) {

    if (!Object.prototype.hasOwnProperty.call(titles, key)) {

      throw new Error(

        `flowHelpContent: orphan ${langLabel} body "${key}" (no titles.${langLabel}.json entry — remove file or add title)`,

      );

    }

  }

  return bag;

}



const bodiesEn = mapBodies(bodiesEnRaw);

const bodiesFr = mapBodies(bodiesFrRaw);



export const FLOW_HELP_EN = buildBag(titlesEn, bodiesEn, "en");

export const FLOW_HELP_FR = buildBag(titlesFr, bodiesFr, "fr");

