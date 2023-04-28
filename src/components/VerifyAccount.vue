<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/auth.store";
import { useMessageStore } from "@/store/message.store";
import { onMounted } from "vue";

const authStore = useAuthStore();
const { getError: authError, isLoading: loading } = storeToRefs(authStore);

const msgStroe = useMessageStore();
const { getCurrentMessage: message } = storeToRefs(msgStroe);

const route = useRoute();

onMounted(async () => {
    const userId = route.query.userId as string;
    const validateEmailToken = route.query.validateEmailToken as string;
    await authStore.verifyAccount({ userId: userId, validateEmailToken: validateEmailToken });
});
</script>

<template>
    <div class="container py-5">
        <div class="card wide-card bg-dark text-warning">
            <div v-if="loading" class="spinner-grow text-warning" role="status">
                <h3>Activating your account...</h3>
                <span class="visually-hidden">Activating your account...</span>
            </div>
            <h1 v-else>{{ message }}</h1>
            <div v-if="authError" class="alert alert-danger mt-3 mb-0">
                {{ authError }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
