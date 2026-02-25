const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const buyAlertSchema=new Schema({
    booklistingId:{
        type:Schema.Types.ObjectId,
        ref:"booklist"
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})
module.exports=mongoose.model("BuyAlert",buyAlertSchema);