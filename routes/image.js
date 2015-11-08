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

    request({
        url: 'http://api.translink.ca/rttiapi/v1/stops/60980/estimates?apikey=TZNijKc6vPu5HKiNc9eK&count=3&timeframe=120',
        headers: {
            'accept': 'application/JSON'
        }
    }, createImage);

    var iWidth = 480;
    var iHeight = 800;

    function createImage(error, response, body) {
        if (!error && response.statusCode == 200) {
            var aRoutes = JSON.parse(body);
            //res.send(aRoutes);

            //Draw title
            var image = gm(iWidth, iHeight, '#FFFFFF')
                .channel('black')
                .font('impact', 96)
                .drawText(10, 96, 'Solarity');

            //Draw routes
            var sRouteNumber, sRouteName, sTimes, i, j;
            var iVerticalLength = 150;
            for(i = 0; i < aRoutes.length; i++) {
                sRouteNumber = aRoutes[i].RouteNo;
                sRouteName = aRoutes[i].RouteName;

                //Draw route number and name
                image.font('tahoma', 30);
                image.drawText(10, iVerticalLength, sRouteNumber + ' - ' + sRouteName);

                //Draw next bus times
                iVerticalLength += 35;
                image.font('tahoma', 25);
                sTimes = "";
                for(j = 0; j < aRoutes[i].Schedules.length; j++) {
                    sTimes += aRoutes[i].Schedules[j].ExpectedLeaveTime + ", ";
                }
                sTimes = sTimes.substring(0, sTimes.length - 2); //Trim trailing ", "
                image.drawText(10, iVerticalLength, sTimes);

                iVerticalLength += 60;
            }

            convertImage(image);
        } else {
            res.send('Error requesting translink API');
        }
    };

    //Convert a gdImage to EPD format
    function convertImage(image) {
        var x, y;
        var aLine;
        var aLines = [];

        //Parse the image one row at a time
        for(y=0; y<iHeight; y++) {
            aLine = [];
            for(x=0; x<iWidth; x++) {
                //aLine.push(image.imageColorAt(x, y));
            }
            aLines.push(aLine);
        }




        res.set('Content-Type', 'image/png');
        image.stream('png', function(err, stdout, stderr) {
            if(err) console.log(err);
            stdout.pipe(res);
        });
        // .write('/tempSolarityImg/' + sDeviceID + '.png', function(err) {
        //     if (err) console.log(err);
        //     //else res.send('noerr');
        // });
    };


    //res.set('Content-Type', 'image/png');
    

});

module.exports = router;
