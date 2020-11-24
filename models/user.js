const mongoose = require("mongoose");
const passportlocalmongoose = require("passport-local-mongoose");

var userschema = new mongoose.Schema({
    email:{type:String,unique:true,required:true},
    username:{type:String,unique:true,require:true},
    fullname:{type:String,required:true}
},{timestamps:true})

userschema.plugin(passportlocalmongoose, {
    usernameField: 'email'
  });
module.exports = mongoose.model("User",userschema)