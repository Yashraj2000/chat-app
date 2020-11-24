const moment = require("moment");

function formatmsg(user,text){
    return {
        user,
        text,
        time:moment().format('h:mm a')
    }
}

function formatgeomsg(user,lat,lng){
return {
    user,
    url:`https://www.google.com/maps?q=${lat}, ${lng}`,
    time:moment().format('h:mm a')
}
}

module.exports ={formatmsg,formatgeomsg}