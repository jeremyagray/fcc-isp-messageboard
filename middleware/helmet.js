'use strict';

const helmet = require('helmet');

exports.config = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        '\'self\''
      ],
      scriptSrc: [
        '\'self\'',
        'localhost',
        '*.cloudflare.com',
        '\'unsafe-inline\''
      ],
      scriptSrcElem: [
        '\'self\'',
        'localhost',
        '*.cloudflare.com',
        '\'unsafe-inline\''
      ],
      styleSrc: [
        '\'self\'',
        'localhost',
        '\'unsafe-inline\''
      ]
    }},
  referrerPolicy: {
    policy: 'same-origin'
  },
  frameguard: {
    action: 'sameorigin'
  }});
