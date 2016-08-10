var express = require('express')
  , methodOverride = require('method-override')
  , bodyParser = require('body-parser')
  , logger = require('morgan')
  , favicon = require('serve-favicon')
  , path = require('path')
  , nunjucks = require('nunjucks')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , routes = require('./routes')
  ;

var app = express();
var redirect_base = 'http://frictionlessdata.io'

//CORS middleware
var CORSSupport = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
// app.set('view engine', 'html');
// app.engine('html', require('hbs').__express);
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(CORSSupport);
app.use(express.static(path.join(__dirname, 'public')));

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.express(app);

env.addFilter('truncateHomepage', function (str) {
  return str.replace(/^https?:\/\//, '');
});

// middleware to add trailing slash
app.use(function(req, res, next) {
  if(req.url.substr(-1) === '/' && req.url.length > 1) {
    res.redirect(301, req.url.slice(0, req.url.length-1));
  }
  else {
    next();
  }
});

app.get('/', function(req, res) {
  res.redirect(redirect_base + '');
});
app.get('/contact', function(req, res) {
  res.redirect(redirect_base + '/get-involved/#contact');
});
app.get('/about/contribute', function(req, res) {
  res.redirect('/contribute');
});
app.get('/contribute', function(req, res) {
  res.redirect(redirect_base + '/get-involved/');
});
app.get('/publish', redirect('/doc/publish'));
app.get('/roadmap', function(req, res) {
  res.redirect(redirect_base + '/roadmap/');
});
app.get('/roadmap/core-datasets', function(req, res) {
  res.render('core-datasets.html', {title: 'Core Datasets'})
});
app.get('/vision', function(req, res) {
  res.redirect(redirect_base + '/about/');
});
// Standards and patterns
app.get('/standards', function(req, res) {
  res.redirect(redirect_base + '/data-packages/');
});
app.get('/standards/data-package', function(req, res) {
  res.redirect(redirect_base + '/data-packages/');
});
app.get('/standards/simple-data-format', function(req, res) {
  res.redirect(redirect_base + '/guides/tabular-data-package/');
});
app.get('/standards/csv', function(req, res) {
  res.redirect(redirect_base + '/guides/csv/');
});
// Docs (patterns, standards etc)
app.get('/doc/core-data-curators', function(req, res) {
  routes.renderMarkdown('doc/core-data-curators.md', 'A Frictionless Data Ecosystem', res);
});
app.get('/doc', function(req, res) {
  res.redirect(redirect_base + '/guides/');
});
app.get('/doc/:page', function(req, res) {
  res.redirect(redirect_base + '/guides/');
});
// Tools
app.get('/tools', function(req, res) {
  res.redirect(redirect_base + '/tools/');
});

app.get('/tools/create', redirect('http://datapackagist.okfnlabs.org/'));
app.get('/tools/validate.json', routes.toolsDpValidateJSON);
app.get('/tools/validate', routes.toolsDpValidate);
app.get('/tools/view', routes.toolsDpView);
app.get('/tools/dataproxy', routes.toolsDataProxy);
// Data
app.get('/data', routes.data);
app.get('/data.json', routes.dataJson);
app.get('/data/search', routes.dataSearch);
// backwards compatibility
app.get('/data/:name/datapackage.json', function(req, res) {
  res.redirect('/data/core/' + req.params.name + '/datapackage.json');
});

// more data stuff
app.get('/data/:owner/:id/datapackage.json', routes.dataPackageShowJSON);
// data "API"
app.get('/data/:owner/:id/r/:name', routes.dataShow);
app.get('/data/:owner/:id', routes.dataPackageShow);
app.get('/data/:owner', routes.communityUser);

// Admin
app.get('/admin/reload', routes.adminReload);

// OLD / OBSOLETE
// Community redirect
app.get('/community/:username/:repo', function(req, res) {
  // hard-coded redirects
  var repo = req.params.repo;
  var changes = {
    'publicbodies': 'public-bodies',
    'dataset-gla': 'os-gb-local-gla'
  };
  if (repo in changes) {
    repo = changes[repo];
  }
  var url = '/data/' + req.params.username + '/' + repo;
  res.redirect(url);
});

function redirect(url) {
  return function(req, res) {
    res.redirect(url);
  }
}

routes.bootApp(function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
  app.listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
  });
});

exports.app = app;

