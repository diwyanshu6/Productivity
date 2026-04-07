
//Pool is a connection manager for your database.

//Simple meaning:
//It manages multiple database connections so you don’t have to create a new one every time.
const {Pool}=require('pg');//pq is module and this return object contain multiple thing and from that import Pool class and make object out of that 
const pool=new Pool(
    {
        user:"diwyanshu",
        password:"patel1411@",
        host:"localhost",
        database:"todo_app",
        port:5432
    }
) 
module.exports=pool


// const { add, sub } = require("./math");
//exported keys = add, sub
// destructuring names must match
//const { add: sum } = require("./math");change name you can ddo this also 