import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
   conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }],
   sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
   recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
   text: String,
   media: Array,
   call: Object,
}, { timestamps: true })


export default mongoose.model("Message", messageSchema);