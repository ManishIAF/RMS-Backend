import { Router } from 'express';
import Auth from '../middleware/Auth.js';
const router = Router();
// const upload = require('../middleware/imageMiddleware');

import { singleStudentGet,studentResult,allStudentGet,studentPost,studentDelete,studentPatch} from '../controllers/studentController.js';


router.route('/').get(Auth,allStudentGet).post(Auth,studentPost).delete(Auth,studentDelete).patch(Auth,studentPatch);
router.route('/getone').get(Auth,singleStudentGet)
router.route('/studentResult').get(Auth,studentResult)
router.route('/:rollNumber').get(Auth,singleStudentGet);
 
export default router;
