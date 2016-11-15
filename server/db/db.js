const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost/game');

module.exports = db;
