<script setup lang="ts">
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useAuthStore } from "@/store";
import { storeToRefs } from "pinia";
import PasswordValidationInput from "./base/PasswordValidationInput.vue";

const authStore = useAuthStore();
const { getError: authError } = storeToRefs(authStore);

const schema = Yup.object().shape({
  email: Yup.string().required("Email is required").email(),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required").min(8), // TODO: more secure password
  passwordcompare: Yup.string()
    .required("Compare password is required")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

function onSubmit(values: any) {
  return authStore.register({
    email: values.email,
    password: values.password,
    username: values.username,
  });
}
</script>

<template>
  <div class="container">
    <div class="row">
      <h2 class="pt-5">Register</h2>
    </div>
    <div class="row justify-content-center">
      <div class="card card-body">
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          v-slot="{ errors, isSubmitting }"
        >
          <div class="form-group">
            <label class="col-form-label-sm float-start p-2">Email</label>
            <Field
              name="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
            />
            <div class="invalid-feedback">{{ errors.email }}</div>
          </div>
          <div class="form-group">
            <label class="col-form-label-sm float-start p-2">Username</label>
            <Field
              name="username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
            />
            <div class="invalid-feedback">{{ errors.username }}</div>
          </div>
          <div class="form-group">
            <PasswordValidationInput
              name="password"
              label="Password"
              :error="errors.password"
            ></PasswordValidationInput>
          </div>
          <div class="form-group">
            <PasswordValidationInput
              name="passwordcompare"
              label="PasswordCompare"
              :error="errors.passwordcompare"
            ></PasswordValidationInput>
          </div>
          <div class="form-group pt-2">
            <button class="btn btn-primary" :disabled="isSubmitting">
              <span
                v-show="isSubmitting"
                class="spinner-border spinner-border-sm mr-1"
              ></span>
              Register
            </button>
          </div>
          <div v-if="authError" class="alert alert-danger mt-3 mb-0">
            {{ authError }}
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
