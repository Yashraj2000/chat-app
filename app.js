// socket.io should be used both in client side(browser) and server side(backend)
const express = require("express");
const app = express();
const {formatmsg,formatgeomsg} = require("./utils/messages")
const {userjoin,getcurrentuser,userleave,roomuser} = require("./utils/users")
const socket = require("socket.io");
app.use(express.static("public"));
const server = app.listen(4000,()=>{
    console.log("server started at port 4000")
})
var io = socket(server);


//server side
/* socket.on("createmesage",(msg,callback){
    io.emit("msg",{});
    callback("This is a parameter");
})

// client side
socket.emit("createmessage",{"keke"},function(abc){
    console.log("fgrmbkig",abc)
})

whenever we emit an event it takes a callback as well
so in client side we emit an event with the msh keke server acknkowlegeds it 
and then calls the call back it comes back to the client side and then runs the callback
function that logs the output we can send parameters as well
 */

const botname = "Chat chat"
// Runs when client connects
io.on("connection",socket=>{

// socket.on("abc",(ms,callback)=>{
//     console.log(callback)
//     callback();
// })
  console.log(socket.handshake)

   // Join room since we are passing an object from front-end here rather than taking the object as it is we are descructuring it
   socket.on("joinRoom",({username,room})=>{
      const user = userjoin(socket.id,username,room);
      //console.log(user,socket.join(user.room))
       socket.join(user.room); //used to join room
       // sending message whenever user connects only to the user who connects
       socket.emit("message",formatmsg(botname,"Welcome to chat-chat "))

    // Broadcast when user connects
    socket.broadcast.to(user.room).emit("message",formatmsg(botname,`${username} has joined the chat`))

    // Send users and room info
    io.to(user.room).emit("roomusers",{
        room:user.room,
        users:roomuser(user.room)
    })
    
   })

    // Runs when client disconnects
    socket.on("disconnect",()=>{
        const user = userleave(socket.id);
        console.log(user);
        if(user){
            io.to(user.room).emit("message",formatmsg(botname,`${user.username} has left the chat`))
        
                    // Send users and room info
            io.to(user.room).emit("roomusers",{
                room:user.room,
                users:roomuser(user.room)
            })
        }
  })

    // listen for chatmessage
    socket.on("chatmessage" ,msg=>{
        const user = getcurrentuser(socket.id);
        //console.log(user)
        io.to(user.room).emit("message",formatmsg(user.username,msg))
    })

    // send the geolocation
    socket.on("my-location",({lat,lan})=>{
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit("message",formatgeomsg(user.username,lat,lan))
    })

})


