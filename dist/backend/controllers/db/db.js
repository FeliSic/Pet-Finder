"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar las variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
console.log('SEQUELIZE_URL:', process.env.SEQUELIZE_URL);
const DATABASE_URL = process.env.SEQUELIZE_URL;
if (!DATABASE_URL) {
    throw new Error('SEQUELIZE_URL no está definida en las variables de entorno');
}
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(DATABASE_URL, {
    dialect: 'postgres',
});
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa a la base de datos');
    }
    catch (error) {
        console.error('No se pudo conectar:', error);
    }
}
testConnection();
exports.default = sequelize;
