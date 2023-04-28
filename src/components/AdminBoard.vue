<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUsersStore } from "@/store";
import { onMounted } from "vue";
import { fetchDiceBearAvatar } from "@/utils/avatar.utils";
import dayjs from "dayjs";

const usersStore = useUsersStore();
const { getUsers: users } = storeToRefs(usersStore);

onMounted(async () => await usersStore.fetchUsers());

const getAvatarUri = (avatarstyle: string, avatarseed: number) => fetchDiceBearAvatar(avatarstyle, avatarseed);

const getBadgeColor = (value: boolean) => (value ? "badge-success" : "badge-warning");
</script>

<template>
    <div class="table-responsive">
        <table class="table align-middle mb-0 bg-white">
            <thead class="bg-light">
                <tr>
                    <th>Userinfo</th>
                    <th>Created/Modified at</th>
                    <th>Userstatus</th>
                    <th>Onlinestatus</th>
                    <th>Role</th>
                    <!-- <th>Actions</th> -->
                </tr>
            </thead>
            <tbody v-if="users.length > 0">
                <tr v-for="user in users">
                    <td>
                        <div class="d-flex align-items-center">
                            <img
                                :src="getAvatarUri(user.avatarstyle, user.avatarseed)"
                                alt=""
                                style="width: 45px; height: 45px"
                                class="rounded-circle"
                            />
                            <div class="ms-3">
                                <p class="fw-bold mb-1">{{ user.username }}</p>
                                <p class="text-muted mb-0">{{ user.email }}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <p class="fw-normal mb-1">{{ dayjs(user.createdAt) }}</p>
                        <p class="fw-normal mb-1">{{ dayjs(user.updatedAt) }}</p>
                    </td>
                    <td>
                        <span class="badge rounded-pill d-inline" :class="getBadgeColor(user.active)">{{
                            user.active ? "active" : "awaiting"
                        }}</span>
                    </td>
                    <td>
                        <span class="badge rounded-pill d-inline" :class="getBadgeColor(user.online)">{{
                            user.online ? "online" : "offline"
                        }}</span>
                    </td>
                    <td v-for="role in user.roles">{{ role }}</td>
                    <!-- <td>
                        <button type="button" class="btn btn-link btn-sm btn-rounded">Edit</button>
                    </td> -->
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped></style>
