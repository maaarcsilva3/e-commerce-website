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
  database : 'sample_schema',
  multipleStatements: true
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL database: ' + error.stack);
        return;
    }

    console.log('Connected to MySQL database sample_schema ');
});

  
router.get('/home', (req, res) => {

    res.render ('home');  //go to login ejs

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
    let query = 'SELECT product_id, product_link, product_name, product_price,product_qty FROM products';
    
    connection.query(query, (error, results) => {
        if (error) {
          console.error(error);
          
        } else {
           
            console.log(results);
            // res.render ('dashboard', {nameofUser: req.session.first_name, newTarget: results});

            let cartcounterQuery = `SELECT count(*) as count FROM carts WHERE user_id = '${req.session.user_id}'`;
            connection.query (cartcounterQuery, (error,counterresult) => {
                if (error) {
                    console.error(error);
                    
                  } else {
                    let counterResult = counterresult[0].count;

                  
                    console.log(counterResult);
                    res.render ('dashboard', {nameofUser: req.session.first_name, newTarget: results, cartcounter: counterResult});
                }
        
            });
        }
        
    });
   

});





router.get('/browse', (req, res) =>{
    if (req.session.user_id = req.session.user_id ){
        res.redirect ('dashboard');
        
        
    }else{
        res.redirect ('login');
        
    }
   

});










router.get('/buyer-profile', (req, res) => {
    console.log(req.session.user_id + "cart data will work");

    // Query to count the number of rows in the carts table
    const countQuery = "SELECT COUNT(*) as count FROM carts";

    connection.query(countQuery, (error, countResult) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error checking cart data');
        }

        const cartCount = countResult[0].count;

        if (cartCount == 0) {
            console.log('Cart table is empty');
            return res.render('buyer-profile', { nameofUser: req.session.first_name, details: [], grandtotal: "" });
        }

        // Query to fetch cart data for the logged-in user
        const query = `SELECT product_id, cart_id, quantity, product_name, user_id, product_price FROM carts WHERE user_id= '${req.session.user_id}'`;

        connection.query(query, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error fetching cart data');
            }

            const cart_id = results[0].cart_id;
            const prodname= results[0].product_name;
            req.session.cart_id = cart_id;
            req.session.product_name =prodname;

           

            if (cart_id < 1 || cart_id == "") {
                console.log('Cart is empty');
                return res.render('buyer-profile', { nameofUser: req.session.first_name, details: [], grandtotal: "" });
            } else {
               
                

                const totalPrice = results.reduce((total, item) => total + item.product_price, 0);
                

                return res.render('buyer-profile', { nameofUser: req.session.first_name, details: results, grandtotal: totalPrice });
            }
        });
    });
});


router.post('/editcart', urlencodedParser, (req, res) =>{

    const productID = req.body.product_id;
    const cartID = req.body.cart_id;
    console.log(productID);

    var query = `DELETE FROM carts WHERE cart_id = '${cartID}'`;
    connection.query(query, (error, results) => {
        if (error) {
          console.error(error);
          
        } else {
        
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

///////////////////////////////////////////
        req.session.sessionID=req.sessionID;
//////////////////////////////////////////

        console.log(req.session.user_type,req.session.first_name,req.session.last_name, req.session.user_id);
       
        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword).then((match) => {
          if (match) {
           

            if(user_type == "buyer"){
                res.redirect('/dashboard');
            }else{
                res.redirect('/seller-dashboard');
            }
            
          } else {
            
            res.send('Invalid password');
          }
        });
      }
    });
});



router.post('/addtoCart', urlencodedParser, (req, res) => {

    //to get the value from ejs template tag
    const productName = req.body.product_name;
    const productPrice = req.body.product_price;
    const productQty = req.body.product_qty;
    const productID = req.body.product_id;
    


    let sql = `INSERT INTO carts SET ?`;
    let cartDetail = {'product_name':productName, 'product_id':productID,  'product_price':productPrice, 'quantity': productQty, 'user_id':req.session.user_id, };
 

    connection.query(sql, cartDetail, (err, result)=>{
        if(err) throw err;
        res.redirect('/dashboard');
    });

    
});



router.post('/checkout', urlencodedParser, (req, res) => {

    let query = 'SELECT product_name FROM carts';

    let newQuery = `DELETE FROM carts WHERE user_id = '${req.session.user_id}'`;

    connection.query(query, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error ');

        }
        results.forEach((result) => {
            const productName = result.product_name;
            

            const query2 = `UPDATE products SET product_qty = product_qty - 1 WHERE product_name = '${productName}'`;

            connection.query(query2, (error, result, fields) => {
                if (error) {
                    console.error(error);
                    } else {
                    
                }
                
            });
        
        });

        connection.query(newQuery, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error ');
            }

            ///////////////////////////////////////////////////////////
            let deleteQuery = 'DELETE FROM products WHERE product_qty <= 0';

                connection.query(deleteQuery, (error, result) => {
                    if (error) {
                    console.error(error);
                    
                    } else {
                        res.redirect('dashboard');
                        

                    }
                });



            /////////////////////////


          
        }); 

       
    }); 
    

   
});



router.get('/logout', (req, res)=>{

    req.session.destroy(function(err) {
        if (err) {
          console.log(err);
        } else {
            res.redirect('login');
        }
    });
      
   
});


//sellers functions
router.get('/seller-dashboard', (req, res) => {
    
    let query = `SELECT product_id, product_link, product_name, product_price, product_qty FROM products WHERE user_id = '${req.session.user_id}'; SELECT count(*) as count FROM products WHERE user_id= '${req.session.user_id}'`;

    connection.query(query, (error, results) => {
        if (error) {
        console.error(error);
        
        } else {
        let productsCount = results[1][0].count;

        console.log(productsCount);
         
        res.render ('seller-dashboard', {nameofUser: req.session.first_name, nameofArt:req.session.product_name, data: results[0],});
    
        }

    });


    
});






router.post('/sellitem', urlencodedParser, (req, res) => {
    let product_name = req.body.p_name;
    let product_price = req.body.p_price;
    let product_quantity = req.body.p_qty;
    let product_link = req.body.p_link;
    let user_id = req.session.user_id;

    req.session.product_name = product_name;
    req.session.product_price = product_price;
    req.session.product_quantity = product_quantity;
    req.session.p_link = product_link;

    console.log("seller details from this session: " + req.session.product_name, req.session.product_price, req.session.product_quantity);
  

    let prod_details = {'product_link':product_link, 'product_name':product_name, 'product_price': product_price, 'product_qty': product_quantity, 'user_id': user_id};
    let sql = `INSERT INTO products SET ?`;

    connection.query(sql, prod_details, (error, result)=>{
        if (error) {
            throw error;
        } else {

            console.log("successfuly stored to DB")
            res.redirect('seller-dashboard');
        }


        
    });
});


router.post('/remove-listing', urlencodedParser, (req, res) => {
    const productID = req.body.product_id;
    console.log(productID);

    const query2 = `DELETE FROM products WHERE product_id = '${productID}'`;

    connection.query(query2, (error, result, fields) => {
        if (error) {
            console.error(error);
            } else {
            console.log(result);
        }
        
        res.redirect('seller-dashboard');
    });


});
   



router.get ('/testing', (req, res) => {

    res.render('testing');

});






module.exports = router; //top make it accessible outside