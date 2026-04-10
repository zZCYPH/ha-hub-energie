<template>
  <div
    class="site-doc-image-modal modal fade"
    id="docImageModal"
    tabindex="-1"
    data-i18n-aria="doc.modal_aria"
    aria-label="Full-size screenshot"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl px-2 mx-auto">
      <div class="modal-content shadow-lg">
        <div class="modal-header py-2 flex-wrap border-bottom-0">
          <p class="mb-0 small text-secondary flex-grow-1 text-start pe-2" data-i18n="doc.modal_hint">
            Full width; scroll if needed.
          </p>
          <button
            type="button"
            class="btn-close ms-auto"
            data-bs-dismiss="modal"
            data-i18n-aria="doc.modal_close_aria"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-center py-2 px-2">
          <img id="docImageModalImg" src="" alt="" class="rounded" decoding="async" />
        </div>
      </div>
    </div>
  </div>
</template>
