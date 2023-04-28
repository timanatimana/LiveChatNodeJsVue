<script setup lang="ts">
import * as Yup from "yup";
import { ref } from "vue";

defineProps({
  label: String,
  modelValue: {
    type: String,
  },
});

const emit = defineEmits(["update:modelValue", "valid"]);

const requestSchema = Yup.object().shape({
  email: Yup.string().required("Valid Email is required").email(),
});

const validationError = ref("");

const requestValid = (value: string) => {
  requestSchema
    .validate({ email: value })
    .then(() => (validationError.value = ""))
    .catch((err) => (validationError.value = err.message))
    .then(() => {
      emit("valid", validationError.value.length === 0);
      emit("update:modelValue", value);
    });
};
</script>

<template>
  <label for="inputEmail" class="col-form-label-sm">{{ label }}</label>
  <div>
    <input
      :value="modelValue"
      type="email"
      @input="requestValid(($event.target as HTMLInputElement).value)"
      class="form-control"
      :class="{ 'is-invalid': validationError.length !== 0 }"
      id="requestEmail"
      placeholder="Email"
    />
    <div class="invalid-feedback">{{ validationError }}</div>
  </div>
</template>

<style scoped></style>
