<script setup lang="ts">
import { useRoute } from "vue-router";
import { Form } from "vee-validate";
import * as Yup from "yup";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth.store";
import PasswordValidationInput from "./base/PasswordValidationInput.vue";

const authStore = useAuthStore();
const { getError: authError } = storeToRefs(authStore);

const route = useRoute();

const schema = Yup.object().shape({
    password: Yup.string().required("Password is required").min(8),
});

function onSubmit(values: any) {
    const resetToken = route.query.resetToken as string;
    return authStore.resetPassword({ password: values.password, resetToken: resetToken });
}
</script>

<template>
    <div class="container py-5">
        <div class="card wide-card bg-dark text-warning">
            <h2>Set new password</h2>
            <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
                <div class="form-group">
                    <PasswordValidationInput
                        name="password"
                        label="Password"
                        :error="errors.password"
                    ></PasswordValidationInput>
                </div>
                <div class="form-group pt-2">
                    <button class="btn btn-primary" :disabled="isSubmitting">
                        <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                        Reset password
                    </button>
                </div>
                <div v-if="authError" class="alert alert-danger mt-3 mb-0">
                    {{ authError }}
                </div>
            </Form>
        </div>
    </div>
</template>

<style scoped></style>
