const scoreModel = require('./../models/ScoreModel');

/*
{"username":"riyaz","uuid":"123-qwe-asd","score":22}
*/
module.exports = {
  insertScore(scoreObj) {
    scoreModel.build({ score: scoreObj.score,
      user_id: scoreObj.user_id,
      game_id: scoreObj.game_id })
    .save();
  },
  getScoreByGameIDandUserID(gameid, userid) {
    return scoreModel.find({ where: { game_id: gameid,
      user_id: userid } });
  },
  getScoresByGameID(gameid) {
    return scoreModel.find({ where: { game_id: gameid } });
  },
  getScoresByUserID(userid) {
    return scoreModel.find({ where: { user_id: userid } });
  },
  getAllScores() {
    return scoreModel.findAll({ where: { } });
  },
  clear() {
    scoreModel.destroy({
      where: {
      },
    });
  },
};
