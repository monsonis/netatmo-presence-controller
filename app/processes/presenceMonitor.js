var thermostat = require('../services/thermostat');
var presence = require('../services/presenceArp');
var scheduler = require('../services/scheduler');

const DEFAULT_INTERVAL = 60 * 1000;

module.exports = {

  timer: undefined,

  start: function(interval) {
    var execInterval = interval || DEFAULT_INTERVAL;
    this.timer = setInterval(() =>  {
      this.loop();
    }, execInterval);
  },

  stop: function() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
    }
  },

  loop: function() {
    var getUsersAtHomePromise = presence.getUsersAtHome();
    var thermStatePromise = thermostat.getThermostatsData();

    Promise.all([ getUsersAtHomePromise, thermStatePromise ]).then(values => {
      var thermState = values[1];
      var usersAtHome = values[0];
      var currentMode = thermState.setpoint.setpoint_mode;

      var newMode = scheduler.getNewMode(usersAtHome, currentMode);
      if (newMode) {
        thermostat.setThermostatPoint(newMode).then(status => {
          console.log('People', usersAtHome, 'current mode [', currentMode, '] new mode [', newMode, '] temp', thermState.measured.temperature);
          scheduler.setNewMode(newMode);
        }).catch(err => {
          console.error(err);
        });
      }
    }).catch(error => {
      console.error(error);
    });
  }

};