const mongoose=require("mongoose");
const initData=require("./data.js");
const booklist=require("../models/booklist.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
}
main().then(() => console.log("connected to database")).catch((err) => console.log(err));

const initDB=async()=>{
    await booklist.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'699e671ed3c8929e2a103c71'}));
    await booklist.insertMany(initData.data);
    console.log("database seeded");
   
}
initDB();