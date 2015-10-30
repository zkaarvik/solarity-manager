var express = require('express');
var router = express.Router();

var request = require('request');
var gm = require('gm');

/* GET /image/id */
/*
 *   Calling device id should must specified in request. From this ID find the assigned stop
 */
router.get('/:id', function(req, res, next) {
    var sDeviceID = req.params.id;

    var options = {
        url: 'http://api.translink.ca/rttiapi/v1/stops/60980/estimates?apikey=TZNijKc6vPu5HKiNc9eK&count=3&timeframe=120',
        headers: {
            'accept': 'application/JSON'
        }
    };

    //Request translink API
    /*
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                res.send(info);
            } else {
                res.send('Error requesting translink API');
            }
        });
    */


    res.set('Content-Type', 'image/png');

    gm(480, 800, '#FF0000').stream('png', function(err, stdout, stderr) {
        stdout.pipe(res)
    });

    // gm(480, 800, '#FF0000').write('/tempSolarityImg/devid_test.png', function(err) {
    //     if (!err) res.sendFile('tempSolarityImg/devid_test.png', {root: "/"});
    //     else res.send('sendImgError: ' + err);
    // });  

    // gm(200, 400, "#ddff99f3")
    //     //.drawText(10, 50, "from scratch")
    //     .write(__dirname + "\\tmp\\brandNewImg.jpg", function(err) {
    //         if(err) res.send('errd: ' + err);
    //         res.send('tested');
    //     });

});

module.exports = router;
