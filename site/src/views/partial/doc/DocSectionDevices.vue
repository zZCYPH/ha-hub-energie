<script setup>
import carouselInnerRaw from "../../../assets/doc-devices-carousel-inner.include.html?raw";
import { pathTo } from "../../../sitePaths";
</script>

<template>
  <section id="devices" class="doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="devices.title">Device model</span>
      <a
        class="doc-anchor text-secondary"
        href="#devices"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <p class="text-secondary small" data-i18n="devices.intro"></p>

    <h3 class="h5 mt-4 mb-2 doc-subsection" id="devices-gallery">
      <span data-i18n="devices.gallery_title">Devices in Home Assistant</span>
    </h3>
    <p class="text-secondary small" data-i18n="devices.gallery_intro"></p>
    <p class="small text-secondary mb-2">
      <a class="text-body" :href="pathTo('/doc/setup-help')" data-i18n="devices.gallery_link_setup"></a>
      <span class="text-secondary mx-1" aria-hidden="true">·</span>
      <a class="text-body" :href="pathTo('/internals')" data-i18n="devices.gallery_link_internals"></a>
    </p>
    <div class="row g-3">
      <div class="col-lg-3">
        <div class="doc-carousel-tree border rounded-3 p-2 sticky-lg-top">
          <div class="small text-secondary text-uppercase fw-semibold mb-2" data-i18n="devices.tree_label">
            Devices
          </div>
          <nav class="nav flex-column gap-1" id="devicesGalleryTree" aria-label="Devices">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump active"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="0"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g1_t">Bilan énergétique</span>
              <span class="small text-secondary" data-i18n="devices.g1_d">Energy flows</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="1"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g2_t">Coûts</span>
              <span class="small text-secondary" data-i18n="devices.g2_d">Monetary sensors</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="2"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g3_t">Diagnostics</span>
              <span class="small text-secondary" data-i18n="devices.g3_d">Health &amp; quality</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="3"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g4_t">Frontend</span>
              <span class="small text-secondary" data-i18n="devices.g4_d">Lovelace payloads</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="4"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g5_t">Batterie</span>
              <span class="small text-secondary" data-i18n="devices.g5_d">Single battery instance</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="5"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g6_t">Offre</span>
              <span class="small text-secondary" data-i18n="devices.g6_d">Tariff &amp; contract</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="6"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g7_t">Réseau</span>
              <span class="small text-secondary" data-i18n="devices.g7_d">Grid sensors</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="7"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g8_t">Solaire</span>
              <span class="small text-secondary" data-i18n="devices.g8_d">Solar stack</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary text-start doc-carousel-jump"
              data-doc-carousel="#devicesGalleryCarousel"
              data-doc-slide-to="8"
            >
              <span class="fw-semibold d-block" data-i18n="devices.g9_t">Batteries (total)</span>
              <span class="small text-secondary" data-i18n="devices.g9_d">Aggregated</span>
            </button>
          </nav>
        </div>
      </div>
      <div class="col-lg-9">
        <div
          id="devicesGalleryCarousel"
          class="carousel slide carousel-dark doc-doc-carousel card shadow-sm"
          data-bs-ride="false"
          data-bs-touch="false"
          data-i18n-aria="carousel.aria_devices"
          aria-label="Devices"
        >
          <div class="carousel-inner" v-html="carouselInnerRaw"></div>
        </div>
      </div>
    </div>
  </section>
</template>
