const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;

const server = require('../server.js');

// Import models for database mocking.
const Boards = require('../models/boards.js');
const Replies = require('../models/replies.js');
const Threads = require('../models/threads.js');

// Controller functions.
const replyController = require('../controllers/replyController.js');

// Database information.
const testingBoardName = 'testing';
const testingBoardRegExp = /\/b\/testing\/$/;
const testingThreadEndpoint = '/api/threads/testing';
const invalidThreadEndpoint = '/api/threads/~!!@';
const nonexistentThreadEndpoint = '/api/threads/notreal';
// const testingReplyEndpoint = '/api/replies/testing';
// const invalidReplyEndpoint = '/api/replies/~!!@';
// const nonexistentReplyEndpoint = '/api/replies/notreal';

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suiteSetup('Mock Testing Board Setup', async function() {
    const now = new Date();
    
    // Create testing board and save its _id.
    const testingBoardInfo = {
      'board': testingBoardName,
      'created': now
    };

    await Boards.create(testingBoardInfo);

    // Create some threads (15-20) and replies.
    let threadModel = await Threads(testingBoardName);
    let replyModel = await Replies(testingBoardName);
    const topics = Math.floor(Math.random() * 6) + 15;

    for (let i = 0; i < topics; i++) {
      let getThreadInfo = {
        'text': 'This is test thread ' + i +'.',
        'delete_password': 'password'
      };

      let getThread = await threadModel.create(getThreadInfo);
      
      let responses = Math.floor(Math.random() * 11);

      for (let j = 0; j < responses; j++) {
        let replyInfo = {
          'text': 'This is thread ' + getThread._id + ' reply ' + j +'.',
          'delete_password': 'password',
          'thread_id': getThread._id
        };

        await replyModel.create(replyInfo);
      }
      
    }
  });

  suiteTeardown('Mock Testing Board Teardown', async function() {
    
    // Remove all testing threads and board.
    await Threads(testingBoardName).deleteMany({}).exec();
    await Replies(testingBoardName).deleteMany({}).exec();
    await Boards.deleteMany({'board': testingBoardName}).exec();
  });

  suite('/api/threads/:board routing tests', function() {
    suite('POST /api/threads/:board routes', function() {
      test('Good POST:  valid board, valid text, valid password', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': 'password'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], testingBoardRegExp, 'Thread actions should redirect to the board.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Good POST:  valid board, valid text, valid password, extra fields', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': 'password',
              'bob': 'is your uncle',
              'alice': 'is your aunt'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], testingBoardRegExp, 'Thread actions should redirect to the board.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  non-existent board', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(nonexistentThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': 'password'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  invalid board name', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(invalidThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': 'password'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  valid board, valid text, empty password', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': ''
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  valid board, valid text, missing password', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': 'This is a test thread.'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  valid board, empty text, valid password', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': '',
              'delete_password': 'password'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  valid board, missing text, valid password', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'delete_password': 'password'
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad POST:  valid board, empty fields', async function() {
        let response;

        try {
          response = await chai.request(server)
            .post(testingThreadEndpoint)
            .send({
              'text': 'This is a test thread.',
              'delete_password': ''
            });

          assert.equal(response.status, 200);
          assert.property(response, 'redirects');
          assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    });

    test('Bad POST:  valid board, invalid fields', async function() {
      let response;

      try {
        response = await chai.request(server)
          .post(testingThreadEndpoint)
          .send({
            'alice': 'is your aunt',
            'bob': 'is your uncle'
          });

        assert.equal(response.status, 200);
        assert.property(response, 'redirects');
        assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    test('Bad POST:  empty body', async function() {
      let response;

      try {
        response = await chai.request(server)
          .post(testingThreadEndpoint)
          .send({});

        assert.equal(response.status, 200);
        assert.property(response, 'redirects');
        assert.match(response.redirects[0], /\/$/, 'Thread actions should redirect to the index.');
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    suite('GET', function() {
      test('Good GET:  valid board', async function() {
        let response;

        try {
          // Get the correct threads from the DB.
          const threads = await Threads(testingBoardName).find({}).sort({bumped_on: 'desc'}).limit(10).exec();
          const dbThreads = threads.map(function(item) {
            return item._id.toString();
          });

          response = await chai.request(server)
            .get(testingThreadEndpoint);

          // Gather the threads from the response.
          let gotThreads = [];
          for (let i = 0; i < response.body.threads.length; i++) {
            gotThreads.push(response.body.threads[i]._id);
          }
          
          assert.equal(response.status, 200);
          assert.isObject(response.body);
          assert.deepEqual(dbThreads, gotThreads, 'The thread list from the database and response should match.');

          // Check the replies on each thread.
          for (let i = 0; i < dbThreads.length; i++) {
            let dbReplies = await replyController.getReplies(testingBoardName, dbThreads[i], 3);
            dbReplies = dbReplies.map(function(item) {
              return item.toString();
            });
            assert.deepEqual(dbReplies, response.body.threads[i].replies, 'The reply list from the database and response should match.');
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad GET:  non-existent board', async function() {
        let response;

        try {
          response = await chai.request(server)
            .get('/api/threads/notreal');

          assert.equal(response.status, 400);
          assert.isObject(response.body);
          assert.equal(response.body.error, 'invalid board', 'Error messages should match.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad GET:  invalid board name', async function() {
        let response;

        try {
          response = await chai.request(server)
            .get(invalidThreadEndpoint);

          assert.equal(response.status, 400);
          assert.isObject(response.body);
          assert.equal(response.body.error, 'invalid input', 'Error messages should match.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    });

    suite('DELETE /api/threads/:board routes', function() {
      test('Good DELETE:  valid board, valid id, valid password', async function() {
        const successMessage = 'success';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 200);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, successMessage, 'Success messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Good DELETE:  valid board, valid id, valid password, extra field', async function() {
        const successMessage = 'success';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': deleteThread.delete_password,
              'bob': 'is your uncle'
            });

          assert.equal(response.status, 200);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, successMessage, 'Success messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  non-existent board', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(nonexistentThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  invalid board name', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(invalidThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, valid id, invalid password', async function() {
        const errorMessage = 'incorrect password';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': 'bad'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, valid id, empty password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': deleteThread._id,
              'delete_password': ''
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, valid id, missing password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': deleteThread._id
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, non-existent id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': '123456789012345678901234',
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, invalid (short) id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': '5f9632f9e368493ed0c62db',
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, invalid (long) id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': '5f9632f9e368493ed0c62db11',
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, invalid (non-hexadecimal) id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': '5f9632f9e368493ed0c62dbz',
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, empty id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              '_id': '',
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, missing id, valid password', async function() {
        const errorMessage = 'invalid input';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const deleteThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const deleteThread = await thread.create(deleteThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({
              'delete_password': deleteThread.delete_password
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad DELETE:  valid board, empty body', async function() {
        const errorMessage = 'invalid input';

        try {
          let response;
          response = await chai.request(server)
            .delete(testingThreadEndpoint)
            .send({});

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    });

    suite('PUT /api/threads/:board routes', function() {
      test('Good PUT:  valid board; valid, previously reported thread', async function() {
        const successMessage = 'success';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const putThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password',
          'reported': true
        };

        const putThread = await thread.create(putThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': putThread._id
            });

          assert.equal(response.status, 200);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, successMessage, 'Success messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Good PUT:  valid board; valid, previously unreported thread', async function() {
        const successMessage = 'success';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const putThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const putThread = await thread.create(putThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': putThread._id
            });

          assert.equal(response.status, 200);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, successMessage, 'Success messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Good PUT:  valid board; valid thread; extra fields', async function() {
        const successMessage = 'success';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const putThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const putThread = await thread.create(putThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': putThread._id,
              'bob': 'is your uncle'
            });

          assert.equal(response.status, 200);
          assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
          assert.equal(response.text, successMessage, 'Success messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  non-existent board', async function() {
        const errorMessage = 'could not report thread';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const putThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const putThread = await thread.create(putThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .put(nonexistentThreadEndpoint)
            .send({
              'thread_id': putThread._id
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  invalid board name', async function() {
        const errorMessage = 'could not report thread';

        // Create a thread.
        let thread = await Threads(testingBoardName);
        const putThreadInfo = {
          'text': 'This is a test thread.',
          'delete_password': 'password'
        };

        const putThread = await thread.create(putThreadInfo);

        try {
          let response;
          response = await chai.request(server)
            .put(invalidThreadEndpoint)
            .send({
              'thread_id': putThread._id
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, non-existent thread', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': '012345678901234567890123'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, empty thread', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': ''
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, missing thread', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({});

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, invalid thread (short)', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': '01234567890123456789012'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, invalid thread (long)', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': '0123456789012345678901234'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, invalid thread (non-hexadecimal)', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'thread_id': '01234567890123456789012z'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      test('Bad PUT:  valid board, invalid fields', async function() {
        const errorMessage = 'could not report thread';

        try {
          let response;
          response = await chai.request(server)
            .put(testingThreadEndpoint)
            .send({
              'bob': 'is your uncle',
              'alice': 'is your aunt'
            });

          assert.equal(response.status, 400);
          assert.match(response.get('content-type'), /application\/json/, 'Content type should be application/json.');
          assert.equal(response.body.error, errorMessage, 'Error messages should be equal.');
        } catch (error) {
          console.log(error);
          throw error;
        }
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
