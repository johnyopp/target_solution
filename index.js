var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');

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
    http.get({
        host: 'redsky.target.com',
        path: '/v1/pdp/tcin/' + product + '?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics'
    }, function(res) {
        // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
        res.setEncoding('utf8');

        console.log('/v1/pdp/tcin/' + product + '?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics');

        // incrementally capture the incoming response body
        var body = '';
        res.on('data', function(d) {
            body += d;
        });

        // do whatever we want with the response once it's done
        res.on('end', function() {
            try {
                var parsed = JSON.parse(body);
                console.log(parsed);
            } catch (err) {
                console.error('Unable to parse response as JSON', err);
                return cb(err);
            }

            // pass the relevant data back to the callback
            cb(null, parsed.product.item.product_description.title);
        });
    }).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        cb(err);
    });

}