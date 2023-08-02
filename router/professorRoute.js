import {Router} from 'express';
import Auth from '../middleware/Auth.js'

import {allProfessorGet,professorById,profCourses,professorPost,professorDelete,professorUpdate} from '../controllers/professorController.js';

const router = Router()

router.route('/').get(Auth,allProfessorGet).post(Auth,professorPost).delete(Auth,professorDelete).patch(Auth,professorUpdate);
router.route('/course').get(Auth,profCourses)
router.route('/:id').get(Auth,professorById)


export default router;