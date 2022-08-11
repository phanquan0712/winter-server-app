import mongoose from "mongoose";
import { IPost } from "../config/interface";


const postSchema = new mongoose.Schema({
   content: {
      type: String,
   },
   images: {
      type: Array,
      default:  [],
      require: true
   },
   likes: [ {type: mongoose.Types.ObjectId, ref: 'Users'} ],
   comments: [ {type: mongoose.Types.ObjectId, ref: 'Comment'}  ],
   user: { type: mongoose.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });



export default mongoose.model<IPost>("Post", postSchema);

