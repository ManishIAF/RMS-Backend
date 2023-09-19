import { Router } from "express";
import {authenticate,refreshToken} from '../controllers/authenticateController.js'
const router = Router();

router.route('/').get(authenticate)
router.route('/refresh-token').get(refreshToken)


export default router;