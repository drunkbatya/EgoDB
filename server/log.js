const morganBase = require('morgan');
const rfs = require("rotating-file-stream"); // for log rotation
const logDir = "/var/log/EgoDB/";
const winston = require('winston');

const accessLogStream = rfs.createStream("access.log", {
    interval: "1d",
    compress: "gzip",
    path: logDir
});

const accessMorgan = morganBase('combined', { 
    stream: accessLogStream,
    skip: function (req, res) {
        if (req.url == '/check') {
            return true;
        } else {
            return false;
        }
    }
});

module.exports = {
    accessMorgan
}
