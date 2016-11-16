const express = require('express');
const UserController = require('./../db/controllers/UserController');
const GameController = require('./../db/controllers/GameController');
const ScoreController = require('./../db/controllers/ScoreController');

const router = express.Router();

router.route('/addScore')
.post((req, res) => {
  if (req.body.username) {
    UserController.searchUserByUsername(req.body.username)
    .then((user) => {
      if (req.body.uuid) {
        console.log('Get User ', user.id);
        GameController.searchGameByUUID(req.body.uuid)
        .then((game) => {
          console.log('Get Game ', game.id);
          ScoreController.insertScore({ score: req.body.score,
            game_id: game.id,
            user_id: user.id });
          res.sendStatus(201);
          // ScoreController.getScoreByGameIDandUserID(game.id, user.id)
          // .then((score) => {
          //   res.status(200).send(score);
          // });
        });
      } else {
        res.sendStatus(400);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

router.route('/getScores')
.get((req, res) => {
  ScoreController.getAllScores()
  .then((Scores) => {
    res.status(200).send(Scores);
  });
});

router.route('/getScoresByUserName/:name')
.get((req, res) => {
  if (req.params.name) {
    UserController.searchUserByUsername(req.params.name)
    .then((user) => {
      ScoreController.getScoresByUserID(user.id)
      .then((scores) => {
        res.status(200).send(scores);
      });
    });
  } else {
    res.sendStatus(400);
  }
});

router.route('/getScoresByGameUUID/:uuid')
.get((req, res) => {
  if (req.params.uuid) {
    GameController.searchGameByUUID(req.params.uuid)
    .then((game) => {
      ScoreController.getScoresByGameID(game.id)
      .then((scores) => {
        res.status(200).send(scores);
      });
    });
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
