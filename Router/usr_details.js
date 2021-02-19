var express = require('express');
const router = express.Router();
var mysql = require('mysql')
const env = require("dotenv").config();


con = mysql.createConnection({
  host: process.env.host_data,
  user: process.env.usr_data,
  password: process.env.pwd_data,
  database : process.env.db_name,  
})

var alertMsg ='';
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
  var roles = ['Admin','User','Super Admin','IT']
  router.get('/User',async function(req, res,next){
    if(req.session.email){
      var query_getallusers = `SELECT * FROM tbl_user_details`
      // var query_getallemp = `SELECT * FROM tbl_employees`
      var query_getallemp = `SELECT * FROM tbl_employees WHERE tbl_employees.emp_Id NOT IN (  SELECT tbl_user_details.id FROM tbl_user_details )`
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
  
    }
    else{
        res.redirect('/');
  }
  });
  
router.post('/add/emp_details/tbl02/', async (req, res) => {
  if(req.session.email){
    emproles_data = req.body.emproles;
    console.log(emproles_data);
    if (emproles_data == "" || emproles_data == "undefined" || emproles_data == null){  
      alertMsg = "Please fill the rloes."
      }else
      {
        if (typeof(emproles_data) == 'string')
        {
          emproles_data = [`${req.body.emproles}`]
        }
        qry_insert = `INSERT INTO tbl_user_details (id, user_name, ISID, name,  Role) VALUES ('${req.body.empId}', '${req.body.empEmail}', '${req.body.empisid}', '${req.body.empName}',  '${emproles_data.join(", ")}');`
        await executeSqlQuery(qry_insert);
        emproles_data.forEach(async (role) => {
          qry_get_role_id  = `(SELECT id FROM tbl_roles where role_name = "${role}")`
          role_id = await executeSqlQuery(qry_get_role_id);
          qry_insert_role = `INSERT INTO tbl_user_roles (user_id, role_id) VALUES ('${req.body.empId}', '${role_id[0].id}')`
          await executeSqlQuery(qry_insert_role);
        })
      }
      res.redirect("/User");
}
  else{
    res.redirect('/');
}
})

router.get('/get_all_emp_data/:id',async (req, res) =>{
  if(req.session.email){
    var emp_id = req.params.id;
    qry_get_data =  `select * from tbl_employees where emp_Id = '${emp_id}';`
    result = await executeSqlQuery(qry_get_data);
    res.send(result);
    }
    else{
      res.redirect('/');
  }
})



router.get('/get_emp_data/edit/:id', async (req, res) => {
  if(req.session.email){
  var emp_id = req.params.id;
  qry_get_data =  `select * from tbl_user_details where id = '${emp_id}';`
  result = await executeSqlQuery(qry_get_data);
  res.send(result);
  }
  else{
    res.redirect('/');
}
});

router.post('/emp_datatbl02/update/:id',async (req, res) =>{
  if(req.session.email){
  // name ="${req.body.empName02}", user_name = "${req.body.empEmail02}",isid="${req.body.empISID02data}",
  emproles_data = req.body.emproles02;
  if (emproles_data == "" || emproles_data == "undefined" || emproles_data == null){  
    alertMsg = "Please fill the rloes."
    }else
    {
  if (typeof(emproles_data) == 'string')
  {
    emproles_data = [`${req.body.emproles02}`]
  }
  var qry_update =  `update tbl_user_details set role='${emproles_data.join(", ")}' where id = "${req.params.id}"`
  qry_delete_user_roles =  `delete from tbl_user_roles where user_id = "${req.params.id}";`
  await executeSqlQuery(qry_delete_user_roles); 
  emproles_data.forEach(async (role) => {
    qry_get_role_id  = `(SELECT id FROM tbl_roles where role_name = "${role}")`
    role_id = await executeSqlQuery(qry_get_role_id);
    qry_insert_role = `INSERT INTO tbl_user_roles (user_id, role_id) VALUES ('${req.params.id}', '${role_id[0].id}')`
    await executeSqlQuery(qry_insert_role);
  })
  await executeSqlQuery(qry_update);
  res.redirect("/User");
  }
}
  else{
    res.redirect('/');
}
})

router.get('/emp_datatbl02/detele/:id', async (req, res) => {
  if(req.session.email){
  var emp_id = req.params.id;
  qry_delete_from_tbl_user_roles =  `delete from tbl_user_roles where user_id ="${emp_id}";`  
  qry_delete_from_tbl_user_details =  `delete from tbl_user_details where id ="${emp_id}";`
  await executeSqlQuery(qry_delete_from_tbl_user_roles);     
  await executeSqlQuery(qry_delete_from_tbl_user_details);
  res.redirect("/User");
  }
  else{
    res.redirect('/');
}
});

router.post('/emp_datatbl02/deteleSelected_data', async (req, res) => {
  if(req.session.email){
   var reqType = req.body.type;
   var qry_delete =  "" 
   if (reqType != "all"){
      var itemids = req.body.itemids;
      qry_delete_from_tbl_user_roles =  "delete from tbl_user_roles where user_id in ('" +itemids.join("','")+"');"
      qry_delete =  "delete from tbl_user_details where id in ('" +itemids.join("','")+"');"
   }
  console.log(qry_delete)
  await executeSqlQuery(qry_delete_from_tbl_user_roles); 
  await executeSqlQuery(qry_delete);
  res.redirect('/User');
  }  else{
    res.redirect('/');
}
});

module.exports = router