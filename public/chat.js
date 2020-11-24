const chatform = document.getElementById("chat-form")
const roomname = document.getElementById("room-name")
const userlist = document.getElementById("users")
const chatmessage = document.querySelector(".chat-messages");
const socket = io();
// by default io() takes the root of the website i.e / but when we specify namespace means at certain route only we want socket.io to work then in that case we need to specify that namespace

// Get username and room from the url window.location.search give query string
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})
// console.log(Qs.parse(location.search,{
//     ignoreQueryPrefix:true
// })
// )


// Join chatroom 
socket.emit("joinRoom",{username,room});

//Get room and users info

socket.on("roomusers",({users,room})=>{
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

chatform.addEventListener("submit",(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    // Emit message to the server

    socket.emit("chatmessage",msg);
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();
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
