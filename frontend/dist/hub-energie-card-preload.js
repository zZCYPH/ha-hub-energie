/**
 * Registered before hub-energie-card.js. modulepreload + import() start loading/evaluating the
 * main bundle early so customElements.define often wins Lovelace’s ~2s window (HA create-element-base).
 */
(() => {
  const here = new URL(import.meta.url);
  const card = new URL("hub-energie-card.js", here);
  card.search = here.search;
  const href = card.href;
  let hasPreload = false;
  const links = document.querySelectorAll('link[rel="modulepreload"]');
  for (let i = 0; i < links.length; i += 1) {
    if (links[i].href === href) {
      hasPreload = true;
      break;
    }
  }
  if (!hasPreload) {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
  void import(href).catch((err) => {
    console.warn("[hub-energie-card-preload] import failed", err);
  });
})();
