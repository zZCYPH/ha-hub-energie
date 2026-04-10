<script setup>
defineProps({
  bundle: { type: Object, required: true },
  noHint: { type: String, required: true },
  menuHeading: { type: String, required: true },
  colField: { type: String, required: true },
  colDescription: { type: String, required: true },
});
</script>

<template>
  <div class="flowhelp-fg-tables">
    <template v-if="bundle.menu_choices?.length">
      <p class="flowhelp-fg-menu-heading small fw-semibold text-body mb-2">{{ menuHeading }}</p>
      <ul class="flowhelp-fg-menu list-unstyled small mb-3">
        <li v-for="c in bundle.menu_choices" :key="'m-' + c.key" class="flowhelp-fg-menu-item py-1 px-2 rounded">
          {{ c.label }}
        </li>
      </ul>
    </template>

    <div v-if="bundle.fields?.length" class="table-responsive flowhelp-fg-table-wrap mb-0">
      <table class="table table-sm table-borderless align-top flowhelp-fg-table mb-3">
        <thead class="visually-hidden">
          <tr>
            <th scope="col">{{ colField }}</th>
            <th scope="col">{{ colDescription }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in bundle.fields" :key="'f-' + f.key">
            <th scope="row" class="flowhelp-fg-cell-label small text-body fw-semibold">{{ f.label }}</th>
            <td class="flowhelp-fg-cell-desc small text-secondary">{{ f.description || noHint }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-for="(sec, secIdx) in bundle.sections || []"
      :key="'s-' + sec.id"
      class="flowhelp-fg-section"
      :class="{ 'flowhelp-fg-section--first': secIdx === 0 && !bundle.fields?.length && !bundle.menu_choices?.length }"
    >
      <p v-if="sec.name" class="flowhelp-fg-section-title small fw-semibold text-body mb-2">{{ sec.name }}</p>
      <div v-if="sec.fields?.length" class="table-responsive flowhelp-fg-table-wrap">
        <table class="table table-sm table-borderless align-top flowhelp-fg-table mb-0">
          <thead class="visually-hidden">
            <tr>
              <th scope="col">{{ colField }}</th>
              <th scope="col">{{ colDescription }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sf in sec.fields" :key="sec.id + '-' + sf.key">
              <th scope="row" class="flowhelp-fg-cell-label small text-body fw-semibold">{{ sf.label }}</th>
              <td class="flowhelp-fg-cell-desc small text-secondary">{{ sf.description || noHint }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped src="../styles/flowhelp/field-guide-tables.css"></style>
