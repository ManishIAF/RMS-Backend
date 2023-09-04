import { Router } from "express";
import {authenticate} from '../controllers/authenticateController.js'
const router = Router();

router.route('/').get(authenticate)

export default router;