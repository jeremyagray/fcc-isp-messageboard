const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;

const server = require('../server.js');

// Models.
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
const testingReplyEndpoint = '/api/replies/testing';
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

    suite('GET /api/threads/:board', function() {
      suite('Valid GET requests', async function() {
        test('valid board', async function() {
          try {
            // Construct the response from the DB.
            const threads = await Threads(testingBoardName).find({}).sort({bumped_on: 'desc'}).limit(10).exec();

            let dbResponse = [];
            for (let i = 0; i < threads.length; i++) {
              let thread = {};

              let replies = await replyController
                  .getReplies(testingBoardName, threads[i]._id);

              thread = {
                '_id': threads[i]._id,
                'created_on': threads[i].created_on,
                'text': threads[i].text,
                'replycount': replies.length,
                'replies': replies.reverse().slice(0, 3).map((item) => {
                  return {
                    '_id': item._id,
                    'created_on': item.created_on,
                    'text': item.text
                  };
                })
              };

              dbResponse.push(thread);
            }

            const response = await chai.request(server)
                  .get(testingThreadEndpoint);

            assert.equal(response.status, 200);
            assert.match(response.get('content-type'),
                         /application\/json/,
                         'Content type should be application/json.');
            assert.equal(dbResponse.length,
                         response.body.length,
                         'Number of threads should equal.');

            // Loop over the threads and replies to check for equality.
            for (let i = 0; i < dbResponse.length; i++) {
              assert.equal(dbResponse[i]._id,
                           response.body[i]._id,
                           'Thread ids should equal.');

              let dbThreadDate = new Date(dbResponse[i].created_on);
              let getThreadDate = new Date(response.body[i].created_on);

              assert.equal(dbThreadDate.getTime(),
                           getThreadDate.getTime(),
                           'Dates should equal.');

              assert.equal(dbResponse[i].text,
                           response.body[i].text,
                           'Thread texts should equal.');

              assert.equal(dbResponse[i].replycount,
                           response.body[i].replycount,
                           'Thread replycounts should equal.');

              assert.equal(dbResponse[i].replies.length,
                           response.body[i].replies.length,
                           'Number of replies should equal.');

              for (let j = 0; j < dbResponse[i].replies.length; j++) {
                assert.equal(dbResponse[i].replies[j]._id,
                             response.body[i].replies[j]._id,
                             'Reply ids should equal.');

                let dbReplyDate = new Date(dbResponse[i].replies[j].created_on);
                let getReplyDate = new Date(response.body[i].replies[j].created_on);
                assert.equal(dbReplyDate.getTime(),
                             getReplyDate.getTime(),
                             'Dates should equal.');

                assert.equal(dbResponse[i].replies[j].text,
                             response.body[i].replies[j].text,
                             'Repliy texts should equal.');
              }
            }
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      });

      suite('Invalid GET requests', async function() {
        test('non-existent board', async function() {
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

        test('invalid board name', async function() {
          let response;

          try {
            response = await chai.request(server)
              .get(invalidThreadEndpoint);

            assert.equal(response.status, 400);
            assert.isObject(response.body);
            assert.equal(response.body.error, 'invalid request', 'Error messages should match.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
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
              'thread_id': deleteThread._id,
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
              'thread_id': deleteThread._id,
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
              'thread_id': deleteThread._id,
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

    suite('PUT /api/threads/:board', function() {
      suite('Valid PUT requests', function() {
        test('previously reported thread', async function() {
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
            let response = await chai.request(server)
                .put(testingThreadEndpoint)
                .send({
                  'thread_id': putThread._id
                });

            assert.equal(response.status, 200);
            assert.match(response.get('content-type'),
                         /text\/html/,
                         'Content type should be text/html.');
            assert.equal(response.text,
                         successMessage,
                         'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });

        test('previously unreported thread', async function() {
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
            assert.match(response.get('content-type'),
                         /text\/html/,
                         'Content type should be text/html.');
            assert.equal(response.text,
                         successMessage,
                         'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });

        test('extra fields', async function() {
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
            assert.match(response.get('content-type'),
                         /text\/html/,
                         'Content type should be text/html.');
            assert.equal(response.text,
                         successMessage,
                         'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      });

      suite('Invalid PUT requests', function() {
        suite('validation tests', function() {
          test('valid board, invalid thread ids', async function() {
            const errorMessage = 'invalid request';
            const invalidThreads = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              for (let i = 0; i < invalidThreads.length; i++) {
                let response = await chai.request(server)
                    .put(testingThreadEndpoint)
                    .send({
                      'thread_id': invalidThreads[i]
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid boards, valid thread id', async function() {
            const errorMessage = 'invalid request';
            const invalidBoards = [
              3.14,
              'bob-is-your-uncle',
              '##hackme',
              '~!@#@#'
            ];

            try {
              for (let i = 0; i < invalidBoards.length; i++) {
                let response = await chai.request(server)
                    .put(testingThreadEndpoint)
                    .send({
                      'thread_id': invalidBoards[i]
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('valid board, missing thread', async function() {
            const errorMessage = 'invalid request';

            try {
              let response = await chai.request(server)
                  .put(testingThreadEndpoint)
                  .send({});

              assert.equal(response.status, 400);
              assert.match(response.get('content-type'),
                           /application\/json/,
                           'Content type should be application/json.');
              assert.equal(response.body.error,
                           errorMessage,
                           'Error messages should be equal.');
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('valid board, invalid fields', async function() {
            const errorMessage = 'invalid request';

            try {
              let response;
              response = await chai.request(server)
                .put(testingThreadEndpoint)
                .send({
                  'bob': 'is your uncle',
                  'alice': 'is your aunt'
                });

              assert.equal(response.status, 400);
              assert.match(response.get('content-type'),
                           /application\/json/,
                           'Content type should be application/json.');
              assert.equal(response.body.error,
                           errorMessage,
                           'Error messages should be equal.');
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });

        suite('malformed requests', function() {
          test('missing board name, valid thread', async function() {
            // Create a thread.
            let thread = await Threads(testingBoardName);
            const putThreadInfo = {
              'text': 'This is a test thread.',
              'delete_password': 'password'
            };

            const putThread = await thread.create(putThreadInfo);

            try {
              let response = await chai.request(server)
                  .put('/api/threads')
                  .send({
                    'thread_id': putThread._id
                  });

              assert.equal(response.status, 404);
              assert.match(response.get('content-type'),
                           /text\/html/,
                           'Content type should be text/html.');
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('non-existent board, valid thread', async function() {
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
                .put('/api/threads/notreal')
                .send({
                  'thread_id': putThread._id
                });

              assert.equal(response.status, 400);
              assert.match(response.get('content-type'),
                           /application\/json/,
                           'Content type should be application/json.');
              assert.equal(response.body.error,
                           errorMessage,
                           'Error messages should be equal.');
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('valid board, non-existent thread', async function() {
            const errorMessage = 'could not report thread';

            try {
              let response;
              response = await chai.request(server)
                .put(testingThreadEndpoint)
                .send({
                  'thread_id': '012345678901234567890123'
                });

              assert.equal(response.status, 400);
              assert.match(response.get('content-type'),
                           /application\/json/,
                           'Content type should be application/json.');
              assert.equal(response.body.error,
                           errorMessage,
                           'Error messages should be equal.');
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });
      });
    });
  });

  // POST /api/replies/:board request
  //
  // {
  //   'text': string,
  //   'delete_password': string,
  //   'thread_id': MongoId
  // }
  //
  // POST /api/replies/:board response
  //
  // redirect /b/:board/:thread_id

  suite('/api/replies/:board', function() {
    suite('POST', function() {
      suite('valid POST requests', function() {
        test('all fields valid', async function() {
          try {
            // Create a thread.
            let threadModel = await Threads(testingBoardName);
            const threadInfo = {
              'text': 'This is a test thread.',
              'delete_password': 'password'
            };

            const thread = await threadModel.create(threadInfo);

            // POST a reply.
            let now = new Date();
            let response = await chai.request(server)
              .post(testingReplyEndpoint)
              .send({
                'text': `This is a test reply (${now.getTime()}).`,
                'delete_password': 'password',
                'thread_id': thread._id
              });

            // Find the reply.
            let replyModel = await Replies(testingBoardName);
            const reply = await replyModel.findOne({
              'text': `This is a test reply (${now.getTime()}).`
            }).exec();

            // Check the response.
            assert.equal(response.status, 200);
            assert.property(response, 'redirects');
            assert.include(response.redirects[0],
                         `\/b\/testing\/${thread._id}`,
                         'Reply actions should redirect to the thread.');

            // Check the reply.
            assert.equal(thread._id.toString(),
                         reply.thread_id.toString(),
                         'Thread IDs should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      });

      suite('invalid POST requests', function() {
        suite('field validation tests', function() {
          test('invalid thread ids', async function() {
            const errorMessage = 'invalid request';
            const invalidThreads = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              for (let i = 0; i < invalidThreads.length; i++) {
                // POST a reply.
                let now = new Date();
                let response = await chai.request(server)
                    .post(testingReplyEndpoint)
                    .send({
                      'text': `This is a test reply (${now.getTime()}).`,
                      'delete_password': 'password',
                      'thread_id': invalidThreads[i]
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid passwords', async function() {
            const errorMessage = 'invalid request';
            const invalidPasswords = [
              null,
              undefined,
              [],
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              for (let i = 0; i < invalidPasswords.length; i++) {
                // POST a reply.
                let now = new Date();
                let response = await chai.request(server)
                    .post(testingReplyEndpoint)
                    .send({
                      'text': `This is a test reply (${now.getTime()}).`,
                      'delete_password': invalidPasswords[i],
                      'thread_id': thread._id
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid reply text', async function() {
            const errorMessage = 'invalid request';
            const invalidTexts = [
              null,
              undefined,
              [],
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              for (let i = 0; i < invalidTexts.length; i++) {
                // POST a reply.
                let now = new Date();
                let response = await chai.request(server)
                    .post(testingReplyEndpoint)
                    .send({
                      'text': invalidTexts[i],
                      'delete_password': 'password',
                      'thread_id': thread._id
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });

        suite('malformed requests', function() {
        });
      });
    });

    // GET /api/replies/:board request
    //
    // {
    //   'thread_id': MongoId
    // }
    //
    // GET /api/replies/:board response
    //
    // {
    //   '_id': MongoId,
    //   'created_on': Date,
    //   'text': string,
    //   'replies': [
    //     {
    //       '_id': MongoId,
    //       'created_on': Date,
    //       'text': string
    //     }
    //   ]
    // }

    suite('GET /api/replies/:board', function() {
      suite('valid GET requests', function() {
      });

      suite('invalid GET requests', function() {
        suite('field validation tests', function() {
        });

        suite('malformed requests', function() {
        });
      });
    });

    // PUT /api/replies/:board request
    //
    // {
    //   'thread_id': MongoId,
    //   'reply_id': MongoId
    // }
    //
    // PUT /api/replies/:board response
    //
    // 'success', 'failure', or redirect /

    suite('PUT /api/replies/:board', function() {
      suite('valid PUT requests', function() {
        test('initial report', async function() {
          const successMessage = 'success';

          try {
            // Create a thread.
            let threadModel = await Threads(testingBoardName);
            const threadInfo = {
              'text': 'This is a test thread.',
              'delete_password': 'password'
            };

            const thread = await threadModel.create(threadInfo);

            // Create a reply.
            let replyModel = await Replies(testingBoardName);
            const replyInfo = {
              'text': 'This is a test reply.',
              'thread_id': thread._id,
              'delete_password': 'password'
            };

            const reply = await replyModel.create(replyInfo);

            let response = await chai.request(server)
              .put(testingReplyEndpoint)
              .send({
                'thread_id': thread._id,
                'reply_id': reply._id
              });

            assert.equal(response.status, 200);
            assert.match(response.get('content-type'),
                         /text\/html/,
                         'Content type should be text/html.');
            assert.equal(response.text,
                         successMessage,
                         'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });

        test('subsequent reports', async function() {
          const successMessage = 'success';

          try {
            // Create a thread.
            let threadModel = await Threads(testingBoardName);
            const threadInfo = {
              'text': 'This is a test thread.',
              'delete_password': 'password'
            };

            const thread = await threadModel.create(threadInfo);

            // Create a reply.
            let replyModel = await Replies(testingBoardName);
            const replyInfo = {
              'text': 'This is a test reply.',
              'thread_id': thread._id,
              'delete_password': 'password'
            };

            const reply = await replyModel.create(replyInfo);

            let response = await chai.request(server)
              .put(testingReplyEndpoint)
              .send({
                'thread_id': thread._id,
                'reply_id': reply._id
              });

            response = await chai.request(server)
              .put(testingReplyEndpoint)
              .send({
                'thread_id': thread._id,
                'reply_id': reply._id
              });

            assert.equal(response.status, 200);
            assert.match(response.get('content-type'),
                         /text\/html/,
                         'Content type should be text/html.');
            assert.equal(response.text,
                         successMessage,
                         'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      });

      suite('invalid PUT requests', function() {
        suite('field validation tests', function() {
          test('invalid thread ids', async function() {
            const errorMessage = 'invalid request';
            const invalidThreads = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < invalidThreads.length; i++) {
                let response = await chai.request(server)
                    .put(testingReplyEndpoint)
                    .send({
                      'thread_id': invalidThreads[i],
                      'reply_id': reply._id,
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid reply ids', async function() {
            const errorMessage = 'invalid request';
            const invalidReplies = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < invalidReplies.length; i++) {
                let response = await chai.request(server)
                    .put(testingReplyEndpoint)
                    .send({
                      'thread_id': thread._id,
                      'reply_id': invalidReplies[i],
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });
      });
    });

    // DELETE /api/replies/:board request
    //
    // {
    //   'thread_id': MongoId,
    //   'reply_id': MongoId,
    //   'delete_password': string
    // }
    //
    // DELETE /api/replies/:board response
    //
    // 'success', 'failure', 'incorrect password', or redirect /

    suite('DELETE /api/replies/:board', function() {
      suite('valid DELETE requests', function() {
        test('all fields valid', async function() {
          const successMessage = 'success';

          try {
            // Create a thread.
            let threadModel = await Threads(testingBoardName);
            const threadInfo = {
              'text': 'This is a test thread.',
              'delete_password': 'password'
            };

            const thread = await threadModel.create(threadInfo);

            // Create a reply.
            let replyModel = await Replies(testingBoardName);
            const replyInfo = {
              'text': 'This is a test reply.',
              'thread_id': thread._id,
              'delete_password': 'password'
            };

            const reply = await replyModel.create(replyInfo);

            let response = await chai.request(server)
              .delete(testingReplyEndpoint)
              .send({
                'thread_id': thread._id,
                'reply_id': reply._id,
                'delete_password': reply.delete_password
              });

            assert.equal(response.status, 200);
            assert.match(response.get('content-type'), /text\/html/, 'Content type should be text/html.');
            assert.equal(response.text, successMessage, 'Success messages should be equal.');
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
      });

      suite('invalid DELETE requests', function() {
        suite('validation tests', function() {
          test('invalid thread ids', async function() {
            const errorMessage = 'invalid request';
            const invalidThreads = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < invalidThreads.length; i++) {
                let response = await chai.request(server)
                    .delete(testingReplyEndpoint)
                    .send({
                      'thread_id': invalidThreads[i],
                      'reply_id': reply._id,
                      'delete_password': reply.delete_password
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid reply ids', async function() {
            const errorMessage = 'invalid request';
            const invalidReplies = [
              null,
              undefined,
              {},
              [],
              314,
              3.14,
              '012345',
              '012345012345012345012345012345',
              'zzzzzzzzzzzzzzzzzzzzzzzz',
              'bob-is-your-uncle',
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < invalidReplies.length; i++) {
                let response = await chai.request(server)
                    .delete(testingReplyEndpoint)
                    .send({
                      'thread_id': thread._id,
                      'reply_id': invalidReplies[i],
                      'delete_password': reply.delete_password
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });

          test('invalid passwords', async function() {
            const errorMessage = 'invalid request';
            const invalidPasswords = [
              null,
              undefined,
              [],
              ''
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < invalidPasswords.length; i++) {
                let response = await chai.request(server)
                    .delete(testingReplyEndpoint)
                    .send({
                      'thread_id': thread._id,
                      'reply_id': reply._id,
                      'delete_password': invalidPasswords[i]
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /application\/json/,
                             'Content type should be application/json.');
                assert.equal(response.body.error,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });

        suite('incorrect passwords', function() {
          test('incorrect passwords', async function() {
            const errorMessage = 'incorrect password';
            const incorrectPasswords = [
              'barley',
              'catnip',
              'orThogoNal',
              'Gannymead',
              'WhiskersTheCat'
            ];

            try {
              // Create a thread.
              let threadModel = await Threads(testingBoardName);
              const threadInfo = {
                'text': 'This is a test thread.',
                'delete_password': 'password'
              };

              const thread = await threadModel.create(threadInfo);

              // Create a reply.
              let replyModel = await Replies(testingBoardName);
              const replyInfo = {
                'text': 'This is a test reply.',
                'thread_id': thread._id,
                'delete_password': 'password'
              };

              const reply = await replyModel.create(replyInfo);

              for (let i = 0; i < incorrectPasswords.length; i++) {
                let response = await chai.request(server)
                    .delete(testingReplyEndpoint)
                    .send({
                      'thread_id': thread._id,
                      'reply_id': reply._id,
                      'delete_password': incorrectPasswords[i]
                    });

                assert.equal(response.status, 400);
                assert.match(response.get('content-type'),
                             /text\/html/,
                             'Content type should be text/html.');
                assert.equal(response.text,
                             errorMessage,
                             'Error messages should be equal.');
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
          });
        });
      });
    });
  });
});
