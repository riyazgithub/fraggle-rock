const express = require('express');
const UserController = require('./../db/controllers/UserController');
const GameController = require('./../db/controllers/GameController');

const router = express.Router();

router.route('/addUser')
.post((req, res) => {
  UserController.insertUser(req.body);
  res.sendStatus(201);
});

router.route('/getUser/:name')
.get((req, res) => {
  UserController.searchUser(req.params.name)
  .then((user) => {
    res.status(200).send(user);
  });
});

router.route('/addGame')
.post((req, res) => {
  // search User and then add gameMode
  //TODO: Rewrite this to add promises
  const user = UserController.searchUserByUsername(req.body.username);
  if (user) {
    const game = { uuid: req.body.uuid, user_id: user.id };
    GameController.insertGame(game);
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

router.route('/getGames')
.get((req, res) => {
  const gameDetails = [];
  GameController.getAllGames()
  .then((games) => {
    games.forEach((game) => {
      const tmpObj = game;
      if (game.user_id) {
        UserController.searchUserById(game.user_id)
        .then((user) => {
          tmpObj.username = user.username;
          console.log('Tmp obj ', tmpObj.username, user.username);
          gameDetails.push(tmpObj);
          res.status(200).send(gameDetails);
        })
        .catch((error) => {
          console.log('Get Games Error ', error);
          res.sendStatus(400);
        });
      }
    });
  });
});
module.exports.router = router;
