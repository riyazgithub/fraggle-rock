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
        GameController.searchGameByUUIDandUserID(req.body.uuid, user.id)
        .then((game) => {
          console.log('Gameid and user id ', game.id, user.id);
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

module.exports = router;
