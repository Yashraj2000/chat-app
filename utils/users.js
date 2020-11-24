const users = [];


// Join user to chat
function userjoin(id,username,room){
    const user = {id,username,room};
    users.push(user);
    return user;
}

// Get current user

function getcurrentuser(id){
    return users.find(user=> user.id.equals(id));

}

// is user currently online
function userConnected(id)
{
    return users.some(function(user){
        return user.id.equals(id)
    })
}

// user leaves the chat
function userleave(id){
    const index = users.findIndex(user=> user.id===id)
    //console.log(users.splice(index,1),"defrgthyjuki")
    if(index > -1)
      return users.splice(index,1)[0];
}

// Get all the users of the room 
function roomuser(room){
    return users.filter(user=> user.room === room);
}

module.exports = {userjoin,getcurrentuser,userleave,roomuser,userConnected};




// const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// const w2 = function(middleware){
//     return function(socket,next){
//        return  middleware(socket.request,{},next)
//     }
// }