const lib = require("./outlook_auth");
var express = require('express');
const router = express.Router();
var mysql = require('mysql');
const env = require("dotenv").config();


con = mysql.createConnection({
  host: process.env.host_data,
  user: process.env.usr_data,
  password: process.env.pwd_data,
  database : process.env.db_name,
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected_2");
});

/*    
*     On pageload.
*/
router.get('/', function(req, res, next){
  if(req.session.email){
    res.redirect('/home');
  } else{
    
    res.render('pages/login',{

    })
}
    
  
});


var roles = ['Admin','User','Super Admin','IT']
var superadmin_access = false;
var access = false;
var alertMsg='';

router.get('/home',async function(req, res,next){
  if(req.session.email){
    var query_getallusers = `SELECT * FROM tbl_user_details`
    var query_getallemp = `SELECT * FROM tbl_employees`
    var allUsers = await executeSqlQuery(query_getallusers);
    var allEmployees = await executeSqlQuery(query_getallemp);
    var userRolesarr = [];
    var userRoles = req.session.userRoles 
    if(userRoles.length > 0){
      userRoles.forEach(function(item , index){
        userRolesarr.push(item.role_name);
      });

    }
        res.render('pages/homePng',
        {
          userDetails : req.session.userDetails,
          userRoles: req.session.userRoles,
          lst_allusers : allUsers,
          lst_Allemp :allEmployees,
          lst_usrRoles : roles,
          alertMsg : alertMsg
        });
        alertMsg = '';

  }
  else{
      res.redirect('/');
}
});



function executeSqlQuery(qry) {
  return new Promise((resolve, reject) => {
    con.query(qry, function (err, result) {
      if (err) {
          console.log(err);
          reject(err.sqlMessage);
      } else {
        resolve(result);
        return result
      }
    });
  });
}



router.get('/404/png', async (req, res) => {
 res.render('pages/error_show',{
    })
})

router.post('/login_auth',async (req, res) =>{
  console.log(req.body)
  var query_getUserdetails = `SELECT * FROM tbl_user_details where user_name = "${req.body.email}"`
  var userDetails = await executeSqlQuery(query_getUserdetails); 
  if (userDetails.length > 0){
  
    req.session.email = req.body.email;
    // res.locals.message = req.session.message;

    var query_getuser_roles = `SELECT * FROM tbl_roles where id in (SELECT role_id FROM tbl_user_roles where user_id = "${userDetails[0].id}")`
    var userRoles = await executeSqlQuery(query_getuser_roles);
    let _userRoles = userRoles.map(r => r.role_name.toUpperCase());
    console.log (userDetails[0].active == 1);
    if (userDetails[0].active == 1)
        {
          
          console.log("User is active")
          //Outlook authentication
          lib.authenticate(req,res,userDetails,_userRoles); 
          
        }
        else{
          res.send(401, {
            status: false
          })
          
        }
    }
    else{
      res.send(401, {
        status: false
      })
     
    }
});



router.get('/checkValidToken/:token',async function(req, res){
  var checkUser_session = `SELECT * FROM tbl_user_session WHERE user_session_id = "${req.params.token}"`
  var userSession = await executeSqlQuery(checkUser_session); 
 if (userSession.length > 0){
  var query_getSID =  `SELECT * FROM tbl_user_session WHERE user_session_id = "${req.params.token}"  and created_date > (now() - interval 30 minute);`
  var userSID= await executeSqlQuery(query_getSID);
  if (userSID.length > 0){
    console.log("user is valid!")
    res.send({
      status: true
    })
  }
  else{ 
    console.log("user is  not valid! login again");
    // qry_delete_from_tbl_user_session =  `delete from tbl_user_session where user_session_id ="${req.session.id}";`
    // await executeSqlQuery(qry_delete_from_tbl_user_session);
    res.send(401,{
        status: false
      })
    // res.redirect('/logout');
    }
  }
  // else{ 
  //   console.log("user is  not valid! login again");
  //   res.send({
  //       status: false
  //     })
  //   }
});





// var roles = ['Admin','User','Super admin','IT']
// router.get('/home',async function(req, res){
//   if(req.session.email){
 
//     }
//     else{
//         res.redirect('/');
//   }
// });


router.get('/logout', async (req, res) => {
  qry_delete_from_tbl_user_session =  `delete from tbl_user_session where user_session_id ="${req.session.id}";`
  await executeSqlQuery(qry_delete_from_tbl_user_session);
  req.session.destroy(function(err){
    if(err){
      req.redirect('/404/png')
      console.log(err)
    }
    else{
      res.redirect("/");
    }
  })
 
 });


module.exports = router