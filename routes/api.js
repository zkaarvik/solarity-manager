var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.send('Test API Response');
});

module.exports = router;