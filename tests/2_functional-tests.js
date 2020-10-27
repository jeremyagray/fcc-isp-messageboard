const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;

const server = require('../server.js');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('/api/threads/:board routing tests', function() {
    suite('POST /api/threads/:board routes', function() {
      test('Good POST:  valid board, valid text, valid password', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'text': 'This is a test thread.',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/b\/general\/$/);

            done();
          });
      });

      test('Bad POST:  invalid board, valid text, valid password', function(done) {
        chai.request(server)
          .post('/api/threads/lieutenant')
          .send({
            'text': 'This is a test thread',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/$/);

            done();
          });
      });

      test('Bad POST:  valid board, valid text, empty password', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'text': 'This is a test thread',
            'delete_password': ''
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/$/);

            done();
          });
      });

      test('Good POST:  valid board, valid text, valid password, extra fields', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'text': 'This is a test thread',
            'delete_password': 'password',
            'bob': 'is your uncle'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/b\/general\/$/);

            done();
          });
      });

      test('Bad POST:  valid board, invalid fields', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'mary': 'This is a test thread',
            'bob': 'is your uncle'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/^https?:\/\/[^/]+\/$/);

            done();
          });
      });

      test('Bad POST:  valid board, valid text, no password field', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'text': 'This is a test thread'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/$/);

            done();
          });
      });

      test('Bad POST:  valid board, empty text, empty password', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({
            'text': '',
            'delete_password': ''
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/$/);

            done();
          });
      });

      test('Bad POST:  valid board, no fields', function(done) {
        chai.request(server)
          .post('/api/threads/general')
          .send({})
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect(response).to.redirect;
            expect(response).to.redirectTo(/\/$/);

            done();
          });
      });
    });

    suite('GET', function() {
    });

    suite('DELETE /api/threads/:board routes', function() {
      test('Good DELETE:  valid board, valid id, valid password', function(done) {
        const successMessage = 'success';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f9632f9e368493ed0c62db1',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, successMessage, 'Success messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  invalid board, valid id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/lieutenant')
          .send({
            '_id': '5f9632f9e368493ed0c62db1',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, valid id, invalid password', function(done) {
        const errorMessage = 'incorrect password';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f963391be3afc3f24fe45c0',
            'delete_password': 'bad'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, valid id, empty password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f963391be3afc3f24fe45c0',
            'delete_password': ''
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, valid id, missing password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f963391be3afc3f24fe45c0'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, non-existent id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f9632f9e368493ed0c62db1',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, invalid (short) id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f9632f9e368493ed0c62db',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, invalid (long) id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f9632f9e368493ed0c62db11',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, invalid (non-hexadecimal) id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '5f9632f9e368493ed0c62dbz',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, empty id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            '_id': '',
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, missing id, valid password', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({
            'delete_password': 'password'
          })
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad DELETE:  valid board, empty body', function(done) {
        const errorMessage = 'invalid input';

        chai.request(server)
          .delete('/api/threads/general')
          .send({})
          .end(function(error, response) {
            assert.equal(response.status, 400);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, errorMessage, 'Error messages should be equal.');

            done();
          });
      });
    });

    suite('PUT /api/threads/:board routes', function() {
      test('Good PUT:  valid board, valid, previously reported thread', function(done) {
        const successMessage = 'success';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': '5f948fc8fd04bb3831b4dca8'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, successMessage, 'Success messages should be equal.');

            done();
          });
      });

      test('Good PUT:  valid board, valid, previously reported thread, extra field', function(done) {
        const successMessage = 'success';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': '5f948fc8fd04bb3831b4dca8',
            'bob': 'is your uncle'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, successMessage, 'Success messages should be equal.');

            done();
          });
      });

      test('Good PUT:  valid board, valid, previously unreported thread', function(done) {
        // Need to create a test DB to get this id!
        const successMessage = 'success';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': '5f949489caac633c64a6f491'
          })
          .end(function(error, response) {
            assert.equal(response.status, 200);
            expect('Content-Type', /text\/html/);
            assert.equal(response.text, successMessage, 'Success messages should be equal.');

            done();
          });
      });

      test('Bad PUT:  invalid board, valid, previously reported thread', function(done) {
        const errorMessage = 'could not report thread';

        chai.request(server)
          .put('/api/threads/lieutenant')
          .send({
            'thread_id': '5f948fc8fd04bb3831b4dca8'
          })
          .end(function(error, response) {
            assert.equal(response.status, 500);
            expect(response).to.be.json;
            assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad PUT:  valid board, valid thread but does not exist', function(done) {
        const errorMessage = 'could not report thread';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': '5f949488caac633c64a6f490'
          })
          .end(function(error, response) {
            assert.equal(response.status, 500);
            expect(response).to.be.json;
            assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad PUT:  valid board, empty thread', function(done) {
        const errorMessage = 'could not report thread';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': ''
          })
          .end(function(error, response) {
            assert.equal(response.status, 500);
            expect(response).to.be.json;
            assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad PUT:  valid board, invalid thread', function(done) {
        const errorMessage = 'could not report thread';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'thread_id': '8675309'
          })
          .end(function(error, response) {
            assert.equal(response.status, 500);
            expect(response).to.be.json;
            assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

            done();
          });
      });

      test('Bad PUT:  valid board, invalid fields', function(done) {
        const errorMessage = 'could not report thread';

        chai.request(server)
          .put('/api/threads/general')
          .send({
            'bob': 'isYourUncle'
          })
          .end(function(error, response) {
            assert.equal(response.status, 500);
            expect(response).to.be.json;
            assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');

            done();
          });
      });
    });
  });

  suite('Routing for /api/replies/:board', function() {
    suite('POST', function() {
    });

    suite('GET', function() {
    });

    suite('PUT', function() {
    });

    suite('DELETE', function() {
    });
  });
});
