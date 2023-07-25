import { Router } from 'express';
import Auth from '../middleware/Auth.js'

const router = Router()

import {resultAllGet,resultPost,resultSingleGet,resultUpdate,resultdelete} from '../controllers/resultController.js';

router.route('/').get(Auth,resultAllGet).post(Auth,resultPost)
router.route('/:id').get(Auth,resultSingleGet).patch(Auth,resultUpdate).delete(Auth,resultdelete);

export default router;
