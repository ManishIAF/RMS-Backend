import {Router} from 'express';

import Auth from '../middleware/Auth.js';
import { studentProfile } from '../controllers/studentProfileController.js';

const router = Router();


router.route('/:Id').get(Auth,studentProfile);

export default router;