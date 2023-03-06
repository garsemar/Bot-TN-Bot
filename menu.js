

const { Client } = require('pg')
const connectionData = {
    user: 'rwndjpvi',
    host: 'trumpet.db.elephantsql.com',
    database: 'rwndjpvi',
    password: 'xe7nhSHrlEA62i6n5EzzNeI5uUKUJ5Wa',
    port: 5432,  
}
const client = new Client(connectionData)
client.connect()

function menu(){
    client.query("SELECT * FROM pg_tables where schemename = 'public'")
        .then(response => {
            console.log(response.rows)
            client.end()
        })
        .catch(err => {
            client.end()
        })
    
    console.log()
}