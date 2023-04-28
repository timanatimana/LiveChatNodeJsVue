<script setup lang="ts">
import { useAuthStore, useSocketIoStore, useUsersStore } from "@/store";
import { fetchDefaultDiceBearAvatar, fetchDiceBearAvatar } from "@/utils/avatar.utils";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import dayjs from "dayjs";

const socketIoStore = useSocketIoStore();
const { activeChatSession, chatmessages, isTypingUser } = storeToRefs(socketIoStore);

const userStore = useUsersStore();
const { getOnlineUsers: onlineUsers, isUserOnlineById, getChatSessionUserById } = storeToRefs(userStore);

const authStore = useAuthStore();
const { getUser: authUser } = storeToRefs(authStore);

const getAvatarUri = (avatarstyle: string, avatarseed: number) => fetchDiceBearAvatar(avatarstyle, avatarseed);

const chatmessage = ref("");
const isEven = (index: number) => index % 2 > 0;

const getAvatarUriForUser = (userId: string) => {
    const user = getChatSessionUserById.value(userId);
    if (user) return getAvatarUri(user.avatarstyle, user.avatarseed);
    return fetchDefaultDiceBearAvatar();
};

const sendChatMessage = () => {
    socketIoStore.sendChatMessage(chatmessage.value);
    chatmessage.value = "";
};

watch(chatmessage, (m) => {
    m ? socketIoStore.startTyping() : socketIoStore.stopTyping();
});

onMounted(async () => socketIoStore.getAllOnlineUsers());
</script>

<template>
    <section style="background-color: #cdc4f9">
        <div class="container py-5">
            <div class="row text-start mb-2"><h2>Currently online users:</h2></div>
            <div class="grid-card row">
                <div v-for="onlineUser in onlineUsers" class="col-xl-4 col-lg-3 mb-4">
                    <div class="card small-card">
                        <div class="card-body p-0">
                            <div class="d-flex flex-column align-items-center">
                                <div v-if="isTypingUser(onlineUser.userId)">
                                    <span
                                        class="spinner-grow spinner-grow-sm text-info mr-3"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    <span class="visually-hidden">Typing...</span>
                                </div>
                                <img
                                    :src="getAvatarUri(onlineUser.avatarstyle, onlineUser.avatarseed)"
                                    alt=""
                                    style="width: 45px; height: 45px"
                                    class="rounded-circle"
                                />
                                <div class="ms-1">
                                    <p class="fw-bold fs-6 mb-1">{{ onlineUser.username }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="activeChatSession === null" class="bg-dark text-warning">
                <h5>Sorry, there is no other user online. Cannot initialize chat session!</h5>
            </div>
            <div v-if="authUser && activeChatSession" class="row">
                <div class="col-md-12">
                    <div class="card wide-card" id="chat3" style="border-radius: 15px">
                        <div class="card-body">
                            <div class="row">
                                <div class="scrollable">
                                    <div class="pt-3 pe-3" style="position: relative; height: 400px">
                                        <div v-for="(chatmsg, index) in chatmessages" :key="index">
                                            <div v-if="isEven(index)" class="d-flex flex-row justify-content-start">
                                                <img
                                                    :src="getAvatarUriForUser(chatmsg.user)"
                                                    alt="avatar 1"
                                                    style="width: 45px; height: 100%"
                                                    :class="isUserOnlineById(chatmsg.user) ? '' : 'img-chat-offline'"
                                                />
                                                <div>
                                                    <p
                                                        class="small p-2 ms-3 mb-1 rounded-3"
                                                        :class="
                                                            isUserOnlineById(chatmsg.user)
                                                                ? 'bc-chat-online'
                                                                : 'bc-chat-offline'
                                                        "
                                                    >
                                                        {{ chatmsg.message }}
                                                    </p>
                                                    <p class="small ms-3 mb-3 rounded-3 text-muted float-end">
                                                        {{ dayjs(chatmsg.createdAt).format("MM.DD.YYYY HH:mm:ss") }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div v-else class="d-flex flex-row justify-content-end">
                                                <div>
                                                    <p
                                                        class="small p-2 ms-3 mb-1 rounded-3"
                                                        :class="
                                                            isUserOnlineById(chatmsg.user)
                                                                ? 'bc-chat-online'
                                                                : 'bc-chat-offline'
                                                        "
                                                    >
                                                        {{ chatmsg.message }}
                                                    </p>
                                                    <p class="small ms-3 mb-3 rounded-3 text-muted float-end">
                                                        {{ dayjs(chatmsg.createdAt).format("MM.DD.YYYY HH:mm:ss") }}
                                                    </p>
                                                </div>
                                                <img
                                                    :src="getAvatarUriForUser(chatmsg.user)"
                                                    alt="avatar 1"
                                                    style="width: 45px; height: 100%"
                                                    :class="isUserOnlineById(chatmsg.user) ? '' : 'img-chat-offline'"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex flex-row align-items-center col-lg-8 pt-4 pt-lg-0">
                                    <img
                                        :src="getAvatarUriForUser(authUser.id)"
                                        alt="avatar 3"
                                        style="width: 40px; height: 100%"
                                    />
                                    <div class="pe-2 input-group mb-3">
                                        <input
                                            v-model="chatmessage"
                                            type="text"
                                            class="form-control form-control-lg"
                                            id="exampleFormControlInput2"
                                            placeholder="Type message"
                                            @keyup.enter.native="sendChatMessage"
                                        /><button
                                            @click="sendChatMessage"
                                            :disabled="!chatmessage"
                                            class="btn btn-outline-primary btn-floatin btn-sm"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.scrollable {
    overflow-y: scroll;
}

.small-card {
    padding: 0.5em !important;
    min-width: 100px !important;
}

.grid-card.row > * {
    width: unset !important;
}

::-webkit-scrollbar {
    width: 10px;
    background-color: #e4beef;
}
::-webkit-scrollbar-thumb {
    background-color: #e61faa;
    border-radius: 50px;
    box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.5) inset;
}

.bc-chat-online {
    background-color: #929393;
    color: black;
}

.bc-chat-offline {
    background-color: #f5f6f7;
}

.img-chat-offline {
    opacity: 30%;
}

@media (max-width: 720px) {
    .card {
        padding: 0.2rem;
    }
}
</style>
