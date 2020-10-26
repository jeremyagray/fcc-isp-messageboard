'use strict';

const chai = require('chai');
const assert = chai.assert;
const util = require('../utilities');

suite('Utilities Unit Tests', function()
      {
        suite('util.isEmpty()', function()
              {
                test('util.isEmpty() on empty object', function(done)
                     {
                       assert.isTrue(util.isEmpty({}), 'Empty object is empty.');
                       done();
                     });

                test('util.isEmpty() on null', function(done)
                     {
                       assert.isFalse(util.isEmpty(null), 'Null is not an object (for these purposes).');
                       done();
                     });

                test('util.isEmpty() on undefined', function(done)
                     {
                       assert.isFalse(util.isEmpty(undefined, 'undefined is not an object.'));
                       done();
                     });

                test('util.isEmpty() on empty string', function(done)
                     {
                       assert.isFalse(util.isEmpty(''), 'The empty string is not an object.');
                       done();
                     });

                test('util.isEmpty() on integer', function(done)
                     {
                       assert.isFalse(util.isEmpty(12), 'A number is not an object.');
                       done();
                     });

                test('util.isEmpty() on true', function(done)
                     {
                       assert.isFalse(util.isEmpty(true), 'Booleans are not objects.');
                       done();
                     });

                test('util.isEmpty() on false', function(done)
                     {
                       assert.isFalse(util.isEmpty(false), 'Booleans are not objects.');
                       done();
                     });

                test('util.isEmpty() on non-empty object', function(done)
                     {
                       assert.isFalse(util.isEmpty({'key': 'value'}), 'An object with properties is not empty.');
                       done();
                     });
              });

        suite('util.getValidField()', function()
              {
                test('util.getValidField() on empty object', function(done)
                     {
                       assert.isNull(util.getValidField('', {}), 'Empty object should return null.');

                       done();
                     });

                test('util.getValidField() on object with field containing an empty string', function(done)
                     {
                       const json = {
                         'status': 200,
                         'msg': 'this is a message',
                         'error':  ''
                       }
                       assert.isNull(util.getValidField('error', json), 'A field with an empty string should return null.');

                       done();
                     });

                test('util.getValidField() on object with field containing null', function(done)
                     {
                       const json = {
                         'status': 200,
                         'msg': 'this is a message',
                         'error':  null
                       }
                       assert.isNull(util.getValidField('error', json), 'A field with null should return null.');

                       done();
                     });

                test('util.getValidField() on object with field containing undefined', function(done)
                     {
                       const json = {
                         'status': 200,
                         'msg': 'this is a message',
                         'error':  undefined
                       }
                       assert.isNull(util.getValidField('error', json), 'A field with undefined should return null.');

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
