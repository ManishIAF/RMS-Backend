import { Router } from "express";
import Auth from '../middleware/Auth.js';
import {authenticate,verify} from '../controllers/authenticateController.js'
const router = Router();

router.route('/').get(Auth,authenticate)
router.route('/verify').get(Auth,verify)



export default router;