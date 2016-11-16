const userModel = require('./../models/UserModel');

/*
{"username":"riyaz",
 "email":"insaneriyaz@gmail.com",
 "token":"thisiswhatweneed",
 "facebookid":"1223456"
}
*/

module.exports = {
  insertUser(user) {
    userModel.build({ username: user.username,
      email: user.email,
      token: user.token,
      facebookid: user.facebookid })
    .save();
  },
  getAllUsers() {
    return userModel.findAll({ where: { } });
  },
  searchUserByUsername(username) {
    return userModel.find({ where: { username } });
  },
  searchUserById(id) {
    return userModel.find({ where: { id } });
  },
  searchUserByFacebookid(facebookid) {
    return userModel.find({ where: { facebookid } });
  },
  clear() {
    userModel.destroy({
      where: {
      },
    });
  },
};
