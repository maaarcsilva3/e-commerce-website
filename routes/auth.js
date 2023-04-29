const express = require ('express');
const router = express.Router();
const bodyParser = require ('body-parser');
const app = express();
const bcrypt = require ('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


//bcrypt password encryption
const saltRounds = 10;
const myPlaintextPassword = 'password';
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(myPlaintextPassword, salt);



var jsonParser=bodyParser.json();

var urlencodedParser= bodyParser.urlencoded({extended: false});

//establish connection to mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Incorrect123!',
  database : 'sample_schema'
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL database: ' + error.stack);
        return;
    }

    console.log('Connected to MySQL database sample_schema '+ connection.threadId);
});



//express-session


router.get('/test', function (req, res, next) {
    req.session.myVar = 'Hello, world!';
    res.send('Session set!');
});
  
router.get('/check', (req, res) => {
const myVar = req.session.myVar || 'Session not set!';
res.send(myVar);
});







router.get('/login', (req, res) => {

    res.render ('login');  //go to login ejs

});



router.get('/signup-page', (req, res) => {
    res.render ('signup');
});


//create account then get value from form then store to mysql
router.post('/signup', urlencodedParser, (req, res) => {
    //getting the value from form name
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let email = req.body.email;
    let password = req.body.password;
    let user_type = req.body['default-radio'];


    //password encryption
    let encryptedPassword = bcrypt.hashSync(password, salt);

    //for mysql storage
    let user_details = {'first_name':first_name, 'last_name': last_name, 'email_address': email, 'password': encryptedPassword, 'user_type': user_type};
    let sql = `INSERT INTO users SET ?`;

    connection.query(sql, user_details, (err, result)=>{
        if(err) throw err;
        
    });

    connection.query('SELECT LAST_INSERT_ID();', (err, result) => {
        if (err) throw err;
        
        const lastUserId = result[0]['LAST_INSERT_ID()'];
        console.log('Last inserted user ID:', lastUserId);
    });

    if (user_type == 'buyer') {
        connection.query('SELECT LAST_INSERT_ID();', (err, result) => {
            if (err) throw err;

            const lastUserId = result[0]['LAST_INSERT_ID()'];

            let buyer_details = {'first_name':first_name, 'last_name': last_name, 'user_id': lastUserId};
            let buyer_sql = `INSERT INTO buyers SET ?`;

            console.log (lastUserId);

            connection.query(buyer_sql, buyer_details, (err, result)=>{
                if(err) throw err;
                res.redirect('/login');
            });

        });
        
        
    }


    if (user_type == 'seller') {
        connection.query('SELECT LAST_INSERT_ID();', (err, result) => {
            if (err) throw err;

            const lastUserId = result[0]['LAST_INSERT_ID()'];

            let seller_details = {'first_name':first_name, 'last_name': last_name, 'user_id': lastUserId};
            let seller_sql = `INSERT INTO sellers SET ?`;
            
            console.log (lastUserId);

            connection.query(seller_sql, seller_details, (err, result)=>{
                if(err) throw err;
                res.redirect('/login');
            });

        });
    }
    
    
   
});

router.get('/dashboard', (req, res) => {
    res.render ('dashboard', {nameofUser: req.session.first_name});
});



router.get('/buyer-profile', (req, res) => {
    console.log(req.session.user_id + "cart data will work");
    let query = `SELECT cart_id, quantity, product_name, product_id, buyer_id, product_price FROM carts WHERE user_id= '${req.session.user_id}'`;
     
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
        
      } else {
        const cart_id = results[0].cart_id;
        req.session.cart_id = cart_id;

        console.log( "this is the cart ID "+ req.session.cart_id);
       
        console.log(results);

        const totalPrice = results.reduce((total, item) => total + item.product_price, 0);
        console.log("Grand Total: ", totalPrice);

        res.render('buyer-profile',{nameofUser: req.session.first_name, details: results, grandtotal: totalPrice});
       
        }
      
    });
});

router.get('/editcart', (req, res) =>{

    var query = `DELETE FROM carts WHERE cart_id = '${req.session.cart_id}'`;

    connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      
    } else {
      console.log ("cart id " +req.session.cart_id +  "was removed from cart" );
    //   res.render('buyer-profile', {nameofUser: req.session.first_name});
    res.redirect('/buyer-profile')
    }
    
  });


});



//login authenticate. use POST method to get the value form form and comapre it to ysql
router.post('/authenticate', urlencodedParser, (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    
    const email_query = `SELECT first_name, last_name, user_id, email_address, password, user_type FROM users WHERE email_address = '${email}'`;
    
    
    if (req.session) {
        console.log(`Session started for user with email ${email}` );
    } else {
        console.log('Session not started!');
    }


    connection.query(email_query, (error, results, fields) => {
      if (error) {
        throw error;
      }
  
      if (results.length === 0) {
        res.send('Invalid email');
      } else {
        const user_type = results[0].user_type;
        const first_name = results[0].first_name;
        const last_name = results[0].last_name;
        const user_id = results[0].user_id;

        req.session.user_type =user_type;
        req.session.first_name =first_name;
        req.session.last_name =last_name;
        req.session.user_id =user_id;

       
        
        
        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword).then((match) => {
          if (match) {
           

            if(user_type == "buyer"){
                res.redirect('/dashboard');
            }else{
                res.redirect('/dashboard');
            }
            
          } else {
            
            res.send('Invalid password');
          }
        });
      }
    });
});







router.post('/addtoCart', urlencodedParser, (req, res) => {
    console.log(req.session.user_type);
    console.log("add to cart post is working");
    let qty=1;
    let selectedId=req.body.id;
  

    if (selectedId === 'boat-painting') {
    //    let product_name = 'Boat Painting';

       connection.query('SELECT product_id, product_price, product_name From products WHERE  product_id = 1; ', (err, result) => {
            if (err) throw err;

            const product_id = result[0].product_id;
            const product_price = result[0].product_price;
            const product_name = result[0].product_name;

            req.session.product_id = product_id;
            req.session.product_price = product_price;
            req.session.product_name = product_name;

            console.log(req.session.product_id);
            console.log(req.session.product_price);
            console.log(req.session.product_name);
            console.log(req.session.user_type);
        });


        if(req.session.user_type == "buyer") {

            var newQuery= `SELECT buyer_id From buyers WHERE  first_name = '${req.session.first_name}'`;

            connection.query( newQuery, (err, result) => {
                if (err) throw err;
    
                const buyer_id = result[0].buyer_id;
                req.session.buyer_id = buyer_id;

                console.log(req.session.buyer_id);

                let addtoCart = {'quantity':qty, 'product_name': req.session.product_name, 'product_id': req.session.product_id, 'buyer_id':req.session.buyer_id, 'product_price': req.session.product_price, 'user_id':req.session.user_id};
                let sql = `INSERT INTO carts SET ?`;
        
                connection.query(sql, addtoCart, (err, result)=>{
                    if(err) throw err;
                    console.log("added to cart");
                    
                });

            });

        } 


  

    } 


    else if (selectedId === 'river-painting') {
        let product_name = 'River Painting';
        connection.query('SELECT product_id, product_price, product_name From products WHERE  product_id = 2; ', (err, result) => {
            if (err) throw err;

            const product_id = result[0].product_id;
            const product_price = result[0].product_price;
            const product_name = result[0].product_name;

            req.session.product_id = product_id;
            req.session.product_price = product_price;
            req.session.product_name = product_name;

            console.log(req.session.product_id);
            console.log(req.session.product_price);
            console.log(req.session.product_name);
            console.log(req.session.user_type);
        });


        if(req.session.user_type == "buyer") {

            var newQuery= `SELECT buyer_id From buyers WHERE  first_name = '${req.session.first_name}'`;

            connection.query( newQuery, (err, result) => {
                if (err) throw err;
    
                const buyer_id = result[0].buyer_id;
                req.session.buyer_id = buyer_id;

                console.log(req.session.buyer_id);

                let addtoCart = {'quantity':qty, 'product_name': req.session.product_name, 'product_id': req.session.product_id, 'buyer_id':req.session.buyer_id, 'product_price': req.session.product_price, 'user_id':req.session.user_id};
                let sql = `INSERT INTO carts SET ?`;
        
                connection.query(sql, addtoCart, (err, result)=>{
                    if(err) throw err;
                    console.log("added to cart");
                });

            });

        } 
    } 
    
    else if (selectedId === 'bird-painting') {
        connection.query('SELECT product_id, product_price, product_name From products WHERE  product_id = 3; ', (err, result) => {
            if (err) throw err;

            const product_id = result[0].product_id;
            const product_price = result[0].product_price;
            const product_name = result[0].product_name;

            req.session.product_id = product_id;
            req.session.product_price = product_price;
            req.session.product_name = product_name;

            console.log(req.session.product_id);
            console.log(req.session.product_price);
            console.log(req.session.product_name);
            console.log(req.session.user_type);
        });


        if(req.session.user_type == "buyer") {

            var newQuery= `SELECT buyer_id From buyers WHERE  first_name = '${req.session.first_name}'`;

            connection.query( newQuery, (err, result) => {
                if (err) throw err;
    
                const buyer_id = result[0].buyer_id;
                req.session.buyer_id = buyer_id;

                console.log(req.session.buyer_id);

                let addtoCart = {'quantity':qty, 'product_name': req.session.product_name, 'product_id': req.session.product_id, 'buyer_id':req.session.buyer_id, 'product_price': req.session.product_price, 'user_id':req.session.user_id};
                let sql = `INSERT INTO carts SET ?`;
        
                connection.query(sql, addtoCart, (err, result)=>{
                    if(err) throw err;
                    console.log("added to cart");
                });

            });

        } 
    }
    
    else if (selectedId === 'tree-painting') {
        connection.query('SELECT product_id, product_price, product_name From products WHERE  product_id = 4; ', (err, result) => {
            if (err) throw err;

            const product_id = result[0].product_id;
            const product_price = result[0].product_price;
            const product_name = result[0].product_name;

            req.session.product_id = product_id;
            req.session.product_price = product_price;
            req.session.product_name = product_name;

            console.log(req.session.product_id);
            console.log(req.session.product_price);
            console.log(req.session.product_name);
            console.log(req.session.user_type);
        });


        if(req.session.user_type == "buyer") {

            var newQuery= `SELECT buyer_id From buyers WHERE  first_name = '${req.session.first_name}'`;

            connection.query( newQuery, (err, result) => {
                if (err) throw err;
    
                const buyer_id = result[0].buyer_id;
                req.session.buyer_id = buyer_id;

                console.log(req.session.buyer_id);

                let addtoCart = {'quantity':qty, 'product_name': req.session.product_name, 'product_id': req.session.product_id, 'buyer_id':req.session.buyer_id, 'product_price': req.session.product_price, 'user_id':req.session.user_id};
                let sql = `INSERT INTO carts SET ?`;
        
                connection.query(sql, addtoCart, (err, result)=>{
                    if(err) throw err;
                    console.log("added to cart");
                });

            });

        } 
        
    }
    
 
    res.redirect('/dashboard');
});


router.get('/cartdata', (req, res) => {
    console.log(req.session.user_id + "cart data will work");
    let query = `SELECT cart_id, quantity, product_name, product_id, buyer_id, product_price FROM carts WHERE user_id= '${req.session.user_id}'`;
     
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
        
      } else {

        console.log(results);
        
        const totalPrice = results.reduce((total, item) => total + item.product_price, 0);
        console.log("Grand Total: ", totalPrice);

        res.render('buyer-profile',{details: results, grandtotal: totalPrice});
       
        }
      
    });
});



module.exports = router; //top make it accessible outside