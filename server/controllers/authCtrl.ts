import { generateAccessToken, generateRefreshToken } from './../config/generateToken';
import Users from "../models/userModel";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { IDecodedType } from '../config/interface';
const authCtrl = {
   register: async(req: Request, res: Response) => {
      try {
         const { fullname, username, email, password, gender } = req.body;
         const newUserName = username.toLowerCase().replace(/ /g, '');

         const passwordHash = await bcrypt.hash(password, 12);

         const newUser = new Users({
            fullname, username: newUserName, email, password: passwordHash, gender
         })
         
         const access_token = generateAccessToken({ id: newUser._id})
         const refresh_token = generateRefreshToken({ id: newUser._id}, res)

         await newUser.save();


         res.json({ 
            msg: 'Register successfully!',
            access_token,
            user: {
               ...newUser._doc,
               password: '',
            }
         })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   login: async(req: Request, res: Response) => {
      try {
         const { email, password} = req.body;
         const user = await Users.findOne({ email }).populate('followers following', '-password +avatar +username +fullname +followers +following');

         if(!user) return res.status(400).json({ msg: 'This email does not exist!' });

         const isMatch = await bcrypt.compare(password, user.password);
         if(!isMatch) return res.status(400).json({ msg: 'Wrong password!' });
         
         const access_token = generateAccessToken({ id: user._id})
         const refresh_token = generateRefreshToken({ id: user._id}, res)



         res.json({ 
            msg: 'Login successfully!',
            access_token,
            user: {
               ...user._doc,
               password: '',
            }
         })


      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   logout: async(req: Request, res: Response) => {
      try {
         res.clearCookie('refreshtoken', { path: '/api/refresh_token' });
         return res.json({ msg: 'Logout successfully!' });
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   },
   refreshToken: async(req: Request, res: Response) => {
      try {
         const rf_token = req.cookies.refreshtoken;         
         if(!rf_token) return res.status(400).json({ msg: 'Pleae, Login now!'})

         const decoded = <IDecodedType>jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`);
         if(!decoded.id) return res.status(400).json({ msg: 'Pleae, Login now!'})

         const user = await Users.findById(decoded.id).select('-password').populate('followers following', '-password');
         if(!user) return res.status(400).json({ msg: 'This account does not exist!' })
         const access_token = generateAccessToken({ id: user._id})
         res.json({
            access_token,
            user
         })
      } catch(err: any) {
         return res.status(500).json({ msg: err.message })
      }
   }
}



export default authCtrl;