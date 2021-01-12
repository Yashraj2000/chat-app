const express = require('express');
const router = express.Router();
const passport = require("passport");

// middlewares
const {errorHandler,isloggedIn} = require("../middleware/index")
const {getregister,getlogin,postlogin,postregister,getlogout,getrooms,postrooms,particularRoom} = require("../controller/index")


router.get("/",function(req,res){
    res.send("Welcome to the landing page")
})


router.get("/login",getlogin);

router.post("/login",errorHandler(postlogin));

router.get("/register",getregister);

router.post("/register",errorHandler(postregister));

router.get("/logout",getlogout)

router.get("/rooms",isloggedIn,getrooms)

router.post("/rooms",postrooms)

router.get("/channel",isloggedIn,particularRoom)















module.exports = router;