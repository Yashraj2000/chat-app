const User = require("../models/user");
const Rooms = require("../models/rooms")
const util = require("util");

module.exports = {

    getregister(req,res,next)
    {   
      if(req.isAuthenticated()) {
        return res.redirect("back")
    }
        res.render("register",{title:"Register Page",username:"",email:"",fullname:""});
    },

    getlogin(req,res,next)
    {   
        if(req.isAuthenticated()) {
            // req.session.error = "You are already logged in "
            return res.redirect("back")
        }
        res.render("login")
    },

    async postlogin(req,res,next){
        const {email,password} = req.body;
        // if(!user&&error) return next(error);
        try{
            const{user,error}  = await User.authenticate()(email,password);
            if(error)throw error
            const login =  util.promisify(req.login.bind(req));
            await login(user);
            // console.log(__dirname)
            res.redirect("/rooms")
            // req.session.success = `Welcome back ${user.username}`;
            // const redirecturl = req.session.redirectTo || "/post";
            // delete req.session.redirectTo;
            // res.redirect(redirecturl);

        }catch(err){
            let user = await User.findOne({email:req.body.email});
            if(!user) 
            req.session.error = "The given email is not registered Please register and Log in";
            else 
            req.session.error = "Email or Password is incorrect"
            res.redirect("/login")

        }
  },

  async postregister(req,res,next){
    let error;
    const{username,email,fullname} = req.body;
    if(req.body.password.length<6)
    {
        error = "Password must be 6 digit long";
        return res.render("register",{error,username,email,fullname})
    }
    let user = await User.findOne({email:req.body.email});
    if(user)
    {
        error = "User with given Email already exists";
        return res.render("register",{error,username,fullname})
    }
     user = await User.findOne({username:req.body.username});
     if(user)
     {
         error = "User with given username already exists";
         return res.render("register",{error,email,fullname})
     }
     const users = await User.register(new User(req.body), req.body.password);
     console.log(users)
     req.login(users,async (err)=>{
        if(err) return next(err);
        console.log("here")
        res.redirect("/rooms")
     })
 },
 getlogout(req,res,next)
 {
     req.logout();
     req.session.success = "Logged you out"
     res.redirect("/login")
},

getrooms(req,res,next){
    res.render("index")
},

postrooms(req,res,next)
{
    var room = req.body.room;
    // console.log(room);
    res.redirect("/channel?room="+room)

},

async particularRoom (req,res,next)
{
    var roomname = req.query;
    console.log(roomname)
    var RoomMsg = await Rooms.findOne({name:roomname.room}).populate([{
        path:"roomMessages",
        options:{sort:{time:1}},
        populate:{
            path:"messageSender",
            model:"User"
        }
    },{path:"roomusers"}])
   //  console.log(RoomMsg)
    // io.to(roomname.room).emit("RoomMessages",RoomMsg.roomMessages);
    console.log(typeof RoomMsg)
    res.render("chat",{RoomMsg})
}







}