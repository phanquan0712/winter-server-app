import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI;
mongoose.connect(`${URI}`, (err: any) => {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   if(err) throw err;
   console.log('Connected to MongoDB');
})




