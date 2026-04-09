<template>
  <section id="glossary" class="doc-section pb-4">
    <h2 class="mb-3">
      <span data-i18n="glossary.title">Measured, reconstructed, estimated</span>
      <a
        class="doc-anchor text-secondary"
        href="#glossary"
        data-i18n-aria="section.link_aria"
        aria-label="Link to section"
        >#</a
      >
    </h2>
    <div class="table-responsive rounded-3 border">
      <table class="table table-doc table-striped mb-0">
        <thead>
          <tr>
            <th scope="col" data-i18n="glossary.th_kind">Kind</th>
            <th scope="col" data-i18n="glossary.th_meaning">Meaning</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
          <tr>
            <td><strong data-i18n="glossary.measured">Measured</strong></td>
            <td data-i18n="glossary.measured_meaning"></td>
          </tr>
          <tr>
            <td><strong data-i18n="glossary.recon">Reconstructed</strong></td>
            <td data-i18n="glossary.recon_d">
              Internal totals and per-slot kWh from deltas and optional recorder replay.
            </td>
          </tr>
          <tr>
            <td><strong data-i18n="glossary.est">Estimated</strong></td>
            <td data-i18n="glossary.est_d">Model-based solar and other best-effort paths without a direct meter.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
