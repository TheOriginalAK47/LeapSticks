var math = require("mathjs");
var leap = require("leapjs");
var sleep = require("sleep");
var closeTime = 0;
var closeEnough = 150;
var fastEnough = 200;
var leftHandFingers = 1;
var rightHandFingers = 1;
var controller = new leap.Controller(({enableGestures:true}));
leap.loop(function(frame) {
    var json = turnHandler(frame); 
    //console.log(json);
    frame = controller.frame(); 
});

function turnHandler(frame) {
    if (frame.timestamp < closeTime + 1000000)
        return {
                    "data": {
                                "move": "",
                                "from": "",
                                "to": ""
                            }
                };
    var turnJSON = splitHappened(frame);
    //console.log(turnJSON);
    var splitOccurred = (turnJSON.data["move"] === "split") ? true : false;
    // console.log(splitOccurred);
    if (splitOccurred == true) {
        console.log(turnJSON);
        return turnJSON;
    }
    turnJSON = attackOccurred(frame);
    var attacked = (turnJSON["move"] === "attack") ? true : false;
    if (attacked == true) {
        console.log(turnJSON);
        //console.log("Attack!");
        return turnJSON;
    }
    return {
                "data": {
                            "move": "",
                            "from": "",
                            "to": ""
                        }
           };
}

function attackOccurred(frame) {
    var turnJSON = handAttackedData(frame);
    return turnJSON;
}

function handAttackedData(frame) {
    var turnJSON = {
                        "data": {
                                    "move": "",
                                    "from": "",
                                    "to":   ""
                                }
                    };
    if (frame.hands.length > 1) {
        //console.log("ZZZZZ...");
        var hand1 = frame.hands[0];
        var hand2 = frame.hands[1];
        hand1Vel = hand1.palmVelocity;
        hand2Vel = hand2.palmVelocity;
        //console.log(hand1Vel[2]);
        //console.log(hand2Vel[2]);
        if (math.abs(hand1Vel[2]) > fastEnough) {
            turnJSON.data["move"] =  "attack";
            turnJSON.data["from"] = hand1.type;
            var dir = hand1.direction[0];
            if (dir > 500) 
                turnJSON.data["to"] = "right";
            else
                turnJSON.data["to"] = "left";
        } else if (math.abs(hand2Vel[2]) > fastEnough) {
            turnJSON.data["move"] = "attack";
            turnJSON.data["from"] = hand2.type;
            var dir = hand2.direction[0];
            if (dir > 500) 
                turnJSON.data["to"] = "right";
            else
                turnJSON.data["to"] = "left";
        }
    }
    console.log(turnJSON);
    return turnJSON;
}

function splitHappened(frame) {
    var turnJSON = handsTouchingData(frame);
    //console.log(turnJSON);
    return turnJSON;
}

function handsTouchingData(frame) {
    var turnJSON = {
                    "data": {
                                "move": "",
                                "from": "",
                                "to": ""
                            }
    
                    };
    if (frame.hands.length > 1) {
        var hand1 = frame.hands[0];
        var hand2 = frame.hands[1];
        var dirOneVector = hand1.palmPosition;
        var dirTwoVector = hand2.palmPosition;
        var distance = calcDistance(dirOneVector, dirTwoVector);
        if (distance < closeEnough) {
            closeTime = frame.timestamp;
            var handOneType = hand1.type;
            var handTwoType = hand2.type;
            handOneVelocity = hand1.palmVelocity[0];
            handTwoVelocity = hand2.palmVelocity[0];
            if (math.abs(handOneVelocity) > fastEnough) {
                turnJSON.data["move"] = "split";
                //console.log(handOneVelocity);
                if (hand1.type == "right") {
                    // console.log("RIGHT HAND!");
                    leftHandFingers += 1;
                    turnJSON.data["from"] = "right";
                    turnJSON.data["to"] = "left";
                } else {
                    // console.log("Leftttttttt.");
                    turnJSON.data["from"] = "left";
                    turnJSON.data["to"] = "right";
                    rightHandFingers += 1;
                }
            } else if (math.abs(handTwoVelocity) > fastEnough) {
                //console.log(handTwoVelocity);
                turnJSON.data["move"] = "split";
                if (hand2.type == "right") {
                    // console.log("RIGHT HAND!!");
                    leftHandFingers += 1;
                    turnJSON.data["from"] = "right";
                    turnJSON.data["to"] = "left";
                } else {
                    //console.log("Left.....");
                    turnJSON.data["to"] = "right";
                    turnJSON.data["from"] = "left";
                    rightHandFingers += 1;
                }
            }
        }
    }
    return turnJSON;
}

function calcDistance(vectorOne, vectorTwo) {
    return math.sqrt(math.pow(vectorOne[0] - vectorTwo[0], 2) + math.pow(vectorOne[1] - vectorTwo[1], 2) + math.pow(vectorOne[2] - vectorTwo[2], 2));     
}
