import { Router } from "express";
import { login } from "../controllers/loginController.js";

const router = Router()

router.route('/').post(login); //Login user

export default router;
