<script setup lang="ts">
import { useMessageStore } from "@/store/message.store";
import { storeToRefs } from "pinia";

const msgStroe = useMessageStore();
const { getCurrentMessage: message } = storeToRefs(msgStroe);
</script>

<template>
    <div class="container py-5">
        <div class="card wide-card bg-dark text-warning">
            <p>{{ message }}</p>
        </div>
    </div>
</template>

<style scoped></style>
