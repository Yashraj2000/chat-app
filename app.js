// socket.io should be used both in client side(browser) and server side(backend)
require('dotenv').config()
const express = require("express");
const createError = require('http-errors');
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const engine  = require("ejs-mate");
const mongoose = require('mongoose');
const path = require('path');
const logger = require('morgan');
const favicon = require('serve-favicon');

// requiring models
const User = require("./models/user");
const Messages = require("./models/messages");
const Rooms = require("./models/rooms");

// Requiring routes 
const indexroute = require("./routes/index")



const {formatmsg,formatgeomsg} = require("./utils/messages")
const {userjoin,getcurrentuser,userleave,roomuser,userConnected} = require("./utils/users")
const socket = require("socket.io");

const app = express();
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static("public"));

// database connection 
var url = process.env.DATABASE_URL || 'mongodb://localhost:27017/chat-app';
(async function(){
  mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true,useFindAndModify:false });
  var db = mongoose.connection;
  db.on('error',console.error.bind(console,"conncetion error"));
  db.once('open',function(){
    console.log("connected to database")
  })
})()

// Passport Configuration
const sessionMiddleware = session({ secret: "This can be anything", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// use ejs-locals/mate for all the ejs template
app.engine("ejs",engine);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const server = app.listen(process.env.PORT || 4000,()=>{
    console.log("server started at port 4000")
})


//middleware / local variable this should come before any route you render
app.use(function(req,res,next){
    app.locals.moment = require('moment');
    res.locals.currentUser = req.user;
    res.locals.success = req.session.success || "";
    delete req.session.success;
    res.locals.error = req.session.error || "";
    delete req.session.error;
    next();
  })

// Mounting routes
app.use('/', indexroute);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    console.log(err, "in error handler ");
    req.session.error = err.message;
    res.status(404).send('error message');
  });











// server side socket connection
var io = socket(server);


// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));


// Checking if a user is logged in or not 
io.use((socket, next) => {
    if (socket.request.user) {
        // console.log(socket.request.user,"in middleware")
      next();
    } else {
      next(new Error('unauthorized'))
    }
  });

const botname = "Chat chat"
// Runs when client connects
io.on("connection",socket=>{
  // console.log(socket)
      socket.on("joinRoom",async ({room})=>{
      var user;
      if(!userConnected(socket.request.user._id))
      {
        user = userjoin(socket.request.user._id,socket.request.user.username,room);
      }else
      {
        user = getcurrentuser(socket.request.user._id);
      }
      var isroom =await Rooms.findOne({code:room});
        var isUserPresent = isroom.roomusers.some(function(userid){
            // console.log(userid,"==",socket.request.user._id);
            return userid.equals(socket.request.user._id);
        })
        if(!isUserPresent)
        {
            isroom.roomusers.push(socket.request.user._id)
        }
        await isroom.save();
       socket.join(user.room);
      if(!userConnected(socket.request.user._id)){
       // sending message whenever user connects only to the user who connects
       socket.emit("message",formatmsg(botname,"Welcome to chat-chat "))
           // Broadcast when user connects
    socket.broadcast.to(user.room).emit("message",formatmsg(botname,`${socket.request.user.username} has joined the chat`))
      }



         // all the connected clients in room
        //  var clients = io.sockets.adapter.rooms[user.room].sockets; 
        //   console.log(clients)
        //   // To get the number of clients
        //  var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
        // for (var clientId in clients ) {

        //     //this is the socket of each client in the room.
        //     var clientSocket = io.sockets.connected[clientId];
        //     console.log(clientSocket)

        // }

    // Send users and room info
    io.to(user.room).emit("roomusers",{
        room:user.room,
        users:roomuser(user.room)
    })
   })

   socket.on("typing",function(data){
    const user = getcurrentuser(socket.request.user._id);
    if(data)
    socket.broadcast.to(user.room).emit("istyping",socket.request.user.username)
    else 
    socket.broadcast.to(user.room).emit("istyping",false)

   })
   

        socket.on("createroom",async function(){
          var uniquecode = makeid();
          console.log(uniquecode)
          await Rooms.create({code:uniquecode});
          socket.emit("roomcreated",uniquecode)
        })

       // listen for chatmessage
       socket.on("chatmessage" ,async msg=>{
        const user = getcurrentuser(socket.request.user._id);
        //console.log(user)
        var newmsg =await Messages.create({content:msg,messageSender:socket.request.user})
        // console.log(newmsg)
        var userroom = await Rooms.findOne({code:user.room}).populate({
            path:"roomMessages",
            options:{sort:{createdAt:1}},
            populate:{
                path:"messageSender",
                model:"User"
            }
        });
        userroom.roomMessages.push(newmsg)
        await userroom.save();
        io.to(user.room).emit("message",formatmsg(user.username,msg))
    })


    // Runs when client disconnects
    socket.on("disconnect",()=>{
        const user = userleave(socket.request.user._id);
        // console.log(user);
        if(user){
            io.to(user.room).emit("message",formatmsg(botname,`${user.username} has left the chat`))
            // Send users and room info
            io.to(user.room).emit("roomusers",{
                room:user.room,
                users:roomuser(user.room)
            })
        }
  })

    // send the geolocation
    socket.on("my-location",({lat,lan})=>{
        const user = getcurrentuser(socket.request.user._id);
        io.to(user.room).emit("message",formatgeomsg(user.username,lat,lan))
    })

})



function makeid(length = 6) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = app