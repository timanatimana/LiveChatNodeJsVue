import {
  createChatMessage,
  getChatMessages,
} from "@server/controllers/chat.controller";
import express from "express";

const router = express.Router();

//routes
router.route("/messages").get(getChatMessages);
router.route("/messages/:userId/:message").post(createChatMessage);

export default router;
