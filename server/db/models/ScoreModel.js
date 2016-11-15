const db = require('../db');
const Sequelize = require('sequelize');
const userModel = require('./UserModel');
const gameModel = require('./GameModel');

const Score = db.define('Score', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  score: {
    type: Sequelize.INTEGER,
  },
});

Score.belongsTo(userModel, { foreignKey: 'user_id' });
Score.belongsTo(gameModel, { foreignKey: 'game_id' });
Score.sync();

module.exports = Score;
