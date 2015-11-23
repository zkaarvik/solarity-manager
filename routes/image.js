var express = require('express');
var router = express.Router();

var request = require('request');
var gm = require('gm');
var ByteBuffer = require('bytebuffer');
var PNG = require('pngjs').PNG;

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

    var imgWidth = 480;
    var imgHeight = 800;

    function createImage(error, response, body) {
        if (!error && response.statusCode == 200) {
            var aRoutes = JSON.parse(body);
            //res.send(aRoutes);

            //Draw title
            var image = gm(imgWidth, imgHeight, '#FFFFFF')
                .font('tahoma-bold', 78)
                .drawText(10, 78, 'Stop ' + sDeviceID);

            //Draw routes
            var sRouteNumber, sRouteName, sTimes, i, j;
            var iVerticalLength = 150;
            for(i = 0; i < aRoutes.length; i++) {
                sRouteNumber = aRoutes[i].RouteNo;
                sRouteName = aRoutes[i].RouteName + " " + aRoutes[i].Direction.substring(0,1);

                //Draw route number and name
                image.font('tahoma', 30);
                image.drawText(10, iVerticalLength, sRouteNumber + ' - ' + sRouteName);

                //Draw next bus times
                iVerticalLength += 35;
                image.font('tahoma', 25);
                sTimes = "";
                for(j = 0; j < aRoutes[i].Schedules.length; j++) {
                    sTimes += aRoutes[i].Schedules[j].ExpectedLeaveTime.split(' ')[0] + ", ";
                }
                sTimes = sTimes.substring(0, sTimes.length - 2); //Trim trailing ", "
                image.drawText(10, iVerticalLength, sTimes);

                iVerticalLength += 60;
            }

            image.toBuffer('PNG',function (err, buffer) {
                if (err) console.log(err);

                new PNG({ filterType:4 }).parse( buffer, function(error, data) {
                    //console.log(error, data);
                    // res.send(data.data);
                    // res.writeHead(200, {
                    //     'Content-Type': 'application/octet-stream',
                    //     'Content-Length': data.data.length
                    // });
                    // res.end(new Buffer(data.data, 'binary'));

                    convertImage(data.data);
                });
            })

            // res.set('Content-Type', 'image/png');
            // image.stream('png').pipe(res);
        } else {
            res.send('Error requesting translink API');
        }
    };

    //Convert a gdImage to EPD format
    function convertImage(pixels) {
        var epdHeader = [0x3A, 0x01, 0xE0, 0x03, 0x20, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

        //Parse image one row at a time (480 pixels)
        //For every 16 pixels (P0, P1, ... P15), assign to two intermediate bytes as follows:
        //  B0 = [P6, P14, P4, P12, P2, P10, P0, P8], B1 = [P1, P9, P3, P11, P5, P13, P7, P15]
        //Assign to 60 byte (480 pixel) output arr:
        //  [B58, ..., B2, B0, B59 ..., B3, B1]
        //Repeat until row complete

        //The pixel array is in RGBA order. Each pixel is represented by 4 elements.
        //Since image is monochrome, RGB are all the same. We can just take the red value.
        //If the red value is less than half intensity (FF/2 = 7F) then assume black. Otherwise white
        var intByte0, intByte1, outRow, i, j;
        var epdPixels = [];
        for(i=0; i<imgHeight; i++) {    //Loop through 800 rows
            outRow = [];

            for(j=0; j<imgWidth; j+=16) { //Loop through 480 pixels in 16 pixel segments
                
                //Get first intermediate byte
                intByte0 = "";
                intByte0 += pixels[(i*480 + j + 6 )*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 14)*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 4 )*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 12)*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 2 )*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 10)*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 0 )*4] < 0x7F ? "1" : "0";
                intByte0 += pixels[(i*480 + j + 8 )*4] < 0x7F ? "1" : "0";
                intByte0 = parseInt(intByte0, 2);

                //Get second intermediate byte
                intByte1 = "";
                intByte1 += pixels[(i*480 + j + 1 )*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 9 )*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 3 )*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 11)*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 5 )*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 13)*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 7 )*4] < 0x7F ? "1" : "0";
                intByte1 += pixels[(i*480 + j + 15)*4] < 0x7F ? "1" : "0";
                intByte1 = parseInt(intByte1, 2);

                outRow[29 - (j/16)] = intByte0;
                outRow[59 - (j/16)] = intByte1;
                
            }

            epdPixels = epdPixels.concat(outRow);
        }

        //Concat the header and image data and send
        var epdFile = epdHeader.concat(epdPixels);
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': epdFile.length
        });
        res.end(new Buffer(epdFile, 'binary'));
    };  

});

module.exports = router;
