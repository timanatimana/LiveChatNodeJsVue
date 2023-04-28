import { defineStore } from "pinia";

export interface MessageState {
    message: string;
}

// stores message for Message.vue component
export const useMessageStore = defineStore({
    id: "message",
    state: (): MessageState => ({
        message: "",
    }),
    getters: {
        getCurrentMessage: (state) => state.message,
    },
    actions: {
        setMessage(value: string) {
            this.message = value;
        },
    },
});
