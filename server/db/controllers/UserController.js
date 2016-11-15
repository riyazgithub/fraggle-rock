const userModel = require('./../models/UserModel');

module.exports = {
  insertUser(user) {
    userModel.build({ username: user.userName, email: user.email, token: user.token })
    .save();
  },
  searchUserByUsername(username) {
    return userModel.find({ where: { username } });
  },
  searchUserById(id) {
    return userModel.find({ where: { id } });
  },
  clear() {
    userModel.destroy({
      where: {
      },
    });
  },
};
