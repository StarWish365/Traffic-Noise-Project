const { Pool } = require("pg")

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'noise_project',
    password: 'a1234567',
    port: 5432
})

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database', err.stack)
        return
    }
    console.log(`Connected to the PostgreSQL database as id ${client.connectionParameters.database}`)
})

module.exports = pool;