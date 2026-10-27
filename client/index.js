import { Router } from "express";
import login from "./routes/login.js";
import register from "./routes/register.js";
import reset from "./routes/reset.js";
import verifyCode from "./routes/verifyCode.js";
// import newPassword from "./routes/newPassword.js";
import getUser from "./routes/getUser.js";
import checkout from "./routes/checkout.js";
import activate from "./routes/activate.js";
import getTip from "./routes/getTip.js";
import editProfile from "./routes/editProfile.js";
import createTip from "./routes/createTip.js";
import editTip from "./routes/editTip.js";
import deleteTip from "./routes/deleteTip.js";
import getNotification from "./routes/getNotification.js";

const router = Router();

// update
router.use("/login", login);
router.use("/register", register);
router.use("/reset", reset);
router.use("/verifyCode", verifyCode);
// router.use("/newPassword", newPassword);
router.use("/getUser", getUser);
router.use("/checkout", checkout);
router.use("/activate", activate);
router.use("/getTip", getTip);
router.use("/editProfile", editProfile);
router.use("/createTip", createTip);
router.use("/editTip", editTip);
router.use("/deleteTip", deleteTip);
router.use("/getNotification", getNotification);

export default router;
