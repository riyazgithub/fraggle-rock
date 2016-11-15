const scoreModel = require('./../models/ScoreModel');

module.exports = {
  insertScore() {
    scoreModel.build({ score: 11, user_id: 1, game_id: 'qwer-1234-asdf' })
    .save();
  },
  clear() {
    scoreModel.destroy({
      where: {
      },
    });
  },
};
