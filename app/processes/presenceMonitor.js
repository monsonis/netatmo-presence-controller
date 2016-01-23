var thermostat = require('../services/thermostat');
var presence = require('../services/presenceArp');
var scheduler = require('../services/scheduler');

const PERIOD = 60 * 1000;

module.exports = {

  interval: undefined,

  start: function() {
    this.interval = setInterval(() =>  {
      this.loop();
    }, PERIOD);
  },

  stop: function() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
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
        }).catch(err => {
          console.error(err);
        });
      }
    }).catch(error => {
      console.error(error);
    });
  }

};