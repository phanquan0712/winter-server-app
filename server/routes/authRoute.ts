import express from 'express';
import authCtrl from '../controllers/authCtrl';
import { validateRegister } from '../middleware/valid';


const router = express.Router();

router.post('/register', validateRegister, authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.post('/refresh_token', authCtrl.refreshToken);


export default router;