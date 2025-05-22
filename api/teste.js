import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })
    console.log('Conectado com sucesso!')
    await connection.end()
  } catch (err) {
    console.error('Erro ao conectar:', err)
  }
}

testConnection()
