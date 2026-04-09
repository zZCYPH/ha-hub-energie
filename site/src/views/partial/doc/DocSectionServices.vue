<template>
  <section id="services" class="doc-section pb-5">
    <h2 class="mb-3">
      <span data-i18n="services.title">Services</span>
      <a
        class="doc-anchor text-secondary"
        href="#services"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <div class="table-responsive rounded-3 border">
      <table class="table table-doc table-striped mb-0">
        <thead>
          <tr>
            <th scope="col" data-i18n="services.th_service">Service</th>
            <th scope="col" data-i18n="services.th_desc">Description</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
          <tr>
            <td><code class="font-mono">hub_energie.refresh</code></td>
            <td data-i18n="services.r1">Force coordinator refresh</td>
          </tr>
          <tr>
            <td><code class="font-mono">hub_energie.refresh_tariffs</code></td>
            <td data-i18n="services.r2">Re-fetch EDF tariffs (auto mode)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
