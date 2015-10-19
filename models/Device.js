var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
    device_id: { type: String, unique: true, required: true},
    stop: Number,
    last_request: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);