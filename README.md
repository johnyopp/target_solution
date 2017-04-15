#Application Use

Application implements the myRetail RESTful service case study.

For product GET requests use the following address syntax:

  https://yopp-target-answer.herokuapp.com/products/{product_id}

  e.g.,

  https://yopp-target-answer.herokuapp.com/products/13860428

Results will be provided in the following JSON format:

  {"id":"13860428","name":"The Big Lebowski (Blu-ray)","current_price":{"value":"13.49","currency_code":"USD"}}

For product PUT requests to update the currency code and/or price use the following address:

  https://yopp-target-answer.herokuapp.com/products/{product_id}

  e.g.,

  https://yopp-target-answer.herokuapp.com/products/13860428

With the following JSON format in the body:

  {"id":"13860428","name":"The Big Lebowski (Blu-ray)","current_price":{"value":"13.49","currency_code":"USD"}}

NOTE:  The PUT request will insert new data for items it does not have or update data for items it already has.

DATA NOTE:  Only item ids 13860428 and 16696652 currently have data in the price database.

#Code and Database

All code for the GET and PUT calls are in the index.js file.

Currency and pricing information are stored in a Postgres database table using an hstore key value column.
This was done as an exploration of using a Nosql storage solution embedded in an ACID data store.