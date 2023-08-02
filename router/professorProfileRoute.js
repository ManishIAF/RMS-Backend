import { Router } from "express";
import Auth from "../middleware/Auth.js";
import { getProfessorProfile,postProfile,updateProfile } from "../controllers/profileController.js";

const router = Router()

router.route('/').get(Auth,getProfessorProfile).post(Auth,postProfile).put(Auth,updateProfile);
router.route('/:Id').get(Auth,getProfessorProfile)

export default router;