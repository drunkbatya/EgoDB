const Pool = require('pg').Pool
const pool = new Pool({
    user: 'egouser',
    host: 'localhost',
    database: 'egodb',
    password: '9XbMW3flIO0B0FYr8R5y',
    port: 5432,
})

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
    const ans = request.body; // just for length
    ans[6] = id;
    pool.query(
        'UPDATE data SET comp_name = $1, comp_inn = $2, dog_number = $3, dog_date = $4, dog_state = $5, dog_comment = $6 WHERE id = $7', ans,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json("Операция выполнена успешно!");
        }
    );
}

const deleteData = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('DELETE FROM data WHERE id = $1', [id] , (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json("Операция выполнена успешно!")
    })
}

function getUsersSecret() {
    return new Promise(resolve => {
        var dbResp = pool.query('SELECT username,password FROM users');
        resolve(dbResp);
    });
}

module.exports = {
    getUsersSecret,
    getAllData,
    getAllById,
    updateData,
    deleteData,
}
