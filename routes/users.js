var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var indexRouter = require('../routes/index');
var path = require('path');
var baseurl = 'http://localhost:3000/';
var fs = require('fs');
require('./users');
const multer = require('multer');
const imgfile = './public/uploads/';
router.use(express.static(path.join(__dirname, 'public')));
router.use('/', indexRouter);
router.use(bodyParser.urlencoded({ extended: true}));
router.use(bodyParser.json());
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    multipleStatements: true,
    database : 'node'
});
connection.connect(function(err) {
    if (err) throw err;
});




// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}



router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
  	connection.query('SELECT image FROM signup  WHERE username = ?', [req.session.username], function(error, results) {
  		const img = imgfile + results[0].image;
  		fs.unlink(img, (err) => {

  console.log('deleted');
});

  	});
  	connection.query('UPDATE signup SET image = ? WHERE username = ?', [req.file.filename,req.session.username], function(error, row) {

  
    if(err){
     res.redirect(baseurl+'home');
    }  else {
        res.redirect(baseurl+'users/profile');
      }
    });
  });
});























/* GET users listing. */
router.post('/update', function(req, res, next) {
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var mobile = req.body.mobile;
	var address = req.body.address;
	var postalcode = req.body.postalcode;
	var dob = req.body.dob;
  connection.query('UPDATE signup SET first_name = ?, last_name = ?, mobile = ?, address = ?, postal_code = ?,date_of_birth = ? WHERE username = ?', [firstname,lastname,mobile,address,postalcode,dob,req.session.username], function(error, row) {
      if(error){
      	res.send('Not Work');
      	console.log(error);
      }

      else{
      	res.redirect(baseurl+'users/profile');
      }
  });
});
router.get('/profile', function(req, res, next) {
     if(req.session.username){
         connection.query('SELECT * FROM signup WHERE username = ?', [req.session.username], function(error, row) {
			if(error){
				res.json(error);
			}

			else{
				console.log(row);
				res.render('profile',{
				title: 'Express',
                 data: row,
                 username: req.session.username,
                 id: req.session.key,
                 imgurl: baseurl
			});
      }
		});
     }

     else{
     	
     	res.redirect(baseurl+'login');
 
     }
});
router.get('/frd_request/:id', function(req, res, next) {

	var sql= "INSERT INTO frd_request(sender_id,receiver_id,status) VALUES(?, ?, ?)";
	connection.query(sql, [req.session.key,req.params.id,1], function(error, row) {
          
          if(error){
          	res.send("Not Work");
          }

          else{
          	res.redirect(baseurl+'home');
          }
	});



});

router.get('/user_profile/:id', function(req, res, next){

     var sql= "SELECT id,first_name,last_name,email,mobile,address,postal_code,date_of_birth,image FROM signup WHERE id = ?";
	 connection.query(sql, [req.params.id], function(error, row) {
        if(error){
        	res.send("Not Work");

        }

        else{
        	console.log(row);
        	res.render('bio',{
                title : 'Express',
                data : row,
                username: req.session.username,
                imgurl: baseurl
               
        	});
        }
	 });
});

module.exports = router;
