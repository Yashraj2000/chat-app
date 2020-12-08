const mongoose = require("mongoose");

var roomschema = new mongoose.Schema({
    code:{type:String,require:true,unique:true},
    roomusers:[
        {
             type:mongoose.Schema.Types.ObjectId,
             ref:"User"
        }
    ],
    roomMessages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Messages"
        }
    ]
},{timestamps:true})

module.exports = mongoose.model("Rooms",roomschema)