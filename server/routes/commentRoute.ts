import express from 'express';
import { auth } from '../middleware/auth';
import commentCtrl from '../controllers/commentCtrl';
const router = express.Router();

router.post('/comment', auth, commentCtrl.createComment);
router.patch('/comment/:id', auth, commentCtrl.updateComment);
router.patch('/comment/:id/like', auth, commentCtrl.likeComment);
router.patch('/comment/:id/unlike', auth, commentCtrl.unLikeComment);
router.delete('/comment/:id', auth, commentCtrl.deleteComment);

router.post('/comment/:id/answer', auth, commentCtrl.createAnswerComment);

export default router;