import express from 'express';
import { register, login, validateToken, googleLogin} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/validate-token', protect, validateToken);
export default router;
