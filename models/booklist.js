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
    image:{
        filename:String,
        type:String,
        default:"https://www.alshameltechno.com/wp-content/themes/alshameltechno/images/sample.webp",
        set:(v)=>v===""?"https://www.alshameltechno.com/wp-content/themes/alshameltechno/images/sample.webp":v
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
  }
})
const booklist=mongoose.model("booklist",booklistSchema);
module.exports=booklist