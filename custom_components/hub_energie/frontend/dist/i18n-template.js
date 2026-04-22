function i(n, o) {
  let t = String(n);
  for (const [r, e] of Object.entries(o))
    t = t.split(`{${r}}`).join(String(e));
  return t;
}
export {
  i as t
};
