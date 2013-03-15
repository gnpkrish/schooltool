/**
 * Module dependencies.
 */

var express = require('express'),
  mongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  path = require('path'),
  helpers = require('view-helpers');

module.exports = function(app, config, passport) {
  app.configure(function() {
    app.set('showStackError', true);
    // dynamic helpers
    app.use(helpers(config.app.name));

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({
      secret: 'noobjs',
      store: new mongoStore({
        url: config.db,
        collection: 'sessions'
      })
    }));

    //less middlware
    app.use(require('less-middleware')({
      src: 'public'
    }));
    // should be placed before express.static
    app.use(express.compress({
      filter: function(req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
      },
      level: 9
    }));
    app.use(express.static('public'));

    // connect flash for flash messages
    app.use(flash());

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.favicon());

    // routes should be at the last
    app.use(app.router);
    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next) {
      // treat as 404
      if (~err.message.indexOf('not found')) return next();

      // log it
      console.error(err.stack);

      // error page
      res.status(500).render('500', {
        error: err.stack
      });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next) {
      res.status(404).render('404', {
        url: req.originalUrl
      });
    });
  });
};