var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var https = require('https');

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


//app.get('/product', function (request, response) {

//var request=require("request");
//var site_name = encodeURI("http://redsky.target.com/v1/pdp/tcin/13860428");

//var site_name = encodeURI("https://maps.googleapis.com/maps/api/timezone/json?location=39.6034810,-119.6822510&timestamp=1331161200&key=AIzaSyBliTe19QOrCj12Lt1YbPDzi4I7MZJHqkk");
//request.get(site_name,function(error,response,body){
  //         if(error){
    //             console.log(error);
      //     }

        //   console.log(response);
          // console.log('111111111111111111');
           //console.log(body);
//});
//});




app.get('/product_test/:productId', function (request, response) {





var request = require('request');

var options = {
  url: 'https://redsky.target.com/v1/pdp/tcin/13860428',
  headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
  	console.log("GOT TO THE RIGHT PLACE");
    var info = JSON.parse(body);
    console.log(info);
  }
  else
  {
  	console.log("DARNIT");
  	console.log("ERROR");
  	console.log(error);
  	console.log("RESPONSE");
  	console.log(response);
  	console.log("BODY");
  	console.log(body);
  }
}

request.get(options, callback);





});







app.get('/products/:productId', function (request, response) {
  var product = request.params.productId;
  
  getProductName(product, function(err, name){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query("SELECT attributes->'price' as value, attributes->'currency' as currency_code FROM products WHERE product_id='" + product + "'", function(err, result) {
        done();

        // Handle any errors.
        if (err) return response.json(err);

        // Return result
        return response.json({"id" : product,"name": name,"current_price": result.rows[0]});
      });
    });
  });
});

function getProductName(product, cb) {
  var request = require('request');

  var options = {
    url: 'https://redsky.target.com/v1/pdp/tcin/' + product,
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