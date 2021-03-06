const pool = require('./dbConnect.js');
const bcrypt = require('bcrypt');

const getAllData = (request, response) => {
    pool.query('SELECT * FROM data ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getAllById = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('SELECT * FROM data WHERE id = $1', [id] , (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const updateData = (request, response) => {
    const id = parseInt(request.params.id);
    const data = request.body.data;
    const files = request.body.files;
    var ans = {};
    ans.text = "Операция выполнена успешно!";
    pool.query(
        'UPDATE data SET comp_name = $1, comp_inn = $2, comp_ogrn = $3, comp_addr = $4, comp_kpp = $5, dog_number = $6, dog_date = $7, dog_state = $8, dog_comment = $9 WHERE id = $10', [data.comp_name, data.comp_inn, data.comp_ogrn, data.comp_addr, data.comp_kpp, data.dog_number, data.dog_date, data.dog_state, data.dog_comment, id], (error, results) => {
        if (error) {
            throw error
        }
        if (!files) {
            response.status(200).json(ans);
        }
    });
    pool.query('UPDATE data SET files = $1 WHERE id=$2;', [files, id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(ans);
    });
}

const deleteData = (request, response) => {
    const id = parseInt(request.params.id);
    var ans = {};
    ans.text = "Операция выполнена успешно!";
    pool.query('DELETE FROM data WHERE id = $1', [id] , (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(ans);
    })
}

const addData = (request, response) => {
    const data = request.body;
    var ans = {};
    ans.text = "Операция выполнена успешно!";
    pool.query(`
        INSERT INTO data (comp_name, comp_inn, comp_ogrn, comp_addr, comp_kpp, dog_number, dog_date, dog_state, dog_comment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [data.comp_name, data.comp_inn, data.comp_ogrn, data.comp_addr, data.comp_kpp, data.dog_number, data.dog_date, data.dog_state, data.dog_comment], (error, results) => {
        if (error) {
            throw error
        }
        ans.id = results.rows[0].id;
        response.status(200).json(ans);
    });
}

const uploadFiles = (request, response) => {
    const id = parseInt(request.params.id);
    var ans = {};
    ans.text = "Операция выполнена успешно!";
    const files = request.files;
    var arr=[];
    for (var CUR in files) {
        arr[CUR] = files[CUR].filename;
    }
    pool.query('UPDATE data SET files = files || $1 WHERE id=$2', [arr, id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(ans);
    });
};

function checkCookie(cookie) {
    return new Promise(resolve => {
        var dbResp = pool.query('SELECT COUNT(*) FROM users WHERE ilovecookie = $1', [cookie]);
        resolve(dbResp);
    });
}

function checkValidCredentials(username, password) {
    return new Promise(resolve => {
        var dbResp = pool.query('SELECT COUNT(*) FROM users WHERE username = $1 AND password = $2', [username, password]);
        resolve(dbResp);
    });
}

const getEgoUserName = (req, res) => {
    var cookie = req.cookies.egoSession;
    var ans = {};
    pool.query('SELECT fullname FROM users WHERE ilovecookie = $1', [cookie] , (error, results) => {
        if (error) {
            throw error;
        }
        ans.egouser_name = results.rows[0].fullname;
        res.status(200).json(ans);
    });
}
const logout = (req, res) => {
    var cookie = req.cookies.egoSession;
    pool.query('UPDATE users SET ilovecookie = NULL WHERE ilovecookie = $1', [cookie] , (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json("Выход выполнен успешно!");
    });
}


async function login (req, res) {
    const data = req.body;
    const cookie = req.cookies.egoSession;
    console.log(data);
    if (!data.username || !data.password) {
        res.status(403).json("Отсутствуют данные.");
        return;
    }
    var validUser = await pool.query(`
        SELECT COUNT(*)
        FROM users
        WHERE username = $1
        `, [data.username]);
    validUser = parseInt(validUser.rows[0].count);
    if (validUser) {
        // i know what this is an unsecure action,
        // but i need this tio perform a bctypt's compare action
        var userPasswordHash = await pool.query(`
            SELECT password
            FROM users
            WHERE username = $1
            `, [data.username]);
        userPasswordHash = userPasswordHash.rows[0].password;
        const match = await bcrypt.compare(data.password, userPasswordHash);
        if (match) {
            // it's specially replaces old cookie to new, cause
            // this "web-app's" idea doesn't imply manny sessions for one user
            pool.query(`
                UPDATE users
                SET ilovecookie = $1
                WHERE username = $2
                `, [cookie, data.username]);
            return res.status(200).json("Авторизация выполнена успешно!");
        }
    }
    return res.status(401).json("Введённые данные не верны!");
}

module.exports = {
    login,
    logout,
    getEgoUserName,
    checkCookie,
    checkValidCredentials,
    getAllData,
    getAllById,
    updateData,
    deleteData,
    addData,
    uploadFiles,
}
