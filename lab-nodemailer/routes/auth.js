require('dotenv').config();
const express = require("express");
const passport = require('passport');
const authRoutes = express.Router();
const User = require("../models/User");
const nodemailer = require('nodemailer');
const plantilla = require('../plantillas/mail')



// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const rol = req.body.role;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }
    
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    const hashUser = bcrypt.hashSync(username, salt).replace('/','');
    
    const newUser = new User({
      username,
      password: hashPass,
      email,
      confirmationCode: hashUser
    });
    

    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD
      }
    });



       transporter.sendMail({
        from: '"nombre" <process.env.GMAIL_USER>', // sender address
        to: email, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: `<a>http:localhost:3000/auth/confirmation/${hashUser}</a>` // html body
    }).then(()=>{console.log("mail mandado")})
    .catch(()=> {console.log("algo ha ido mal")}) 
  ;


    newUser.save((err) => {
      if (err) {
        console.log(err)
        res.render("auth/signup", { message: "Something went wrong" });
      } else {  
        res.redirect("/");
        
      }
    });
  });




});

authRoutes.get('/confirmation/:code', (req, res, next) => {
  const code = req.params.code;
  console.log(code);
  User.findByIdAndUpdate({confirmationCode: code},'confirmationCode',(err, code) =>{
    if(code !== null){
      User.status = "Active"
      code.save();
      res.render("auth/confirmation")
    }else{
      console.log(err)
    }
  })
  res.render("auth/signup");
});

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = authRoutes;
