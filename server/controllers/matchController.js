const liveMatches = {};
const Match = require('../models/match.js');

module.exports = {
  getNewMatch: function getNewMatch() {
    let match = new Match();
    liveMatches[match.guid] = match;
    return match;
  },
  getMatch: function getMatch(matchId) {
    return liveMatches[matchId];
  },
};
