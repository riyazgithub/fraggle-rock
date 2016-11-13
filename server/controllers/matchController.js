"use strict";
const liveMatches = {};
const Match = require('../models/match.js');

const deleteMatch = function deleteMatch(matchId) {
  let match;
  let deleteKey;
  let count = 0;
  for (var key in liveMatches) {
    if (liveMatches[key].guid === matchId) {
      match = liveMatches[key];
      match.shutdown();
      deleteKey = key;
    }
    count++;
  }
  delete liveMatches[deleteKey];
  count--;
  console.log(`Deleting match, there are ${count} open matches.`);
};

module.exports = {
  getNewMatch: function getNewMatch() {
    let match = new Match(deleteMatch);
    liveMatches[match.guid] = match;
    return match;
  },
  getMatch: function getMatch(matchId) { //TODO fix to find match by id
    let sent = false;
    for (var key in liveMatches) {
      if (!sent) {
        sent = true;
        return liveMatches[key];
      }
    }
  },
  deleteMatch: deleteMatch,
};

