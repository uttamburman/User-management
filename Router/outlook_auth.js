var https = require('https');
const EWS = require('node-ews');
var dateTime = require('node-datetime');


var dt = dateTime.create();
var datetime = dt.format('Y-m-d H:M:S');

const ewsFunction = 'FindItem';

var ewsArgs = {
  'attributes': {
    'Traversal': 'Shallow'
  },
  'ItemShape': {
    'BaseShape': 'IdOnly'
  },
  'ParentFolderIds' : {
    'DistinguishedFolderId': {
      'attributes': {
        'Id': 'inbox'
      }
    }
  }
};

async function authenticate(req,res, userDetails, userRoles) {
  
	let login = false;
	const ewsConfig = {
	  username: req.body.email,
	  password: req.body.password,
	  host: 'https://outlook.office365.com',
	  auth: 'basic'
	};
  const ews = new EWS(ewsConfig);
    try {
        let result = await ews.run(ewsFunction, ewsArgs);
        login = true;
        console.log("Login: "+login);
        var query_settion_add =  `INSERT INTO tbl_user_session (user_id, user_session_id, created_date, is_valid) VALUES ('${userDetails[0].id}', '${req.session.id}',"${datetime}", '1')`
        var qry_update_tbl_user_details = `UPDATE tbl_user_details SET  lastLoggedInTime = '${datetime}' WHERE (id = '${userDetails[0].id}');`
        await executeSqlQuery(query_settion_add);
        await executeSqlQuery(qry_update_tbl_user_details);
        req.session.email = req.body.email;
        req.session.userDetails = userDetails;
        req.session.isAuthenticated = true;
        req.session.userRoles = userRoles;
        res.send( {status: true, cookie_sessionId : req.session.id})
        }
    catch (err) {
    login = false;
    console.log("Login: "+login);
    console.log("Login err: "+err);
    res.send(401,{
      'status': false
    })
    // return login 
    }
};


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


module.exports.authenticate = authenticate;