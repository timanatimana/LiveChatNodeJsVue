<script setup lang="ts">
import { ref } from "vue";
import { Field } from "vee-validate";

defineProps({
  label: String,
  name: {
    type: String,
    required: true,
  },
  error: String,
});

const showPassword = ref(false);
const toggleShowPassword = () => (showPassword.value = !showPassword.value);
</script>

<template>
  <label class="col-form-label-sm float-start">{{ label }}</label>
  <font-awesome-icon
    class="float-end pt-2"
    @click="toggleShowPassword"
    :icon="showPassword ? 'eye' : 'eye-slash'"
  />
  <Field
    :name="name"
    :type="showPassword ? 'text' : 'password'"
    class="form-control"
    :class="{ 'is-invalid': error }"
  />
  <div class="invalid-feedback">{{ error }}</div>
</template>

<style scoped></style>
