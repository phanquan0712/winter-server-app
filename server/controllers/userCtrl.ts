import Users from '../models/userModel'
import { Request, Response } from 'express'
import { IReqAuthType } from '../config/interface'
import { request } from 'http'

const userCtrl = {
   searchUser: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const users = await Users.find({ username: { $regex: req.query.username, $nin: req.user.username } }).limit(10).select('fullname username avatar')

         res.json({ users })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   getUser: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const user = await Users.findById(req.params.id).select('-password').populate('followers following', '-passowrd')
         if (!user) return res.status(400).json({ msg: 'User does not exist!' })

         res.json({ user })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   updateUser: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const { avatar, fullname, mobile, address, story, website, gender } = req.body;
         if (!fullname) return res.status(400).json({ msg: 'Please, Add your full name!' })
         await Users.findOneAndUpdate({ _id: req.user._id }, {
            avatar, fullname, mobile, address, story, website, gender
         })
         res.json({ msg: 'Update Success!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   follow: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const users = await Users.find({ _id: req.params.id, followers: req.user._id })
         if (users.length > 0) return res.status(400).json({ msg: 'You followed this user!' })

         await Users.findOneAndUpdate({ _id: req.params.id }, { $push: { followers: req.user._id } }, { new: true });
         await Users.findOneAndUpdate({ _id: req.user._id }, { $push: { following: req.params.id } }, { new: true });

         res.json({ msg: 'Follow Success!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   unfollow: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const users = await Users.find({ _id: req.params.id, followers: req.user._id })
         if (users.length === 0) return res.status(400).json({ msg: 'You do not follow this user!' })

         await Users.findOneAndUpdate({ _id: req.params.id }, { $pull: { followers: req.user._id } }, { new: true });
         await Users.findOneAndUpdate({ _id: req.user._id }, { $pull: { following: req.params.id } }, { new: true });

         res.json({ msg: 'Follow Success!' })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   suggestionsUser: async (req: IReqAuthType, res: Response) => {
      if (!req.user) return res.status(400).json({ msg: 'Invalid Authentication!' })
      try {
         const newArr = [...req.user.following, req.user._id]; // List user have relationship with user
         const num = Number(req.query.num) || 10;

         const users = await Users.aggregate([
            { $match: { _id: { $nin: newArr } } },
            { $sample: { size: num } },
            { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
            { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
         ]).project({ password: false })

         res.json({
            users,
            total: users.length
         })
      } catch (err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }
}

export default userCtrl;