const liveMatches = {};
const Match = require('../models/match.js');

module.exports = {
  getNewMatch: function getNewMatch() {
    let match = new Match();
    liveMatches[match.guid] = match;
    return match;
  },
  getMatch: function getMatch(matchId) {
    let sent = false;
    for (var key in liveMatches) {
      if (!sent) {
        sent = true;
        return liveMatches[key]; 
      }
    }
    // return liveMatches[matchId];
  },
  deleteMatch: function deleteMatch(matchId) {
    let match;
    let deleteKey;
    for (var key in liveMatches) {
      if (liveMatches[key].guid === matchId) {
        match = liveMatches[key];
        match.shutdown();
        deleteKey = key;
      }
    }
    delete liveMatches[deleteKey];
    debugger;
  }
};
