const morganBase = require('morgan');
const rfs = require("rotating-file-stream"); // for log rotation
const logDir = "/var/log/EgoDB/";

const accessLogStream = rfs.createStream("access.log", {
    interval: "1d",
    compress: "gzip",
    path: logDir
});
const actionsLogStream = rfs.createStream("actions.log", {
    interval: "1d",
    compress: "gzip",
    path: logDir
});

const accessMorgan = morganBase('combined', { stream: accessLogStream });

module.exports = {
    accessMorgan
}
