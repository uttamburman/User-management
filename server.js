/*
 * Manage user acess in Node.js and ExpressJS
 * Author: Rajshree Barman
 * Version : 0.0.2
*/
var express = require('express');
var http = require('http');
var mysql = require('mysql');
var app = express();
var fs = require('fs')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
const login_router = require("./Router/login_auth");
const UserPng_router = require("./Router/usr_details");
const EmpPng_router = require("./Router/Emp_details");
const session = require('express-session');
var flash = require('connect-flash');

const profile_edit_router = require('./Router/profile_edit') 


app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); 


/*
*     Import all realted javaScript and css files to inject in the App
*/
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/img', express.static(__dirname +"/views/img" ) );
app.use('/js', express.static(__dirname +"/node_modules/script"));
app.use('/css', express.static(__dirname +"/node_modules/css"));

app.use(session({
        resave: false,
        saveUninitialized: true,
        secret: "!Q,n?7[2damGV>2P",
        cookie: { maxAge: null }
      })
    );
app.use(cookieParser('secret'))
app.use(flash());


app.use((req, res, next) => {
  if(req.path='/login_auth') {
    next();
    return;
  }
  if(res.session && res.session.isAuthenticated) {
    console.log("is authenticated...");
    next();
  } else {
    console.error("is not authenticated...");
    res.render('pages/login');
  }
})
app.use(login_router);
app.use(EmpPng_router);
app.use(UserPng_router);
app.use(profile_edit_router);

// app.get('/homepage/:pagename',function(req, res){
//   pagename = req.params.pagename;
//     if (pagename == 'Home'){
//       res.redirect('/home');
//       pagename = 'Home';
//     } 

app.use((req, res, next) => {
  res.render('pages/error_show',{
     })
 });
  
// });



/*    
*     Connect to the server
*/
var server = app.listen(8081,function(){
    console.log("Server started on 8081....");
});