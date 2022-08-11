import Notifies from '../models/notifyModel';
import { Request, Response } from 'express';
import { IReqAuthType } from '../config/interface';
import { IUser } from '../config/interface';

const notifyCtrl = {
   createNotify: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const { id, recipients, url, text, content, image } = req.body
         console.log(recipients)
         const newRecipients = (recipients as IUser[]).filter(item => item._id !== req.user?._id)
         if(recipients.includes(req.user._id?.toString())) return;
         const notify = new Notifies({
            id, recipients: newRecipients, url, text, content, image, user: req.user._id
         })
         console.log(notify);
         
         // await notify.save()

         res.json({ notify })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   deleteNotify: async (req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const notify = await Notifies.findOneAndDelete({ id: req.params.id, url: req.query.url })

         res.json({ notify })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   getNotifies: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const notifies = await Notifies.find({ recipients: req.user._id}).sort('-createdAt').populate('user', 'avatar username followers')

         return res.json({ notifies })

      } catch (err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
   isRead: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const notify = await Notifies.findOneAndUpdate({ _id: req.params.id}, { isRead: true});
         return res.json({ notify })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      } 
   },
   deleteAllNotfies: async(req: IReqAuthType, res: Response) => {
      if(!req.user) return res.status(400).json({ msg: 'Invalid Authentication!'})
      try {
         const notifies = await Notifies.deleteMany({ recipients: req.user._id});
         return res.json({ notifies })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message });
      }
   },
}


export default notifyCtrl;