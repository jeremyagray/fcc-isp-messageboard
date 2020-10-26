'use strict';

const chai = require('chai');
const assert = chai.assert;
const util = require('../utilities');

suite('Utilities Unit Tests', () =>
      {
        suite('util.isEmpty()', function()
              {
                test('util.isEmpty() on empty object', function(done)
                     {
                       assert.isTrue(util.isEmpty({}));
                       done();
                     });

                test('util.isEmpty() on non-empty object', function(done)
                     {
                       assert.isFalse(util.isEmpty({'key': 'value'}));
                       done();
                     });
              });

        suite('util.getValidField()', function()
              {
                test('util.getValidField() on empty object', function(done)
                     {
                       assert.isNull(util.getValidField('', {}));
                       done();
                     });

                test('util.getValidField() on object with fields', function(done)
                     {
                       const json = {
                         'status': 200,
                         'msg': 'this is a message',
                         'error':  'this is an error'
                       }
                       assert.equal(util.getValidField('status', json), 200);
                       assert.equal(util.getValidField('msg', json), 'this is a message');
                       assert.equal(util.getValidField('error', json), 'this is an error');
                       assert.isNull(util.getValidField('title', json));
                       done();
                     });
              });

        suite('util.isValidId()', function()
              {
                test('util.isValidId(), invalid id, null', function(done)
                     {
                       assert.isFalse(util.isValidId(null));
                       done();
                     });

                test('util.isValidId(), invalid id, undefined', function(done)
                     {
                       assert.isFalse(util.isValidId(undefined));
                       done();
                     });

                test('util.isValidId(), invalid id, empty string', function(done)
                     {
                       assert.isFalse(util.isValidId(''));
                       done();
                     });

                test('util.isValidId(), invalid id, too short', function(done)
                     {
                       assert.isFalse(util.isValidId('notvalidid'));
                       done();
                     });

                test('util.isValidId(), invalid id, too long', function(done)
                     {
                       assert.isFalse(util.isValidId('notvalididnotvalididnotvalidid'));
                       done();
                     });

                test('util.isValidId(), invalid id, just right', function(done)
                     {
                       assert.isFalse(util.isValidId('notvalididnotvalididnotv'));
                       done();
                     });

                test('util.isValidId() on valid id', function(done)
                     {
                       assert.isTrue(util.isValidId('5f821b527ed9c0024ef7e828'));
                       done();
                     });
              });
      });
