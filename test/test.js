"use strict";
 
 var chai = require('chai');
 var chaiHttp = require('chai-http');
 var server = require('../index.js');
 var app = server.app;
 var should = chai.should();
 var expect = chai.expect;
 
 chai.use(chaiHttp);
 
 describe('ItemAccessCaseStudy', function() {
   it('should list item price data on GET', function(done){
        chai.request(app)
        .get('/products/13860428')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('current_price');
            res.body.current_price.should.have.property('value');
            res.body.current_price.should.have.property('currency_code');
            res.body.current_price.value.should.equal('44.89');
            res.body.current_price.currency_code.should.equal('USD');
            res.body.id.should.equal('13860428');
            done();
        });
    });

    it('should update a list item price on PUT', function(done) {
        chai.request(app)
            .put('/products/13860428')
            .send({"id":"13860428","name":"The Big Lebowski (Blu-ray)","current_price":{"value":"13.49","currency_code":"USD"}})
            .end(function(error, response){
                chai.request(app)
                .get('/products/13860428')
                .end(function(err, res){
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    res.body.should.have.property('current_price');
                    res.body.current_price.should.have.property('value');
                    res.body.current_price.should.have.property('currency_code');
                    res.body.current_price.value.should.equal('13.49');
                    res.body.current_price.currency_code.should.equal('USD');
                    res.body.id.should.equal('13860428');
                    done();
            });
        });
    });

    it('should update a list item price on PUT', function(done) {
        chai.request(app)
            .put('/products/13860428')
            .send({"id":"13860428","name":"The Big Lebowski (Blu-ray)","current_price":{"value":"44.89","currency_code":"USD"}})
            .end(function(error, response){
                chai.request(app)
                .get('/products/13860428')
                .end(function(err, res){
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    res.body.should.have.property('current_price');
                    res.body.current_price.should.have.property('value');
                    res.body.current_price.should.have.property('currency_code');
                    res.body.current_price.value.should.equal('44.89');
                    res.body.current_price.currency_code.should.equal('USD');
                    res.body.id.should.equal('13860428');
                    done();
            });
        });
    });
 });
