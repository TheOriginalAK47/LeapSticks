var closeTime = 0;
var closeEnough = 150;
var fastEnough = 200;
var leftHandFingers = 1;
var rightHandFingers = 1;
function main(controller) {
    Leap.loop(function(frame) {
        var json = turnHandler(frame); 
        frame = controller.frame();
        if (frame.timestamp < closeTime + 3000000)
            return {
                    "data": {
                                "move": "",
                                "from": "",
                                "to": ""
                            }
                    };
        if (json.data["move"] !== '' && json.data["from"] !== "" && json.data["to"] !== "") {
            return json;
        }
    });
}

function turnHandler(frame) {
    var turnJSON = splitHappened(frame);
    //console.log(turnJSON);
    var splitOccurred = (turnJSON.data["move"] === "split") ? true : false;
    // console.log(splitOccurred);
    if (splitOccurred == true) {
        console.log(turnJSON);
        return turnJSON;
    }
    turnJSON = attackOccurred(frame);
    var attacked = (turnJSON.data["move"] === "attack") ? true : false;
    if (attacked == true) {
        console.log(turnJSON);
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
        if (Math.abs(hand1Vel[2]) > fastEnough) {
            closeTime = frame.timeStamp;
            turnJSON.data["move"] =  "attack";
            turnJSON.data["from"] = hand1.type;
            var xVel = hand1.palmVelocity[0];
            if (xVel > 350) 
                turnJSON.data["to"] = "right";
            else
                turnJSON.data["to"] = "left";
        } else if (Math.abs(hand2Vel[2]) > fastEnough) {
            closeTime = frame.timeStamp;
            turnJSON.data["move"] = "attack";
            turnJSON.data["from"] = hand2.type;
            var xVel = hand2.palmVelocity[0];
            if (xVel > 350) 
                turnJSON.data["to"] = "right";
            else
                turnJSON.data["to"] = "left";
        }
    }
    //console.log(turnJSON);
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
            if (Math.abs(handOneVelocity) > fastEnough) {
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
            } else if (Math.abs(handTwoVelocity) > fastEnough) {
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
    return Math.sqrt(Math.pow(vectorOne[0] - vectorTwo[0], 2) + Math.pow(vectorOne[1] - vectorTwo[1], 2) + Math.pow(vectorOne[2] - vectorTwo[2], 2));     
}
