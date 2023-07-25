import { Router } from "express";
import { register } from "../controllers/registerController.js";

const router = Router()


router.route('/').post(register); //register user

export default router;
