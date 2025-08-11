import { Router } from "express";
import becomePunter from "./routes/becomePunter.js"
import createSignal from "./routes/createSignal.js"
import deposit from "./routes/deposit.js"
import editProfile from "./routes/editProfile.js"
import getFeed from "./routes/getFeed.js"
import getNotification from "./routes/getNotification.js"
import getPunterdetails from "./routes/getPunterdetails.js"
import getPunters from "./routes/getPunters.js"
import getSignal from "./routes/getSignal.js"
import getSubscribedpunter from "./routes/getSubscribedpunters.js"
import getTransaction from "./routes/getTransaction.js"
import getUser from "./routes/getUser.js"
import isSubscribed from "./routes/isSubcribed.js"
import login from "./routes/login.js";
import register from "./routes/register.js"
import subscribe from "./routes/subscribe.js"
import withdrawal from "./routes/withdrawal.js"


const router = Router();

router.use("/becomePunter", becomePunter)
router.use("/createSignal", createSignal)
router.use("/deposit", deposit)
router.use("/editProfile", editProfile)
router.use("/getFeed", getFeed)
router.use("/getNotification", getNotification)
router.use("/getPunterdetails", getPunterdetails)
router.use("/getPunters", getPunters)
router.use("/getSignal", getSignal)
router.use("/getSubscribedpunter", getSubscribedpunter)
router.use("/getTransaction", getTransaction)
router.use("/getUser", getUser)
router.use("/isSubscribed", isSubscribed)
router.use("/login", login);
router.use("/register", register);
router.use("/subscribe", subscribe);
router.use("/withdrawal", withdrawal);


export default router;
