<script setup lang="ts">
defineProps({
  header: String,
  modalId: {
    type: String,
    required: true,
  },
  showCloseBtn: Boolean,
  labelCloseBtn: {
    type: String,
    default: "Close",
  },
  labelSaveBtn: {
    type: String,
    default: "Save",
  },
  disableSaveBtn: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save"]);
</script>

<template>
  <div
    class="modal fade"
    :id="modalId"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="modalId">{{ header }}</h5>
          <button
            type="button"
            class="btn-close"
            data-mdb-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footerbuttons"> </slot>
          <button
            v-if="showCloseBtn"
            type="button"
            class="btn btn-secondary"
            data-mdb-dismiss="modal"
          >
            {{ labelCloseBtn }}
          </button>
          <button
            @click="emit('save')"
            data-mdb-dismiss="modal"
            type="button"
            class="btn btn-primary"
            :disabled="disableSaveBtn"
          >
            {{ labelSaveBtn }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
