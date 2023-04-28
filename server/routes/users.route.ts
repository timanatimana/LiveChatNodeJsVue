import {
  updateById,
  getUsers,
  deleteById,
} from "@server/controllers/users.controller";
import express from "express";

const router = express.Router();

//routes
router.route("/update/:userId").post(updateById);
router.route("/delete/:userId").post(deleteById);
router.route("/getall/:userId").get(getUsers);

export default router;
