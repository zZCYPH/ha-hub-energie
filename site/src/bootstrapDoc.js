/**
 * Carousels, lightbox, mobile TOC scroll (from public/js/app.js).
 */
function anchorTargetId(href) {
  if (!href || href === "#") return null;
  const parts = href.split("#").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

export function wireDocCarouselImages() {
  document.querySelectorAll("img.doc-carousel-img").forEach((img) => {
    function showFallback() {
      img.classList.add("d-none");
      const wrap = img.parentElement;
      if (!wrap) return;
      const fb = wrap.querySelector(".doc-carousel-fallback");
      if (fb) {
        fb.classList.remove("d-none");
        fb.classList.add("d-flex");
      }
    }
    if (img.complete && img.naturalWidth === 0) showFallback();
    img.addEventListener("error", showFallback);
  });
}

export function wireCarouselPair(carouselId, treeRootId) {
  const el = document.getElementById(carouselId);
  const root = document.getElementById(treeRootId);
  if (!el || !root || typeof bootstrap === "undefined") return;
  const carousel = bootstrap.Carousel.getOrCreateInstance(el, { interval: false });
  function syncTree(idx) {
    root.querySelectorAll(".doc-carousel-jump").forEach((btn) => {
      const to = parseInt(btn.getAttribute("data-doc-slide-to"), 10);
      btn.classList.toggle("active", to === idx);
    });
  }
  root.querySelectorAll(".doc-carousel-jump").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.getAttribute("data-doc-slide-to"), 10);
      if (!isNaN(i)) carousel.to(i);
    });
  });
  el.addEventListener("slid.bs.carousel", () => {
    const items = el.querySelectorAll(".carousel-item");
    const active = el.querySelector(".carousel-item.active");
    const idx = Array.prototype.indexOf.call(items, active);
    if (idx >= 0) syncTree(idx);
  });
  syncTree(0);
}

export function wireImageLightbox() {
  const modalEl = document.getElementById("docImageModal");
  const modalImg = document.getElementById("docImageModalImg");
  if (!modalEl || !modalImg || typeof bootstrap === "undefined") return;
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  document.querySelectorAll("img.doc-zoomable").forEach((img) => {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    function openModal() {
      if (img.classList.contains("d-none")) return;
      const src = img.currentSrc || img.src;
      if (!src) return;
      modalImg.src = src;
      modalImg.alt = img.getAttribute("alt") || "";
      modal.show();
    }
    img.addEventListener("click", openModal);
    img.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        openModal();
      }
    });
  });
  modalEl.addEventListener("hidden.bs.modal", () => {
    modalImg.removeAttribute("src");
    modalImg.alt = "";
  });
}

export function wireTocMobile() {
  document
    .querySelectorAll(
      '#toc-nav-doc-mobile a[href^="#"], #toc-nav-internals-mobile a[href^="#"], #toc-nav-mobile a[href^="#"]',
    )
    .forEach((a) => {
      a.addEventListener("click", () => {
        const href = a.getAttribute("href");
        const id = anchorTargetId(href);
        if (!id) return;
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ block: "start" });
          }, 280);
        }
      });
    });
}
