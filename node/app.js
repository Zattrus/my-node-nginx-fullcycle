const express = require('express');
const mysql = require('mysql2/promise'); 
const app = express();
const port = 3000; 


const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'nodedb'
};

async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexão com o MySQL estabelecida com sucesso!');
    return connection;
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error.message);
    setTimeout(createConnection, 5000);
    throw error; 
  }
}

app.get('/', async (req, res) => {
  let connection;
  try {
    connection = await createConnection();

    
    const nameToInsert = "Full Cycle"; 
    await connection.execute('INSERT INTO people (name) VALUES (?)', [nameToInsert]);
    console.log(`Nome "${nameToInsert}" adicionado ao banco de dados.`);

    const [rows] = await connection.execute('SELECT name FROM people');
    const peopleNames = rows.map(row => row.name);

    let htmlResponse = '<h1>Full Cycle Rocks!</h1>';
    htmlResponse += '<ul>';
    peopleNames.forEach(name => {
      htmlResponse += `<li>${name}</li>`;
    });
    htmlResponse += '</ul>';

    res.send(htmlResponse);

  } catch (error) {
    console.error('Erro na requisição:', error.message);
    res.status(500).send('Erro interno do servidor ao processar a requisição.');
  } finally {
    if (connection) {
      connection.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Aplicação Node.js rodando em http://localhost:${port}`);
  console.log('Aguardando requisições do Nginx...');
});