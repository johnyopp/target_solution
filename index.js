var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
var jsonParser = bodyParser.json()

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/products/:productId', function (request, response) {
  nonrelationalQuery(request, response);
});
 
var mongodbHost = '@ds111963.mlab.com';
var mongodbPort = '11963';
var authenticate = process.env.MONGO_USER+':'+process.env.MONGO_PASS;
var mongodbDatabase = 'heroku_b41mlkb1';
 
// connect string for mongodb server running locally, connecting to a database called test
var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;
console.log("url: " + url);

function nonrelationalQuery(request, response)
{
  var product = request.params.productId;

  //Retrieve product name from service first, then get currency code and price from mongo db
  getProductName(product, function(err, name){

    //Handle any product error
    if (err) return response.json(err);

    MongoClient.connect(url, function(err, db) {
      if (err) return response.json(err);
      
      var query = { "tcin": product };
      var dbo = db.db("heroku_b41mlkb1");

      dbo.collection("item_price").findOne(query,function(err, result) {

        // Handle any query error.
        if (err) return response.json(err);
        db.close();

        return response.json({"id" : product,"name": name,"current_price": result.price,"currency_code": result.currency_code});
      });
    });
  });  
}

function relationalQuery(request, response)
{
  var product = request.params.productId;
  
  //Retrieve product name from service first, then get currency code and price from key value hstore in postgres database
  getProductName(product, function(err, name){

    //Handle any product error
    if (err) return response.json(err);

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query("SELECT attr->'price' as value, attr->'currency' as currency_code FROM products WHERE product_id='" + product + "'", function(err, result) {
        done();

        // Handle any query error.
        if (err) return response.json(err);

        // Return result
        return response.json({"id" : product,"name": name,"current_price": result.rows[0]});
      });
    });
  });  
}

function getProductName(product, cb) {
  //Retrieve product name from another service
  var request = require('request');

  //Convince service that this is a browser request, otherwise request is blocked
  var options = {
    url: 'https://redsky.target.com/v1/pdp/tcin/' + product + '?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
    }
  };

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var parsed = JSON.parse(body);
      cb(null, parsed.product.item.product_description.title);
    }
    else
    {
      cb(error);
    }
  });
}

app.put('/products/:productId', jsonParser, function (request, response) {
  var product = request.params.productId;

  var price = request.body.current_price.value;
  var currency_code = request.body.current_price.currency_code;

  //UPSERT as two separate but equal lines in single call.  Update works only if line exists, and insert works only if line does not exist.
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query("UPDATE products SET attr = attr || '\"currency\"=>\"" + currency_code + "\",\"price\"=>\"" + price + "\"' :: hstore where product_id='" + product + "';INSERT INTO products (product_id, attr) SELECT '" + product + "','\"currency\" => \"" + currency_code + "\",\"price\" => \"" + price + "\"' WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id='" + product + "');", function(err, result) {

      done();

      // Handle any errors.
      if (err)
      {
        return response.json(err);
      }

      return response.json(result.rows);
    });
  });
});
