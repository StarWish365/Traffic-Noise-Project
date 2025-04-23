const { Pool, Client } = require("pg")

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'noise_project_new',
    password: 'a1234567',
    port: 5432
})

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'noise_project_new',
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

client.connect()

module.exports = {
    pool,
    client
};
