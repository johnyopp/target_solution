var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();

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
  
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query("SELECT attributes->'currency' as currency, attributes->'price' as price FROM products WHERE product_id='" + product + "'", function(err, result) {
      done();

      // Handle any errors.
      if (err) return response.json(err);

      // Return result
      return response.json(result.rows);
    });
  });
});
