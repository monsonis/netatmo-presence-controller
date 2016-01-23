var util = require('util');
var spawn = require('child_process').spawn;

var normalizeMacAddress = function(mac) {
    var parts = mac.toUpperCase().split(":");
    if (parts.length !== 6) {
        return;
    }
    for (var pi = 0; pi < parts.length; pi++) {
        var part = parts[pi];
        if (part.length === 1) {
            parts[pi] = "0" + part;
        }
    }
    return parts.join(":")
};

/**
 * read from arp -na
 */
module.exports.readArpTable = function() {
  return new Promise((resolve, reject) => {
		var arp = spawn("arp", ["-na"] );
		var buffer = '';
		var errstream = '';
		arp.stdout.on('data', data => {
			buffer += data;
		});
		arp.stderr.on('data', data => {
			errstream += data;
		});	
		arp.on('close', code => {
			if (code !== 0 && errstream !== '') {
  		  return reject(errstream);
			}
			     
			var arpTable = [];
      var lines = buffer.split('\n').filter(String); 
      for (var line in lines)
      {
        var parts = lines[line].split(' ').filter(String);     
        var entry = {
          ip: parts[1].slice(1, -1),
          mac: normalizeMacAddress(parts[3])
        }
        arpTable.push(entry);
      }
      resolve(arpTable);
		});	
  });
};