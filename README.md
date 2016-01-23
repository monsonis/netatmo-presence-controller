# Netatmo presence controller

Presence control for thermostat netatmo

# Installation

## Add an application in Netatmo dev website

- https://dev.netatmo.com/dev/createapp

## Clone repo and install dependecies

- Clone repo
- Install dependencies: npm install

## Configure application

- Edit config/default.json file

## Execute

- npm start

## Create service with Systemd (optional)

Create a service file for the application, in /etc/systemd/system/netatmo.service.

There's a few variables that need to be filled in:

[node binary] This is the output of “which node” as the srv-node-sample user. Either /usr/bin/node or the ~/.nvm/... path noted above.

[path] This is the path where application resides.

    [Service]
    ExecStart=[node binary] [path]/app.js
    Restart=always
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=node-sample
    User=srv-node-sample
    Group=srv-node-sample
    Environment=NODE_ENV=production
    
    [Install]
    WantedBy=multi-user.target

Now start the service:

    systemctl enable netatmo
    systemctl start netatmo



