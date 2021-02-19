var express = require('express');
const router = express.Router();
var mysql = require('mysql')
const env = require("dotenv").config();


con = mysql.createConnection({
  host: process.env.host_data,
  user: process.env.usr_data,
  password: process.env.pwd_data,
  database : process.env.db_name,  
});

var roles = ['Admin','User','Super Admin','IT']

var alertMsg = '';
function executeSqlQuery(qry) {

    return new Promise((resolve, reject) => {
      con.query(qry, function (err, result) {
        if (err) {
            console.log(err);
            reject(err.sqlMessage);
        } 
        else {
          resolve(result);
          return result
        }
      });
    }
  );
}


router.get('/get_emp_data', async (req, res) => {
    if(req.session.email){
    var query_getallusers = `SELECT * FROM tbl_user_details where id='${req.session.userDetails[0].id}'`
    var allUsers = await executeSqlQuery(query_getallusers);
    qry_get_data =  `select * from tbl_employees ;`
    result = await executeSqlQuery(qry_get_data);
    res.render('pages/homePng',
    {
      userDetails : req.session.userDetails,
      userRoles: req.session.userRoles,
      lst_allusers : allUsers,
      lst_Allemp : result,
      lst_usrRoles : roles,
      alertMsg : alertMsg
    });
    alertMsg = '';
    }
    else{
      res.redirect('/home');
  }
  });


  router.post('/add/emp_details/tbl01/', async (req, res) => {

    console.log(req.body)
    if(req.session.email){
      qry_insert = `INSERT INTO tbl_employees (emp_Id, emp_name, emp_ISID, emp_email) VALUES ('${req.body.empId}', '${req.body.empName}', '${req.body.empisid}', '${req.body.empEmail}');`
      // await executeSqlQuery(qry_insert);
      
      con.query(qry_insert, function (err, result) {
        if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
         console.log(`Employee Already Exist ${req.body.empName}.`)
         alertMsg = `Employee Already Exist ${req.body.empName}.`
       }}
       res.redirect("/get_emp_data");
       
      })
    }
    else{
        res.redirect('/');
  }

  })

  router.get('/emp_datatbl01/detele/:id', async (req, res) => {
    if(req.session.email){
    var emp_id = req.params.id;
    qry_delete_from_tbl_employees =  `delete from tbl_employees where emp_Id ="${emp_id}";`  
    await executeSqlQuery(qry_delete_from_tbl_employees);     
    res.redirect("/get_emp_data");
    }
    else{
      res.redirect('/');
  }
  });

  router.get('/emp_datatbl01/edit/:id', async (req, res) => {
    if(req.session.email){
    var emp_id = req.params.id;
    qry_get_data =  `select * from tbl_employees where emp_Id = '${emp_id}';`
    result = await executeSqlQuery(qry_get_data);
    res.send(result);
    }
    else{
      res.redirect('/');
  }
  });

  router.post('/emp_datatbl01/update/:id',async (req, res) =>{ 
    if(req.session.email){
    var qry_update =  `update tbl_employees set emp_Id='${req.body.empId02}', emp_name='${req.body.empName02}', emp_ISID='${req.body.empISID02data}', emp_email ='${req.body.empEmail02}' where emp_Id = "${req.params.id}"`
    await executeSqlQuery(qry_update);
    res.redirect("/get_emp_data");
    }
    else{
      res.redirect('/');
  }
  });

  router.post('/emp_datatbl01/deteleSelected_data', async (req, res) => {
    if(req.session.email){
     var reqType = req.body.type;
     console.log(reqType)
     if (reqType != "all"){
        var itemids = req.body.itemids;
        qry_delete =  "delete from tbl_employees where emp_Id in ('" +itemids.join("','")+"');"
     }
    console.log(qry_delete)
    await executeSqlQuery(qry_delete);
    res.redirect('/get_emp_data');
    }  else{
      res.redirect('/');
  }
  });


module.exports = router