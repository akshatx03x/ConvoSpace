import express from 'express';
import { register, login, validateToken} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/validate-token', protect, validateToken);
export default router;
