const initData=require("./data.js");
const mongoose=require("mongoose");
const Listing=require("../models/listing.js");

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/traveller');
}
main()
    .then(()=>{
        console.log("connected to database");
    })
    .catch(()=>{
        console.log(err);
    });
 
const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({ ...obj,owner:"6620e59ece0a6ac17ae443b7"}));//it creates new array and add some additional data and store it int varible
    await Listing.insertMany(initData.data);
    console.log("data was intialised");
};

initDB();