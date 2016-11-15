const db = require('../db');
const Sequelize = require('sequelize');

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  facebookid: {
    type: Sequelize.STRING,
  },
  username: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
  },
  token: {
    type: Sequelize.STRING,
  },
});

User.sync();
module.exports = User;
