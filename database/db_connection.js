const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "db-p4ssW0rd!",
  database: "jdbc:mysql://localhost:3306/imovix",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Conexão à base de dados estabelecida!");
});

module.exports = db;