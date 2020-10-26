const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;

const server = require('../server.js');

chai.use(chaiHttp);

suite('Functional Tests', function()
      {
        suite('Routing for /api/threads/:board', function()
              {
                suite('POST Routes', function()
                      {
                        test('Good POST', function(done)
                             {
                               chai.request(server)
                                 .post('/api/threads/general')
                                 .send({
                                   'text': 'This is a test thread',
                                   'delete_password': 'password'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 200);
                                        expect(response).to.redirect;
                                        expect(response).to.redirectTo(/\/b\/general\/$/);

                                        done();
                                      });
                             });
                      });

                suite('GET', function()
                      {
                      });

                suite('DELETE', function()
                      {
                      });

                suite('PUT', function()
                      {
                        test('Good PUT, reported thread', function(done)
                             {
                               const successMessage = 'success';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'thread_id': '5f948fc8fd04bb3831b4dca8'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 200);
                                        expect('Content-Type', /text\/html/);
                                        assert.equal(response.text, successMessage, 'Success messages should be equal.');

                                        done();
                                      });
                             });

                        test('Good PUT, unreported thread', function(done)
                             {
                               // Need to create a test DB to get this id!
                               const successMessage = 'success';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'thread_id': '5f949489caac633c64a6f491'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 200);
                                        expect('Content-Type', /text\/html/);
                                        assert.equal(response.text, successMessage, 'Success messages should be equal.');

                                        done();
                                      });
                             });

                        test('Bad PUT, non-existent thread', function(done)
                             {
                               const errorMessage = 'could not report thread';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'thread_id': '5f949488caac633c64a6f490'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 500);
                                        expect(response).to.be.json;
                                        assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

                                        done();
                                      });
                             });

                        test('Bad PUT, empty request', function(done)
                             {
                               const errorMessage = 'could not report thread';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'thread_id': ''
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 500);
                                        expect(response).to.be.json;
                                        assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

                                        done();
                                      });
                             });

                        test('Bad PUT, malformed thread_id', function(done)
                             {
                               const errorMessage = 'could not report thread';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'thread_id': '8675309'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 500);
                                        expect(response).to.be.json;
                                        assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

                                        done();
                                      });
                             });

                        test('Bad PUT, malformed request', function(done)
                             {
                               const errorMessage = 'could not report thread';

                               chai.request(server)
                                 .put('/api/threads/general')
                                 .send({
                                   'bob': 'isYourUncle'
                                 })
                                 .end(function(error, response)
                                      {
                                        assert.equal(response.status, 500);
                                        expect(response).to.be.json;
                                        assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

                                        done();
                                      });
                             });
                      });
              });

        suite('Routing for /api/replies/:board', function()
              {
                suite('POST', function()
                      {
                      });

                suite('GET', function()
                      {
                      });

                suite('PUT', function()
                      {
                      });

                suite('DELETE', function()
                      {
                      });
              });
      });
