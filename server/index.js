const express = require('express');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const app = express();
const port = 80;
const db = require('./database');
const ROOT = "/home/mandreev/EgoDB/";
const FILES_DIR = "/opt/EgoDBFiles";
const multer = require("multer");
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, FILES_DIR);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(basicAuth({
    authorizer: beginAuth,
    authorizeAsync: true,
    challenge: true,
    unauthorizedResponse: getUnauthorizedResponse,
}));

app.use(bodyParser.json());
//app.use(morgan('combined'));

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use('/', express.static('client'));
app.use('/files', express.static(FILES_DIR));
//app.get('/users', db.getUsersList);

app.get('/logout', function (req, res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
});

app.get('/server', db.getAllData);
app.get('/server/:id', db.getAllById);
app.put('/server/:id', db.updateData);
app.delete('/server/:id', db.deleteData);
app.post('/server', db.addData);
app.post("/server/files/:id", upload.array("docs"), db.uploadFiles);

//app.get('/login', function(req, res){
//    res.sendFile(ROOT+'client/login.html');
//});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

async function beginAuth(username, password, cb) {
    var dbAns = await db.getUsersSecret();
    for (var i = 0; i<dbAns.rowCount; i++) {
        if (username == dbAns.rows[i].username) {
            if (password == dbAns.rows[i].password) {
                return cb(null, true);
            }
        }
    }
    return cb(null, false);
}
function getUnauthorizedResponse(req) {
    return req.auth
        ? ('<h1>Бля.. Надо залогиниться</h1>')
        : ('<h1>Пиздец..</h1>')
}
