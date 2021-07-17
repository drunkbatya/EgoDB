const express = require('express');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require("crypto");
const app = express();
const port = 80;
const db = require('./database');
const ROOT = "/home/drunkbatya/EgoDB/";
const FILES_DIR_ROOT = "/opt/EgoDBFiles";
const multer = require("multer");
const fs = require('fs');
app.use(cookieParser());
app.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!req.params.id) {
            console.log("Error while uploading file, id isn't specified");
            return;
        }
        var filesDir = FILES_DIR_ROOT+'/'+req.params.id;
        if (!fs.existsSync(filesDir)) {
            fs.mkdirSync(filesDir);
        }
        callback(null, filesDir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(function (req, res, next) {
    var cookie = req.cookies.egoSession;
    if (!cookie) {
        var cookie_value = crypto.randomBytes(21).toString('hex');
        res.cookie('egoSession', cookie_value, { httpOnly: true });
    }
    next();
});

app.post('/server/login', db.login);

app.get('/login', function(req, res){
    return res.status(200).sendFile(ROOT+'/client/login.html');
});

app.get('/favicon.ico', function(req, res){
    return res.status(200).sendFile(ROOT+'/client/favicon.ico');
});

app.use(async function (req, res, next) {
    var cookie = req.cookies.egoSession;
    dbAns = await db.checkCookie(cookie);
    dbAns = parseInt(dbAns.rows[0].count);
    if (!dbAns) {
        return res.status(401).redirect('/login');
    }
    next();
});

//app.use(morgan('combined'));

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use('/', express.static('client'));
app.use('/files', express.static(FILES_DIR_ROOT));
//app.get('/users', db.getUsersList);

app.get('/server/username/', db.getEgoUserName);
app.get('/server/:id', db.getAllById);
app.get('/server', db.getAllData);
app.put('/server/:id', db.updateData);
app.delete('/server/logout', db.logout);
app.delete('/server/:id', db.deleteData);
app.post("/server/files/:id", upload.array("docs"), db.uploadFiles);
app.post('/server', db.addData);


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

async function beginAuth(username, password, cb) {
    var dbAns = await db.checkValidCredentials(username, password);
    dbAns = parseInt(dbAns.rows[0].count);
    if (dbAns) {
        return cb(null, true);
    }
    return cb(null, false);
}
function getUnauthorizedResponse(req) {
    return req.auth
        ? ('<h1>Бля.. Надо залогиниться</h1>')
        : ('<h1>Пиздец..</h1>')
}
