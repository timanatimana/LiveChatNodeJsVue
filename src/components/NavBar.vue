<script setup lang="ts">
import { useAuthStore } from "@/store";
import { fetchDiceBearAvatar } from "@/utils/avatar.utils";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const authStore = useAuthStore();
const { getUser: authUser, isAdminUser: admin } = storeToRefs(authStore);

const avatarUri = computed(() => {
    if (authUser.value) return fetchDiceBearAvatar(authUser.value.avatarstyle, authUser.value.avatarseed);
    return "";
});
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#"
                ><div class="navbar-brand d-flex flex-column" href="#">
                    <img src="/chat.svg" alt="" width="30" height="24" /><span class="fs-05">addev - live chat</span>
                </div></a
            >
            <button
                class="navbar-toggler"
                type="button"
                data-mdb-toggle="collapse"
                data-mdb-target="#mainNavbar"
                aria-controls="mainNavbar"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <font-awesome-icon :icon="['fas', 'bars-staggered']" />
            </button>
            <div v-if="authUser" class="collapse navbar-collapse" id="mainNavbar">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link to="/home" class="nav-link"> <font-awesome-icon icon="home" /> Home </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/chat" class="nav-link">
                            <font-awesome-icon icon="comments" /> Chat
                        </router-link>
                    </li>
                    <li v-if="admin" class="nav-item">
                        <router-link to="/admin" class="nav-link">
                            <font-awesome-icon icon="toolbox" /> Admin
                        </router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item dropdown text-dark">
                        <a
                            class="nav-link dropdown-toggle d-flex align-items-center"
                            href="#"
                            id="navbarDropdownMenuLink"
                            role="button"
                            data-mdb-toggle="dropdown"
                            aria-expanded="false"
                            ><div class="badge bg-info text-wrap" style="width: 6rem">{{ authUser.username }}</div>
                            <img
                                :src="avatarUri"
                                class="rounded-circle"
                                height="22"
                                alt="Portrait of a Woman"
                                loading="lazy"
                            />
                        </a>
                        <ul class="dropdown-menu bg-info" aria-labelledby="navbarDropdownMenuLink">
                            <li class="nav-item mt-1">
                                <router-link to="/profile" class="nav-link text-dark p-1">
                                    <font-awesome-icon icon="user" /> Profile
                                </router-link>
                            </li>
                            <li class="nav-item mt-1 text-dark">
                                <button @click="authStore.logout()" class="btn btn-info nav-link text-dark p-1">
                                    <font-awesome-icon icon="sign-out-alt" /> LogOut
                                </button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div v-else class="collapse navbar-collapse" id="mainNavbar">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link to="/login" class="nav-link">
                            <font-awesome-icon icon="sign-in-alt" /> Login
                        </router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link to="/register" class="nav-link">
                            <font-awesome-icon icon="user-plus" /> Sign Up
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<style scoped></style>
