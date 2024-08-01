const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

const config = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'fullcycle',
};

app.get('/', async (req, res) => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const name = `Luiz ${suffix}`;
  await createPerson(name)
  const names = await getPeopleList();
  res.send('<h1>Full Cycle Rocks!</h1>'  + names);
});

app.listen(PORT, () => {
  console.log('STARTED AT ' + PORT);
});

function connectDatabase() {
  const connection = mysql.createConnection(config);
  return connection;
}

async function createPerson(name) {
  const connection = connectDatabase();
  const sql = `insert into people (name) values ('${name}')`;
  await new Promise(
    (resolve) => connection.query(sql, ()=>resolve())
  );
  connection.end();
}

async function getPeopleList() {
  const connection = connectDatabase()
  const sql = `select * from people`;
  const results = await new Promise(
    (resolve) => connection.query(sql, (_, result)=>resolve(result))
  );
  connection.end();

  let names = '';
  for(let person of results) {
    names += `<li>${person.name}</li>`;
  }
  return `<ul>${names}</ul>`;
}