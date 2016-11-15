const db = require('../db');
const Sequelize = require('sequelize');
const userModel = require('./UserModel')

const Game = db.define('Game', {
  uuid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
});
Game.belongsTo(userModel, { foreignKey: 'user_id' });
Game.sync();
module.exports = Game;
