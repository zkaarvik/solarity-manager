var express = require('express');
var router = express.Router();

var request = require('request');
var gm = require('gm');
var ByteBuffer = require('bytebuffer');
var PNG = require('png-js');

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

            //Convert image to black and white before converting to EPD
            image.monochrome();

            image.write('/tempSolarityImg/' + sDeviceID + '.png', function(err) {
                if (err) console.log(err);

                //Decode image into array of pixels. This array will be converted into EPD format
                PNG.decode('/tempSolarityImg/' + sDeviceID + '.png', convertImage);
            });
            //res.set('Content-Type', 'image/png');
            //image.stream('png').pipe(res);
        } else {
            res.send('Error requesting translink API');
        }
    };

    //Convert a gdImage to EPD format
    function convertImage(pixels) {
        //ByteBuffer size = EPD Image Size = 48,016 bytes
        var buffer = ByteBuffer.allocate(48016);

        //Write image header to buffer
        buffer.writeUint8(0x3A);
        buffer.writeUint8(0x01);
        buffer.writeUint8(0xE0);
        buffer.writeUint8(0x03);
        buffer.writeUint8(0x20);
        buffer.writeUint8(0x01);
        buffer.writeUint8(0x04);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);
        buffer.writeUint8(0x00);

        var x, y;
        var aLine;
        var aLines = [];

        //Parse the image one row at a time
        // for(y=0; y<iHeight; y++) {
        //     aLine = [];
        //     for(x=0; x<iWidth; x++) {
        //         //aLine.push(image.imageColorAt(x, y));
        //     }
        //     aLines.push(aLine);
        // }
        res.send(pixels);

        

        //buffer.flip();
        //console.log(buffer.readUint8());
    };  

});

module.exports = router;
