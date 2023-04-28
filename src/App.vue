<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
</script>

<template>
    <div id="app">
        <NavBar></NavBar>
        <div class="container">
            <router-view />
        </div>
    </div>
</template>

<style scoped></style>
