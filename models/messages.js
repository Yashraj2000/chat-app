const mongoose = require("mongoose");

var messageschema = new mongoose.Schema({
    content:{type:String,require:true},
    messageSender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

module.exports = mongoose.model("Messages",messageschema)