import { Router } from "express";
import {verifyToken,passwordRecoveryPost,resetPassword} from "../controllers/passwordRecoveryController.js";
const router = Router()

router.route('/').post(passwordRecoveryPost).put(resetPassword)
router.route('/:token').get(verifyToken)

export default router;