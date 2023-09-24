// establishing a connection with db
// we took /promise to be able to use async await
const mysql = require('mysql2/promise');


/*
createpool is better than createconnection in case that my website gets a 
lot of requests @ the same time
*/
const pool = mysql.createPool({
    host: 'localhost',// I am using my local machine
    database: 'blog',// name of database
    user: 'root',// default value
    password: '7g#P$2w*9@QzR6s'
});

module.exports=pool;