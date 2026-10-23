import { Router } from "express";
import login from "./routes/login.js";
import signup from "./routes/signup.js";
import getUsers from "./routes/getUsers.js";
import deleteAdmin from "./routes/deleteAdmin.js"
import getAdmin from "./routes/getAdmins.js";
import getTip from "./routes/getTip.js";

const router = Router();

router.use("/login", login);
router.use("/signup", signup);
router.use("/getUsers", getUsers);
router.use("/deleteAdmin", deleteAdmin);
router.use("/getAdmins", getAdmin);
router.use("/getTip", getTip);

export default router;
