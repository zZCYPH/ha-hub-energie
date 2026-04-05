/** Replace `{key}` placeholders in a translation string. */
export function tpl(template, vars) {
  let out = String(template);
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}
