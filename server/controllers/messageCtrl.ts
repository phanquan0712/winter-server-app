import Message from '../models/messageModel';
import Conversation from '../models/conversationModel';
import { Request, Response } from 'express';
import { IReqAuthType } from '../config/interface';

class ApiFeatures {
   query: any;
   queryString: any
   constructor(query: any, queryString: any) {
      this.query = query;
      this.queryString = queryString
   }

   paginating() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 3;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this
   }
}

const messageCtrl = {
   createMessage: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const { recipient, text, media, call } = req.body;
         if(!recipient || (!text && media.length === 0 && !call)) return;

         const newConversation = await Conversation.findOneAndUpdate({
            $or: [
               { recipients: [req.user._id, recipient]},
               { recipients: [recipient, req.user._id]}
            ]
         } , {
            recipients: [req.user._id, recipient],
            text, media, call
         }, { new: true , upsert: true });

         const message = new Message({
            conversation: newConversation._id,
            sender: req.user._id,
            recipient,
            text,
            media,
            call,
         })

         await message.save();

         res.json({ newConversation, message })

      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   getConversation: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const features = new ApiFeatures(Conversation.find({
            recipients: { $in: [req.user._id] }
         }), req.query).paginating();
         const conversations = await features.query.sort('-updatedAt')
         .populate('recipients', 'avatar fullname username')

         res.json({ conversations, total: conversations.length })
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   getMessages: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const features = new ApiFeatures(Message.find({
            $or: [
               { sender: req.user._id, recipient: req.params.id},
               { sender: req.params.id, recipient: req.user._id }
            ]
         }), req.query).paginating();

         const messages = await features.query.sort('-createdAt')
         res.json({ messages, total: messages.length })
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   deleteMessage: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         await Message.findByIdAndDelete(req.params.id)
         res.json({ msg: 'Message deleted successfully!' })
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
   deleteConversation: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const conversation = await Conversation.findOneAndDelete({
            $or: [
               { recipients: [req.user._id, req.params.id]},
               { recipients: [req.params.id, req.user._id]}
            ]
         })
         if(!conversation) return res.status(400).json({ msg: 'This conversation does not exist!'})
         await Message.deleteMany({ conversation: conversation._id })

         res.json({ msg: 'Delete Success!'})
      } catch(err: any) {
         return res.status(500).json({msg: err.message})
      }
   },
}


export default messageCtrl;