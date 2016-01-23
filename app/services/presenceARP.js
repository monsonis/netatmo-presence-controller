var config = require('config');
var userAdresses = config.get('Users');
var flood = require('../lib/flood');
var arp = require('../lib/arp');

module.exports = {

  getMacAddresses: function() {
    return new Promise((resolve, reject) => {
      
      flood.flood({});
      
      arp.table(function(err, table){
        if (err) {
          return reject(err);
        }
        resolve(table.map(arp => { return arp.mac.toUpperCase() }));
      });
    });
  },

  getUserMac: function(userName) {
    return userAdresses[userName].toUpperCase();
  },

  isUserAtHome: function(userName) {
    return new Promise((resolve, reject) => {
      var userMac = this.getUserMac(userName);
      this.getMacAddresses().then(macs => {
        var isAtHome = macs.indexOf(userMac) != -1;
        resolve(isAtHome);
      }).catch(function(err) {
        reject(err);
      });
    });
  },

  getUsersAtHome: function() {
    var ref = this;
    return new Promise((resolve, reject) => {
      this.getMacAddresses().then(macs => {
        var users = [];
        for (var user in userAdresses) {
          if (macs.indexOf(ref.getUserMac(user)) != -1) {
            users.push(user);
          }
        }
        resolve(users);
      }).catch(err => {
        reject(err);
      });
    });
  },

  isThereAnybodyHome: function() {
    var ref = this;
    return new Promise((resolve, reject) => {
      this.getMacAddresses().then(macs => {
        for (var user in userAdresses) {
          if (macs.indexOf(ref.getUserMac(user)) != -1) {
            return resolve(true);
          }
        }
        resolve(false);
      }).catch(err => {
        reject(err);
      });
    });
  }

};