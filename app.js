var express = require('express')
var app = express();

var api = require('./routes/api');

/*
 *	API Requests
 */
app.use('/api', api);

/*
 *	Public directory contains static content
 */
app.use(express.static('public'));

/*
 *	Initialize server
 */
var server = app.listen(3000, function() {
	var sHost = server.address().address;
	var iPort = server.address().port;

	console.log('App listening at http://%s:%s', sHost, iPort);
});