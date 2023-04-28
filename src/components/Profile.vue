<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore, useUsersStore } from "@/store";
import { onMounted, ref } from "vue";
import {
  RandomAvatars,
  fetchDefaultDiceBearAvatar,
  fetchDiceBearAvatar,
  generateAvatars,
} from "@/utils/avatar.utils";
import Modal from "./base/Modal.vue";

const avatarModalId = "avatarModal";

const authStore = useAuthStore();
const { getUser: authUser } = storeToRefs(authStore);

const usersStore = useUsersStore();
const { getError: error } = storeToRefs(usersStore);

const avatar = ref("");
const availableAvatars = ref<RandomAvatars>([]);
const pickedAvatar = ref<number | null>(null);

const username = ref(authUser.value?.username || "");
const editmode = ref(false);

const fetchNewAvatars = () => (availableAvatars.value = generateAvatars());

const saveProfile = async () => {
  const hasChanges =
    authUser.value &&
    (pickedAvatar.value || username.value !== authUser.value.username);
  if (hasChanges) {
    const picked = pickedAvatar.value
      ? availableAvatars.value[pickedAvatar.value]
      : null;
    await usersStore.updateUserById({
      userId: authUser.value.id,
      username: username.value,
      avatarseed: picked ? picked.seed : authUser.value.avatarseed,
      avatarstyle: picked ? picked.style : authUser.value.avatarstyle,
    });
    avatar.value = fetchDiceBearAvatar(
      authUser.value?.avatarstyle,
      authUser.value?.avatarseed
    );
  }
  if (error.value === null) editmode.value = false;
};

const deleteAccount = async () => {
  if (authUser.value) {
    await usersStore.deleteUserById(authUser.value.id);
  }
};

onMounted(async () => {
  if (authUser.value) {
    avatar.value = fetchDiceBearAvatar(
      authUser.value.avatarstyle,
      authUser.value.avatarseed
    );
  } else {
    avatar.value = fetchDefaultDiceBearAvatar();
  }
  availableAvatars.value = generateAvatars();
});
</script>

<template>
  <div class="container">
    <div class="main-body">
      <div class="row gutters-sm">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex flex-column align-items-center text-center">
                <img
                  :src="avatar"
                  alt="Admin"
                  class="rounded-circle"
                  width="150"
                />
                <div class="mt-3">
                  <button
                    type="button"
                    class="btn btn-dark btn-floating btn-sm mb-3"
                    data-mdb-toggle="modal"
                    :data-mdb-target="'#' + avatarModalId"
                  >
                    <font-awesome-icon icon="pencil" />
                  </button>
                  <p class="text-secondary mb-1">{{ authUser?.username }}</p>

                  <Modal
                    header="Choose your avatar"
                    :modal-id="avatarModalId"
                    :show-close-btn="false"
                    label-save-btn="Save avatar"
                    :disable-save-btn="pickedAvatar === null"
                    @save="saveProfile"
                  >
                    <div class="d-flex flex-row bd-highlight mb-3">
                      <ul class="list-group list-group-horizontal">
                        <li
                          v-for="(avatar, index) in availableAvatars"
                          :key="index"
                          class="list-group-item"
                        >
                          <img
                            :src="avatar.uri"
                            alt="Admin"
                            class="rounded-circle"
                            width="150"
                            style="max-height: 50px; max-width: 50px"
                          />
                          <input
                            v-model="pickedAvatar"
                            class="form-check-input"
                            type="radio"
                            :name="'avatarOption_' + index"
                            :id="'avatarOption_' + index"
                            :value="index"
                          />
                        </li>
                      </ul>
                    </div>
                    <template v-slot:footerbuttons
                      ><button
                        :disabled="pickedAvatar === null"
                        @click="pickedAvatar = null"
                        type="button"
                        class="btn btn-outline-warning btn-floating btn-sm me-2"
                      >
                        <font-awesome-icon :icon="['fas', 'xmark']" />
                      </button>
                      <button
                        @click="fetchNewAvatars"
                        type="button"
                        class="btn btn-outline-primary btn-floatin btn-sm me-5"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'arrow-rotate-right']"
                        />
                      </button>
                    </template>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card mb-3">
            <div class="card-body">
              <div class="row">
                <label for="basic-url" class="form-label text-start"
                  >Username</label
                >
                <div class="input-group mb-3">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Recipient's username"
                    aria-label="Recipient's username"
                    aria-describedby="button-addon2"
                    v-model="username"
                    :disabled="!editmode"
                  />
                  <button
                    v-if="!editmode"
                    @click="editmode = !editmode"
                    class="btn btn-outline-secondary"
                    type="button"
                    id="button-addon2"
                  >
                    Edit
                  </button>
                  <button
                    v-else
                    @click="saveProfile"
                    class="btn btn-outline-danger"
                    type="button"
                    id="button-addon2"
                  >
                    Save
                  </button>
                </div>

                <label v-if="error" class="invalid">
                  {{ error }}
                </label>
              </div>
              <hr />
              <div class="row">
                <div class="col-sm-3">
                  <h6 class="mb-0">Email</h6>
                </div>
                <div class="col-sm-9 text-secondary">{{ authUser?.email }}</div>
              </div>
              <div class="row mt-5">
                <button
                  class="btn btn-warning text-danger"
                  type="button"
                  id="button-addon2"
                  data-mdb-toggle="modal"
                  data-mdb-target="#deleteProfileModal"
                >
                  Delete your account
                </button>
                <Modal
                  header="Delete your account"
                  modal-id="deleteProfileModal"
                  :show-close-btn="true"
                  label-save-btn="Delete"
                  label-close-btn="Cancel"
                  @save="deleteAccount"
                >
                  <div class="d-flex flex-row bd-highlight mb-3">
                    <h5>
                      Are you really sure that you want to permanently delete
                      your account?
                    </h5>
                  </div>
                </Modal>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  margin-top: 20px;
  color: #1a202c;
  text-align: left;
  background-color: #e2e8f0;
}
.main-body {
  padding: 15px;
}
.card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 0 solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
}

.card-body {
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1rem;
}

.gutters-sm {
  margin-right: -8px;
  margin-left: -8px;
}

.gutters-sm > .col,
.gutters-sm > [class*="col-"] {
  padding-right: 8px;
  padding-left: 8px;
}
.mb-3,
.my-3 {
  margin-bottom: 1rem !important;
}

.bg-gray-300 {
  background-color: #e2e8f0;
}
.h-100 {
  height: 100% !important;
}
.shadow-none {
  box-shadow: none !important;
}

.list-group-horizontal {
  display: inline-block;
}

.list-group-horizontal .list-group-item {
  display: inline-block;
  width: 33.3%;
  text-align: center;
  margin-bottom: 0;
  margin-left: -4px;
  margin-right: 0;
  border: none;
  border-radius: 0% !important;
  border-top: 1px solid lightgray;
}

.invalid {
  width: auto;
  color: #dc4c64;
  margin-top: -0.75rem;
}
</style>
