/*
 *  lib/flood.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-27
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var net = require('net')
var ips = require('./ips');

var ipv4 = function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var devs = ifaces[dev]
        for (var di in devs) {
            var details = devs[di]

            if (details.family != 'IPv4') {
                continue
            }
            if (details.address == '127.0.0.1') {
                continue
            }
            if (details.internal) {
                continue
            }

            return details.address
        }
    }
}


var flood = function(paramd, done) {
    var start_ms = (new Date()).getTime();
    var hosts = [];
    var populate_hosts = function() {
        ips.generator(paramd, function(error, ip) {
            if (ip === null) {
                scan();
            } else {
                hosts.push(ip);
            }
        });
    };

    var log = function() {
        if (paramd.verbose) {
            console.log.apply(console.log, Array.prototype.slice.call(arguments));
        }
    }

    var connect = function(host, port, callback) {
        log("-", "CONNECT", host);
        var timer_id;
        var client = net.connect(1, host, function() {
            if (client) {
                log("-", "SUCCESS", host, port);
                client.destroy();
                callback(host, port);
            }

            if (timer_id) {
                clearTimeout(timer_id);
                timer_id = null;
            }
        });
        client.on('error', function() {
            if (client) {
                log("-", "FAIL", host, port);
                callback(host, port);
                client = null;
            }
            if (timer_id) {
                clearTimeout(timer_id);
                timer_id = null;
            }
        })

        timer_id = setTimeout(function() {
            if (client) {
                log("-", "TIMEOUT", host, port);
                callback(host, port);
                client.destroy();
            }
        }, paramd.timeout);
    }

    var actives = [];

    var scan = function() {
        log("-", "remaining", hosts.length, "active", actives.length);

        if (hosts.length === 0) {
            if (actives.length === 0) {
                log("-", "finished");
                log("-", "time", ((new Date()).getTime() - start_ms) / 1000.0);
                if (done) {
                  done(null);
                }
            } else if (actives.length < 10) {
                log("-", "actives", actives);
            }

            return;
        }

        if (actives.length >= paramd.max_connections) {
            log("-", "stalling");
            return;
        }

        var host = hosts.pop();
        actives.push(host);

        connect(host, paramd.port, function(host, port) {
            var index = actives.indexOf(host);
            if (index > -1) {
                actives.splice(index, 1);
            }

            scan();
        });

        scan();
    };

    populate_hosts();
}

/*
 *  API
 */

var last_flood = 0;

module.exports.flood = function(options, callbak) {

  if (options.restrict === undefined) {
      options.restrict = ipv4();
  }

  options.poll = (options.poll !== undefined) ? options.poll : 0;
  options.verbose = options.verbose || false;
  options.max_connections = options.max_connections || 64;
  options.max_hosts = options.max_hosts || 4 * 256;
  options.timeout = options.timeout || 2500;
  options.port = options.port || 1;
  
  var now = (new Date()).getTime();
  var delta = ( now - last_flood ) / 1000;
  if (delta < ( 5 * 60 )) {
    return;
  }

  last_flood = (new Date()).getTime();
  flood(options, callbak);
};
