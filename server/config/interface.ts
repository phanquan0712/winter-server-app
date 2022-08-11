import Users from '../models/userModel'
import { Request } from 'express'
import { StringExpression } from 'mongoose'
export interface IUser {
   _id?: string
   fullname: string
   username: string
   email: string
   password: string
   avatar: string
   role: string
   gender: string
   mobile: string,
   address: string,
   story: string,
   website: string,
   followers: string[],
   following: string[],
   saved: string[]
   _doc: Document
}


export interface IDecodedType {
   id: string
   iat: number
   exp: number
}

export interface IReqAuthType extends Request {
   user?: IUser
}


export interface IPost {
   content: string
   images: string[]
   likes: string[]
   comments: string[]
   user: IUser
   _doc?: Document
}

export interface IComment {
   _id: string
   content: string
   tag: Object
   reply: string[]
   likes: string[]
}