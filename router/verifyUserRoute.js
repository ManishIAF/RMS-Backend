import { Router } from "express";
import verifyUserAuth from "../middleware/verifyUserAuth.js";
// import userIdentification from '../controllers/verifyUserController.js'



const router = Router();


router.route('/').post(verifyUserAuth); //authenticate user

export default router;
