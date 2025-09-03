import { Router } from "express";
import login from "./routes/login.js";
import signup from "./routes/signup.js";
import getUsers from "./routes/getUsers.js";
import deleteAdmin from "./routes/deleteAdmin.js"
import getAdmin from "./routes/getAdmins.js";
import getSignal from "./routes/getSignal.js";
import getTransactions from "./routes/getTransactions.js";
import transactionStatus from "./routes/transactionStatus.js"

const router = Router();

router.use("/login", login);
router.use("/signup", signup);
router.use("/getUsers", getUsers);
router.use("/deleteAdmin", deleteAdmin);
router.use("/getAdmins", getAdmin);
router.use("/getSignals", getSignal);
router.use("/getTransactions", getTransactions);
router.use("/transactionStatus", transactionStatus);

export default router;
