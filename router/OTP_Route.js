import { Router } from "express";
import verifyUserAuth from "../middleware/verifyUserAuth.js";
import { generateOTP,verifyOTP } from "../controllers/OTP_Controller.js";
const router = Router();

router.route('/generateOTP').get(generateOTP)
router.route('/verifyOTP').post(verifyOTP);

export default router;
