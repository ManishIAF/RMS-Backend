import { Router } from "express";
import Auth from "../middleware/Auth.js";
import { getProfile,postProfile,updateProfile } from "../controllers/profileController.js";

const router = Router()

router.route('/').get(Auth,getProfile).post(Auth,postProfile).put(Auth,updateProfile);

export default router;