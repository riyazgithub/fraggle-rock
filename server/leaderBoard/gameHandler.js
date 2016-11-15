const express = require('express');
const UserController = require('./../db/controllers/UserController');
const GameController = require('./../db/controllers/GameController');

const router = express.Router();

router.route('/addGame')
.post((req, res) => {
  // search User and then add gameMode
  if (req.body.username) {
    UserController.searchUserByUsername(req.body.username)
    .then((user) => {
      const game = { uuid: req.body.uuid, user_id: user.id };
      GameController.insertGame(game);
      res.sendStatus(201);
    })
    .catch((error) => {
      console.log('Error while adding a game ', error);
      res.sendStatus(400);
    });
  } else {
    res.status(400).send('Username is required field !!');
  }
});

router.route('/getGames')
.get((req, res) => {
  const gameDetails = [];
  GameController.getAllGames()
  .then((games) => {
    for (let i = 0; i < games.length; i++) {
      if (games[i].user_id) {
        gameDetails.push(games[i]);
      }
    }
    res.status(200).send(gameDetails);
  })
  .finally(() => {
    console.log('Game Details sent ', gameDetails);
  });
});

module.exports = router;
