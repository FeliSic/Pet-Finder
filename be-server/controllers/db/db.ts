import dotenv from 'dotenv';
import path from 'path';

// Cargar las variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('SEQUELIZE_URL:', process.env.SEQUELIZE_URL);
const DATABASE_URL = process.env.SEQUELIZE_URL;

if (!DATABASE_URL) {
  throw new Error('SEQUELIZE_URL no está definida en las variables de entorno');
}

import {Sequelize, DataType, Model} from "sequelize"



const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('No se pudo conectar:', error);
  }
}

testConnection();

export default sequelize;