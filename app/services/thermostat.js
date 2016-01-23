var netatmo = require('netatmo');
var netatmoConfig = require('config').get('Netatmo');

module.exports = {
  _api: null,

  getApi() {
    if (this._api != null) {
      return this._api;
    }

    var auth = {
      client_id: netatmoConfig.client_id,
      client_secret: netatmoConfig.client_secret,
      username: netatmoConfig.username,
      password: netatmoConfig.password,
    };

    this._api = new netatmo(auth);
    this._api.on("error", error => {
      console.error('Netatmo threw an error: ', error);
    });
    this._api.on("warning", error => {
      console.log('Netatmo threw a warning: ', error);
    });

    return this._api;
  },

  getThermstate: function() {
    return new Promise((resolve, reject) => {
      var api = this.getApi();

      var options = {
        device_id: netatmoConfig.thermostat.device_id,
        module_id: netatmoConfig.thermostat.module_id,
      };

      api.getThermstate(options, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  getThermostatsData: function() {
    return new Promise((resolve, reject) => {
      var api = this.getApi();

      var options = {
        device_id: netatmoConfig.thermostat.device_id,
      };

      api.getThermostatsData(options, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result[0].modules[0]);
      });
    });
  },

  setThermostatPoint: function(mode, endTime, temp) {
    return new Promise((resolve, reject) => {
      var api = this.getApi();

      var options = {
        device_id: netatmoConfig.thermostat.device_id,
        module_id: netatmoConfig.thermostat.module_id,
        setpoint_mode: mode,
        setpoint_endtime: endTime,
        setpoint_temp: temp
      };

      api.setThermpoint(options, (err, status) => {
        if (err) {
          return reject(err);
        }
        resolve(status);
      });
    });
  }
};