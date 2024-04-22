import express from "express";
import {
  loginuser,
  logoutuser,
  registeruser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { vt } from "../middlewares/auth.middleware.js";
const router = express.Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registeruser);
router.route("/login").post(loginuser);
router.route("/logout").post(vt, logoutuser);
export default router;
