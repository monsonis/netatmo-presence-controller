var thermostat = require('../services/thermostat');
var presence = require('../services/presenceArp');

const PERIOD = 60 * 1000;

module.exports = {

  lastChangedMode: undefined,
  interval: undefined,

  start: function() {
    var ref = this;
    this.interval = setInterval(function() {

      var getUsersAtHomePromise = presence.getUsersAtHome();
      var thermStatePromise = thermostat.getThermostatsData();

      Promise.all([ getUsersAtHomePromise, thermStatePromise ]).then(values => {
        var usersAtHome = values[0];
        var peopleAtHome = usersAtHome.length > 0;;
        var thermState = values[1];

        var currentMode = thermState.setpoint.setpoint_mode;
        var suggestedMode = ref.getSuggestedMode(peopleAtHome, thermState.setpoint.setpoint_mode);

        if (ref.lastChangedMode === undefined || currentMode == suggestedMode) {
          ref.lastChangedMode = currentMode;
        }

        console.log(new Date().toISOString(), 'People', usersAtHome, 'current mode [', currentMode, '] suggested [', suggestedMode, '] last [', ref.lastChangedMode, '] temp', thermState.measured.temperature);

        if (!ref.userHasChangedMode(currentMode) && suggestedMode && suggestedMode != currentMode) {
          ref.setThermPointMode(suggestedMode);
        }
      }).catch(error => {
        console.log(error);
      });
    }, PERIOD);
  },

  stop: function() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
  },

  setThermPointMode: function(mode, endTime, temp) {
    thermostat.setThermostatPoint(mode, endTime, temp).then(status => {
      console.log('Changed mode to ', mode);
      this.lastChangedMode = mode;
    }).catch(err => {
      console.log(err);
    });
  },

  userHasChangedMode: function(currentMode) {
    return currentMode !== this.lastChangedMode;
  },

  getSuggestedMode: function(peopleAtHome, currentMode) {
    if (currentMode != 'program' && currentMode != 'away') {
      return null;
    }
    return peopleAtHome ? 'program' : 'away';
  }

};