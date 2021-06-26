const express = require('express')
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const app = express()
const port = 80
const db = require('./database')
const ROOT = "/home/mandreev/EgoDB/";

app.use(basicAuth({
    authorizer: beginAuth,
    authorizeAsync: true,
    challenge: true,
    unauthorizedResponse: getUnauthorizedResponse,
}));

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use('/', express.static('client'));
//app.get('/users', db.getUsersList);

app.get('/logout', function (req, res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
});

app.get('/server', db.getAllData);
app.get('/server/:id', db.getAllById);
app.put('/server/:id', db.updateData);

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
