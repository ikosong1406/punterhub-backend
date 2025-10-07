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
import changeRole from "./routes/changeRole.js"
import checkUsername from "./routes/checkUsername.js"
import editSignal from "./routes/editSignal.js"
import deleteSignal from "./routes/deleteSignal.js"
import pinSignal from "./routes/pinSignal.js"
import punterRegister from "./routes/punterRegister.js"
import leaderboard from "./routes/leaderboard.js"
import pricing from "./routes/pricing.js"
import winloss from "./routes/winloss.js"
import reset from "./routes/reset.js"
import verifyCode from "./routes/verifyCode.js"
import newpassword from "./routes/newpassword.js"
import getReaction from "./routes/getReaction.js"
import updateReaction from "./routes/updateReaction.js"
import getMessages from "./routes/getMessages.js"
import createMessage from "./routes/createMessage.js"
import sendMessage from "./routes/sendMessage.js"
import getMessagedetails from "./routes/getMessagedetails.js"
import upload from "./routes/upload.js"
import resolve from "./routes/resolve.js"
import getTip from "./routes/getTip.js"
import comment from "./routes/comment.js"
import createTip from "./routes/createTip.js"
import getDaily from "./routes/getDaily.js"
import getPuntertip from "./routes/getPuntertip.js"
import redeemTip from "./routes/redeemTip.js"
import getBoughttip from "./routes/getBoughttip.js"
import buyTip from "./routes/buyTip.js"

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
router.use("/changeRole", changeRole)
router.use("/checkUsername", checkUsername)
router.use("/editSignal", editSignal)
router.use("/deleteSignal", deleteSignal)
router.use("/pinSignal", pinSignal)
router.use("/punterRegister", punterRegister)
router.use("/leaderboard", leaderboard)
router.use("/pricing", pricing)
router.use("/winloss", winloss)
router.use("/reset", reset)
router.use("/verifyCode", verifyCode)
router.use("/newpassword", newpassword)
router.use("/getReaction", getReaction)
router.use("/updateReaction", updateReaction)
router.use("/getMessages", getMessages)
router.use("/createMessage", createMessage)
router.use("/sendMessage", sendMessage)
router.use("/getMessagedetails", getMessagedetails)
router.use("/upload", upload)
router.use("/resolve", resolve)
router.use("/getTip", getTip)
router.use("/comment", comment)
router.use("/createTip", createTip)
router.use("/getDaily", getDaily)
router.use("/getPuntertip", getPuntertip)
router.use("/redeemTip", redeemTip)
router.use("/getBoughttip", getBoughttip)
router.use("/buyTip", buyTip)

export default router;
