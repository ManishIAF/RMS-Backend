import {Router} from 'express';
import Auth from '../middleware/Auth.js'

import {allProfessorGet,profCourses,professorPost,professorDelete} from '../controllers/professorController.js';

const router = Router()

router.route('/').get(Auth,allProfessorGet).post(Auth,professorPost).delete(Auth,professorDelete);
router.route('/course').get(Auth,profCourses)
// router.route('/course/:profId').get(Auth,profCourses)


export default router;