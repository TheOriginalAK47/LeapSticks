var leap = require("leapjs");
var velThreshold = 700;
leap.loop(function(frame) {
    if (frame.hands.length == 1) {
        hand1 = frame.hands[0];
        if (hand1.palmVelocity[2] > velThreshold)
        {
            console.log("Hand1 Vel: " + hand1.palmVelocity[2]);
            console.log("Hand1 Z: " + hand1.palmPosition[2]);
        }
    } else if (frame.hands.length == 2) {
        hand2 = frame.hands[1];
        if (hand2.palmVelocity[2] > velThreshold) {
            console.log("Hand2 Z: " + hand2.palmPosition[2]);
            console.log("Hand2 Vel: " + hand2.palmVelocity[2]);
        }
    }
});
