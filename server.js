'use strict';

// Load the environment variables.
require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Routing.
const apiRoutes = require('./routes/api.js');

// FCC testing.
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

// Express app.
const app = express();

async function start()
{
  // Configure mongoose.
  const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  };

  try
  {
    await mongoose.connect(process.env.MONGO_URI, MONGOOSE_OPTIONS);

    // Helmet middleware.
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "localhost", "*.jquery.com", "'unsafe-inline'"],
          scriptSrcElem: ["'self'", "localhost", "*.jquery.com", "'unsafe-inline'"],
          styleSrc: ["'self'", "localhost", "'unsafe-inline'"]
        }},
      referrerPolicy: {
        policy: "same-origin"
      },
      frameguard: {
        action: "sameorigin"
      }}));
    
    // FCC testing.
    app.use(cors({origin: '*'}));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.set('trust proxy', true);

    // Set static directory.
    app.use('/public', express.static(process.cwd() + '/public'));

    // Set view directory and view engine.
    app.set('views', process.cwd() + '/views');
    app.set('view engine', 'pug');

    // Serve static index.
    app.route('/')
      .get(function(request, response)
           {
             return response.sendFile(process.cwd() + '/views/index.html');
           });

    // Sample front-end.
    app.route('/b/:board/')
      .get((request, response) =>
           {
             response.sendFile(process.cwd() + '/views/board.html');
           });
    app.route('/b/:board/:thread')
      .get((request, response) =>
           {
             response.sendFile(process.cwd() + '/views/thread.html');
           });

    // FCC testing.
    fccTestingRoutes(app);

    // API routes.
    apiRoutes(app);  
    
    // 404 middleware.
    app.use((request, response) =>
            {
              // return response.status(404)
              //   .type('text')
              //   .send('Not Found');
              return response
                .status(404)
                .render('404');
            });

    // Run server and/or tests.
    const port = process.env.PORT || 3000;
    const name = 'fcc-isp-messageboard';
    const version = '0.0.1';

    app.listen(port, function ()
               {
                 console.log(`${name}@${version} listening on port ${port}...`);
                 if (process.env.NODE_ENV ==='test')
                 {
                   console.log(`${name}@${version} running unit and functional tests...`);
                   setTimeout(function ()
                              {
                                try
                                {
                                  runner.run();
                                }
                                catch (error)
                                {
                                  console.log(`${name}@${version}:  some tests failed:`);
                                  console.error(error);
                                }
                              }, 1500);
                 }
               });

    // Export app for testing.
    module.exports = app;
  }
  catch (error)
  {
    console.error(error);
  }
}

start();
