var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var flash = require('connect-flash');
var baseurl = 'http://localhost:3000/';
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'node'
});
connection.connect(function(err) {
    if (err) throw err;
});
router.use(bodyParser.urlencoded({ extended: true}));
router.use(bodyParser.json());
router.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}));
router.use(flash());
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
		res.render('login', { title: 'Express' });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express',errors: req.session.errors});
});
router.get('/home', function(req, res, next) {
	if(req.session.username){
	
 
  var sql = "SELECT signup.*, frd_request.* FROM signup LEFT JOIN frd_request ON signup.id=frd_request.receiver_id AND frd_request.sender_id= ? WHERE signup.username NOT IN(SELECT signup.username FROM signup WHERE signup.username = ?) ORDER BY signup.id";
     connection.query(sql,[req.session.key,req.session.username], function(err, result) {
         if(err){
         	res.send(err);
         }
         else{
         	res.render('home', {
         	    title: 'Express',
         		data: result,
         		username: req.session.username,
         		id: req.session.key,
         		imgurl: baseurl
         	});
         }
      	
    });
 //res.render('home', { title: 'Express', username: req.session.username });
}
else{
	res.render('login', { title: 'Express' });
}
});

router.get('/logout', function(req, res, next){
     req.session.destroy();
     res.render('login', { title: 'Express' });
});

router.post('/save',function(req,res){

    req.checkBody('firstname', 'Firstaname Required').notEmpty();
    req.checkBody('lastname', 'Lastname Required').notEmpty();
    req.checkBody('email', 'Email Required').notEmpty();
    req.checkBody('username', 'Username Required').notEmpty();
    req.checkBody('password', 'Password Required').notEmpty();
 
 
    const errors = req.validationErrors();

    if(!errors){
    	
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
    

    
    


	bcrypt.hash(password, saltRounds, function(err, password) {
     var sql = "INSERT INTO signup (first_name,last_name,email,username,password) VALUES ('" + firstname + "', '" + lastname + "','" + email + "','" + username + "','" + password + "')";
     connection.query(sql, function(err, result) {

     	if(err){
     		res.send('Username Already Taken');
     	}
     else{
     		res.redirect(baseurl+'login');
     }
      
    });
  });
    }

    else{
         console.log('errors: ${JSON.stringfy(errors)}');
    	res.render('signup', {title: 'Registration Failed',
                               errors: errors});
    }



	 
});

router.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var id = request.id;
	if (username && password) {
		connection.query('SELECT * FROM signup WHERE username = ?', [username], function(error, results) {
			//const hash = results[0].password;
			if(!results.length){
				response.send('Incorrect Username');
			}
				else{
                const hash = results[0].password;
				console.log(hash);
			   bcrypt.compare(password, hash, function(err, same) {
			   	
			   	if(err){
			   		response.send('error');
			   	}
                else if (same) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.key = results[0].id;
				response.redirect('/home');
			}
			else{
				response.send('Incorect Username or Password');
			}

			//response.end();
       });
			}
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

module.exports = router;
