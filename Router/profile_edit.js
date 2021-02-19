var express = require('express');
const router = express.Router();
var mysql = require('mysql')
const env = require("dotenv").config();

var alertMsg = '';
con = mysql.createConnection({
  host: process.env.host_data,
  user: process.env.usr_data,
  password: process.env.pwd_data,
  database : process.env.db_name,  
});

var roles = ['Admin','User','Super Admin','IT']
router.get('/profile_Edit', async (req, res) => {
    if(req.session.email){
    var query_getallusers = `SELECT * FROM tbl_user_details where id='${req.session.userDetails[0].id}'`
    var allUsers = await executeSqlQuery(query_getallusers);
    res.render('pages/homePng',
    {
        userDetails : req.session.userDetails,
        userRoles: req.session.userRoles,
        lst_allusers : allUsers,
        lst_Allemp :[],
        lst_usrRoles : roles,
        alertMsg : alertMsg 
    });
    alertMsg = '';
    }
    else{
        res.redirect('/');
    }
});

router.post('/profile/update/:id',async (req, res) =>{
  if(req.session.email){
  console.log(req.body)
  emproles_data = req.body.emproles03;
  if (emproles_data == "" || emproles_data == "undefined" || emproles_data == null){  
    alertMsg = "Please fill the rloes."
    }else
    {
  if (typeof(emproles_data) == 'string')
  {
    emproles_data = [`${req.body.emproles03}`]
  }
  var qry_update =  `update tbl_user_details set name ="${req.body.empName03}", user_name = "${req.body.empEmail03}",isid="${req.body.empISID03data}", role='${emproles_data.join(", ")}' where id = "${req.params.id}"`
  qry_delete_user_roles =  `delete from tbl_user_roles where user_id = "${req.params.id}";`
  await executeSqlQuery(qry_delete_user_roles); 
  emproles_data.forEach(async (role) => {
    qry_get_role_id  = `(SELECT id FROM tbl_roles where role_name = "${role}")`
    role_id = await executeSqlQuery(qry_get_role_id);
    qry_insert_role = `INSERT INTO tbl_user_roles (user_id, role_id) VALUES ('${req.params.id}', '${role_id[0].id}')`
    await executeSqlQuery(qry_insert_role);
  })
  await executeSqlQuery(qry_update);
  res.redirect("/profile_Edit");
  }
}
  else{
    res.redirect('/');
}
})

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


  module.exports = router