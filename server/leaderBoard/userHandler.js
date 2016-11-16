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

router.route('/getUserByName/:name')
.get((req, res) => {
  if (req.params.name) {
    UserController.searchUser(req.params.name)
    .then((user) => {
      res.status(200).send(user);
    });
  } else {
    res.sendStatus(400);
  }
});

router.route('/getUserByFacebookID/:facebookid')
.get((req, res) => {
  if (req.params.facebookid) {
    UserController.searchUserByFacebookid(req.params.facebookid)
    .then((user) => {
      res.status(200).send(user);
    });
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
