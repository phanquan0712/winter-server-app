import { IComment } from "../config/interface";
import { IReqAuthType } from "../config/interface";
import { Request, Response } from "express";
import Comments from "../models/commentModel";
import Posts from "../models/postModel";


const commentCtrl = {
   createComment: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         const { postId, content, tag, reply} = req.body;   
         const newComment = new Comments({
            user: req.user._id, content, tag, reply
         })
         const post = await Posts.findByIdAndUpdate(postId, { $push: { comments: newComment._id }}, { new: true});
         if(!post) return res.status(400).json({ msg: 'Post not found!' });
         await newComment.save();

         res.json({newComment})
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
   updateComment: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         const {  content } = req.body;   
         await Comments.findByIdAndUpdate(req.params.id, { content });
         res.json({ msg: 'Comment updated!' })
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
   likeComment : async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         const comment = await Comments.find({ _id: req.params.id, likes: req.user._id })
         if(comment.length > 0) return res.status(400).json({ msg: 'You already liked this comment!' })
         await Comments.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id }}, { new: true});
         res.json({ msg: 'Like Success!'})
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
   unLikeComment: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         const comment = await Comments.find({ _id: req.params.id, likes: req.user._id })
         if(comment.length === 0) return res.status(400).json({ msg: 'you do not unlike this comment! ' })
         await Comments.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id }}, { new: true});
         res.json({ msg: 'Unlike Success!'})
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
   deleteComment: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         await Comments.findByIdAndDelete(req.params.id);
         res.json({ msg: 'Comment deleted!' })
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
   createAnswerComment: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(401).json({ message: 'Invalid Authentication!' });
      try {
         const { postId, content, tag} = req.body;   
         const post = await Posts.findById(postId);
         if(!post) return res.status(400).json({ msg: 'Post does not exist!' })

         const newComment = new Comments({
            user: req.user._id, content, tag
         })
         await Comments.findByIdAndUpdate(req.params.id, { $push: { reply: newComment._id }}, { new: true});
         await newComment.save();

         res.json({newComment})
      } catch(err: any) {
         return res.status(500).json({ message: err.message });
      }
   },
}

export default commentCtrl;