import express from 'express';
import { auth } from '../middleware/auth';
import userCtrl from '../controllers/userCtrl';
const router = express.Router();

router.get('/search', auth, userCtrl.searchUser);
router.get('/user/:id', auth, userCtrl.getUser);
router.patch('/user', auth, userCtrl.updateUser);
router.patch('/user/:id/follow', auth, userCtrl.follow);
router.patch('/user/:id/unfollow', auth, userCtrl.unfollow);
router.get('/suggestion_user', auth, userCtrl.suggestionsUser);

export default router;