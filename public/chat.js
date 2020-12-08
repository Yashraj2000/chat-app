const chatform = document.getElementById("chat-form")
const roomname = document.getElementById("room-name")
const userlist = document.getElementById("users")
const chatmessage = document.querySelector(".chat-messages");
const moments = moment();

const socket = io();


// Get username and room from the url window.location.search give query string
const {room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})




// Join chatroom 
socket.emit("joinRoom",{room});

//Get room and users info

socket.on("roomusers",({users,room})=>{
    console.log(users,room)
    outputroomname(room);
    outputusers(users);
});


// Message form server
socket.on("message",data=>{
    console.log(data)
    outputmessage(data)
    // scroll down
   chatmessage.scrollTop = chatmessage.scrollHeight;
   //console.log(chatmessage.scrollTop,chatmessage.scrollHeight)
})

// Messages of the particular room in the server 
 socket.on("RoomMessages",data=>{
     console.log(data)
     data.forEach(obj => {
        outputRoommessage(obj)
     });
 })

chatform.addEventListener("submit",(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    // Emit message to the server

    socket.emit("chatmessage",msg);
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();
})
var timeout;
function timeoutFunction() {
    socket.emit("typing", false);
  }
document.getElementById("msg").addEventListener("keypress",function(){
    /* so when we are typing this messsage an keypress event is fired and socket is sent 
      and everytime cleartimeout is called to clear the time after which setTimeOut is called 
      i.e we press key ,timer cleared ,again settimeout is called but will execute after 2 seconds
      so if we press key before 2 sec again socket is emitted and clearTimeout will clear the time 2s for calling of set timeout and hence that function is not called 
      but when we wait for 2 sec i.e we typed cleartimeout is called ,then settimeout is called but sice we waited for 2 or more second , clear timeout will not be called again and setTimeout will be executed
    */
    socket.emit("typing",true)
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction,2000);
})

socket.on("istyping",function(data){
    if(data)
    document.getElementById("typing").innerHTML = data + " is typing";
    else 
    document.getElementById("typing").innerHTML = "";
})

function outputmessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <p class="meta">${message.user}<span> ${message.time}</span> </p>
    ${message.text ? `<p class="text">${message.text}</p>`:`<a href='${message.url}' target="_blank" class="text">Location</a>`}
    `
    console.log(message.url)
    document.querySelector(".chat-messages").appendChild(div)
}
function outputRoommessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <p class="meta">${message.messageSender.username}<span> ${moment(message.createdAt).format("hh:mm A")}</span> </p>
    ${message.content ? `<p class="text">${message.content}</p>`:`<a href='${message.url}' target="_blank" class="text">Location</a>`}
    `
    // console.log(message.url)
    document.querySelector(".chat-messages").appendChild(div)
}

// Send location
document.getElementById("location").addEventListener("click",function(e){
    // Check if geolocation is supported by browser
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by the browser")
    }
    navigator.geolocation.getCurrentPosition(function(location){
        console.log(location);
        socket.emit("my-location",{
            lat:location.coords.latitude,
            lan:location.coords.longitude
        })
    }),function(err){
        alert("cant get location")
    }
})


// Add room name to dom
function outputroomname(room){
    roomname.innerText = room;
}

// Add all the users to dom 
function outputusers(users){
    var a = users.map(user=> `<li>${user.username}</li>` ).join(" ");
    //console.log(typeof a)
    userlist.innerHTML = a
}
