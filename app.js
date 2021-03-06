var express     = require('express');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser')
var app         = express();

var devices     = require('./routes/devices');
var image       = require('./routes/image');

/*
 * Initialize database connection
 */
mongoose.connect('mongodb://localhost/solarityManager', function(err) {
    if(err) {
        console.log('Database connection error', err);
    } else {
        console.log('Database connection successful');
    }
});

// Parser for application/json 
app.use(bodyParser.json());

/*
 *  Routing for API Requests
 */
app.use('/api/devices', devices);
app.use('/api/image', image);

/*
 *  Public directory contains static content
 */
app.use(express.static('public'));

/*
 *  Initialize server
 */
var server = app.listen(3000, function() {
    var sHost = server.address().address;
    var iPort = server.address().port;

    console.log('App listening at http://%s:%s', sHost, iPort);
});