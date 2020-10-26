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
