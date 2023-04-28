<script setup lang="ts">
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
import { useAuthStore } from "@/store";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import EmailValidationInput from "./base/EmailValidationInput.vue";
import PasswordValidationInput from "./base/PasswordValidationInput.vue";

const authStore = useAuthStore();
const { getError: authError, isLoading: isLoading, isShowForcedLogout } = storeToRefs(authStore);

const loginSchema = Yup.object().shape({
    email: Yup.string().required("Valid Email is required").email(),
    password: Yup.string().required("Password is required").min(8),
});

async function onSubmit(values: any) {
    return await authStore.login({ email: values.email, password: values.password });
}

const requestEmail = ref("");
const requestIsValid = ref(false);

async function forgotPassword() {
    await authStore.forgotPassword(requestEmail.value);
}

async function forcedLogout(values: any) {
    authStore.logout(values.email);
}
</script>

<template>
    <div class="container">
        <div class="row">
            <h2 class="pt-5">Login</h2>
        </div>
        <div class="row justify-content-center">
            <div class="card card-body">
                <Form @submit="onSubmit" :validation-schema="loginSchema" v-slot="{ errors, isSubmitting, values }">
                    <div class="form-group">
                        <label class="col-form-label-sm float-start p-2">Email</label>
                        <Field name="email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
                        <div class="invalid-feedback">{{ errors.email }}</div>
                    </div>
                    <div class="form-group pt-3">
                        <PasswordValidationInput
                            name="password"
                            label="Password"
                            :error="errors.password"
                        ></PasswordValidationInput>
                    </div>
                    <div class="form-group pt-5">
                        <button class="btn btn-primary btn-large btn-lg btn-block" :disabled="isSubmitting">
                            <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                            Login
                        </button>
                    </div>
                    <div v-if="isShowForcedLogout">
                        <button class="btn btn-warning btn-sm mt-3" type="button" @click="forcedLogout(values)">
                            <span v-show="isLoading" class="spinner-border spinner-border-sm mr-1"></span>
                            Force logout on all devices
                        </button>
                    </div>
                </Form>
            </div>
        </div>
        <div v-if="authError" class="alert alert-danger mt-3 mb-0">
            {{ authError }}
        </div>
        <div class="row justify-content-center mt-5">
            <p>
                <button
                    class="btn btn-outline-info btn-sm"
                    type="button"
                    data-mdb-toggle="collapse"
                    data-mdb-target="#collapseExample"
                    aria-expanded="false"
                    aria-controls="collapseExample"
                >
                    Forgot Password
                </button>
            </p>
            <div class="collapse col-auto" id="collapseExample">
                <div class="card card-body text-white bg-info">
                    <form>
                        <div class="form-group row">
                            <EmailValidationInput
                                v-model="requestEmail"
                                label="Send email to request link to set new password"
                                @valid="requestIsValid = $event"
                            >
                            </EmailValidationInput>
                        </div>
                        <div class="form-group row pt-3">
                            <button
                                class="btn btn-warning btn-sm"
                                type="button"
                                @click="forgotPassword"
                                :disabled="requestEmail.length === 0 || !requestIsValid"
                            >
                                <span v-show="isLoading" class="spinner-border spinner-border-sm mr-1"></span>
                                Send email request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
