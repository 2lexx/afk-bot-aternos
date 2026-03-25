const mineflayer = require('mineflayer')
const fs = require('fs');
const { keep_alive } = require("./keep_alive");
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
var actions = [ 'forward', 'back', 'left', 'right']
var pi = 3.14159;
var moveinterval = 2;
var maxrandom = 5;
var host = data["ip"];
var username = data["name"]

function createBot() {
    var lasttime = -1;
    var moving = 0;
    var connected = 0;
    var lastaction;

    var bot = mineflayer.createBot({
        host: host,
        username: username
    });

    bot.on('login', function() {
        console.log("Logged In")
    });

    bot.on('spawn', function() {
        connected = 1;
        console.log("Spawned")
    });

    bot.on('time', function() {
        if (connected < 1) {
            return;
        }
        if (lasttime < 0) {
            lasttime = bot.time.age;
        } else {
            var randomadd = Math.random() * maxrandom * 20;
            var interval = moveinterval * 20 + randomadd;
            if (bot.time.age - lasttime > interval) {
                if (moving == 1) {
                    bot.setControlState(lastaction, false);
                    moving = 0;
                    lasttime = bot.time.age;
                } else {
                    var yaw = Math.random() * pi - (0.5 * pi);
                    var pitch = Math.random() * pi - (0.5 * pi);
                    bot.look(yaw, pitch, false);
                    lastaction = actions[Math.floor(Math.random() * actions.length)];
                    bot.setControlState(lastaction, true);
                    moving = 1;
                    lasttime = bot.time.age;
                    bot.activateItem();
                }
            }
        }
    });

    bot.on('kicked', function(reason) {
        console.log("Kicked: " + reason);
        connected = 0;
        setTimeout(createBot, 5000);
    });

    bot.on('end', function() {
        console.log("Disconnected, reconnecting in 5 seconds...");
        connected = 0;
        setTimeout(createBot, 5000);
    });

    bot.on('error', function(err) {
        console.log("Error: " + err);
    });
}

createBot();
