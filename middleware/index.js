const middleware = {


    errorHandler: (fn) => (req, res, next)=>Promise.resolve(fn(req,res,next)).catch(next),
    isloggedIn:(req,res,next)=>{
        if(req.isAuthenticated())
        {
            return next();
        }
        res.redirect("/login");
    }






};


module.exports = middleware;