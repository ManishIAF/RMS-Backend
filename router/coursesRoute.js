import {Router} from 'express';

const router = Router();

import Auth from '../middleware/Auth.js';
import {allCourses,coursePost,courseById,courseDelete} from '../controllers/courseController.js'

router.route('/').get(Auth,allCourses).post(Auth,coursePost).delete(Auth,courseDelete);
router.route('/:id').get(courseById)
export default router;