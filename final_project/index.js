const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    let token = req.session.authorization;

    console.log(token)

    if(token) {
        token = token['accessToken'];
        jwt.verify(token, "access",(err,user)=>{
            if(!err){
                req.user = user;
                next();
            }
            else{
                return res.status(403).json({message: "Customer not authenticated"})
            }
         });
     } else {
         return res.status(403).json({message: "Customer not logged in"})
     }
});

const arr = [];
const user = "john";
const pass = "pass";
const user1 = "john1";
const pass1 = "pass1";
arr.push({user, pass});
arr.push({user1, pass1});
// if (users.find((user) => user.username === username)) {
//   return res.status(409).json({ message: "Username already exists" });
// }
//const temp = arr.find((u) => u.username === username);
//const isUserPresent = arr.some(obj => Object.values(obj).includes('john'));
//console.log(isUserPresent);

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));