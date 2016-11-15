const db = require('../db');
const Sequelize = require('sequelize');
const userModel = require('./UserModel')

const Game = db.define('Game', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
});
Game.belongsTo(userModel, { foreignKey: 'user_id' });
Game.sync();
module.exports = Game;
