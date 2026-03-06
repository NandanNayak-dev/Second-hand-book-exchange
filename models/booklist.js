const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require("./review");

const booklistSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image: {
    url:String,
    filename:String
  },
    reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  isBuyRequestSent:{
    type:Boolean,
    default:false
  }
})
const booklist=mongoose.model("booklist",booklistSchema);
module.exports=booklist