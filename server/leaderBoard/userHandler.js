const express = require('express');
const UserController = require('./../db/controllers/UserController');

const router = express.Router();

router.route('/addUser')
.post((req, res) => {
  UserController.insertUser(req.body);
  res.sendStatus(201);
});
router.route('/getUsers')
.get((req, res) => {
  UserController.getAllUsers()
  .then((users) => {
    res.status(200).send(users);
  });
});
router.route('/getUser/:name')
.get((req, res) => {
  UserController.searchUser(req.params.name)
  .then((user) => {
    res.status(200).send(user);
  });
});

module.exports = router;
