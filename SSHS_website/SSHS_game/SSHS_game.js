/*

 _____           _                                         _         _                     _                   _                            
 / ____|         (_)                                       | |       | |                   (_)                 | |                           
 | (___   ___  ___ _ _ __   __ _   ___  ___  _   _ _ __   __| |___    | |__   ___  __ _ _ __ _ _ __   __ _   ___| |__   __ _ _ __   ___  ___  
 \___ \ / _ \/ _ \ | '_ \ / _` | / __|/ _ \| | | | '_ \ / _` / __|   | '_ \ / _ \/ _` | '__| | '_ \ / _` | / __| '_ \ / _` | '_ \ / _ \/ __| 
 ____) |  __/  __/ | | | | (_| | \__ \ (_) | |_| | | | | (_| \__ \_  | | | |  __/ (_| | |  | | | | | (_| | \__ \ | | | (_| | |_) |  __/\__ \ 
 |_____/ \___|\___|_|_| |_|\__, | |___/\___/ \__,_|_| |_|\__,_|___( ) |_| |_|\___|\__,_|_|  |_|_| |_|\__, | |___/_| |_|\__,_| .__/ \___||___/ 
 __/ |                                 |/                                  __/ |                 | |               
 |___/                                                                     |___/                  |_|               
 */
/*                                                                                              
 |             ,---.     |              |    o              |     o o |    |                   
 |---.,   .    `---.,---.|---.,---.,---.|--- .,---.,---.    |    ,---.|---.|---.,---.,---.,---.
 |   ||   |        ||---'|   |,---|`---.|    |,---||   |    |    |   ||   ||   ||---'|    `---.
 `---'`---|    `---'`---'`---'`---^`---'`---'``---^`   '    `---'`---'`---'`---'`---'`    `---'
 `---'                                                                                    
 */


//Drawing parameters
let fr = 30; //Framerate
let drawingData = {}; // Global object to hold results from the loadJSON call
let bg = 255;
let colour = 0;
let strength = 2;

//Drawing data and flats
let allPaths = [];

//Sound 
let sounds = [];
let sound; //Sound object

//Font 
let font;
let guideTextSize;
let guideTextMargin;
let controlTextSize;
let welcomeTextSize;

// Sketch boxes
let boxes;
let renderedBoxes = [];
let originalBoxSize = 750;
let boxX, boxY, boxScaler;

// Arrows
let arrows = [];
let renderedArrows = [];
let renderedBoldArrows = [];
let arrowX, arrowY, arrowScaler;

// Symbols
let symbols = [];
let renderedSymbols = [];
let renderedBoldSymbols = [];

//Positioning
let totalOffsetX, totalOffsetY;

//Mouse handling
let cursorX, cursorY; //Save position of cursor
let clicked = false; //Flag whether mouse has been clicked or not

//Game dynamics
let correctIndex; //Index of the box that displays the sketch relating to the sound that is played
let selectedIndex = -1; //Index of the box that was selected by participant
let correctAnswer = false; //Flag whether participant selected the right sketch
let soundOptions; //The options that were presented to a participant in a round
let allAnswers = []; //Save all answers in an array
let score = 0; //The number of correct selections

//Times and duration
let drawingTime = 4500; //Time it takes to draw a sketch
let drawStartTime = 0;
let selectStartTime = 0;
let evalTime = 2000; //This is how long the evaluation stage lasts
let evalStartTime = 0;

//Sequence timing
let loadingComplete = false; //True when all content has been loaded
let loadingCount = 0; //Increment when content has been loaded
let numberOfContent = 5; //How many different content files have to be loaded
let welcomeFlag = true;
let nextRound = false;
let round = -1;
let welcomeInstance = 0; //Counts the different stages of the welcome/tutorial stage 
let totalInstances = 1; //How many instances are there during the sketch display
let instance = -1; //The instance of the same sound playing, in one round the same sound is played "totalInstances" times

let artistNumbers = [3, 11, 15, 19, 21, 25, 29, 33, 39, 43, 55]; //Artists who only drew abstract representations, odd numbers indicate the second round of sketches
let soundNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; //All sound indices

function loadingData() {
    //Loading JSON data
    drawingData = loadJSON("../data/drawing_data.json",incremementLoadingCount);
    font = loadJSON('../data/font.json',incremementLoadingCount);
    boxes = loadJSON('../data/boxes.json',incremementLoadingCount);
    arrows = loadJSON('../data/arrows.json',incremementLoadingCount);
    symbols = loadJSON('../data/symbols.json',incremementLoadingCount);

    //Load sounds
    /*
    for (let i = 0; i < 10; i++) {
        sounds.push(new Audio('../audio/sound' + str(i + 1) + '.mp3'));
    } */
}

function incremementLoadingCount() {
    loadingCount++;
}

//////////////////////////////////////////////
/* --------------------------------------
 SETUP EVERYTHING AND RE-EVALUATE IF WINDOW SIZE CHANGES
 -------------------------------------- */
//////////////////////////////////////////////
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(fr);

    //Randomise orders
    artistNumbers = shuffleArray(artistNumbers);
    artistNumbers.pop(); //Remove last entry because there is only room for 10 artists
    soundNumbers = shuffleArray(soundNumbers);
  
    sizing();
    loadingData();
    //preRender();
}

function sizing() {
    // Determine positioning and sizing of elements
    let margin = 0.01; //realative distance between boxes
    let boxDev = 0.33333 * (1 - 2 * margin); //Scale the box size that contains the sketches 

    //Size of sketch boxes
    boxX = min(windowWidth, windowHeight) * boxDev; //adjust box size according to which side of the window is smaller
    boxY = boxX;

    //Size of arrows
    arrowX = boxX / 3.;
    arrowY = arrowX;

    //Define offsets to center the interface
    totalOffsetX = (windowWidth - 3 * boxX) * 0.5;
    totalOffsetY = (windowHeight - 3 * boxY) * 0.5;

    //Define different textsizes 
    welcomeTextSize = boxX / (originalBoxSize * 22); //25 is the length of the longest welcome text line including margin

    guideTextSize = boxX / (originalBoxSize * 10); //10 is the length of the longest guide text line including 2 character margin
    guideTextMargin = 0.5 * (boxY - 3 * guideTextSize); //Center guide text vertically, number 3 because the guide text has 2 lines with one 1 line space inbetween them 

    boxScaler = boxX / originalBoxSize;
    arrowScaler = arrowX / originalBoxSize;

    strength = windowWidth / 700; //Drawing strength depends on window size, the number 700 was determined empirically
}

function preRender() {
    //Pre-render boxes
    for (let i = 0; i < 4; i++) {
        renderedBoxes.push(renderBoxes(boxes[i], strength, colour, boxScaler));
        renderedArrows.push(renderSketch(arrows[i], strength, colour, arrowScaler));
        renderedBoldArrows.push(renderSketch(arrows[i], 2 * strength, colour, arrowScaler));
    }
    for (let i = 0; i < 2; i++) {
        renderedSymbols.push(renderSketch(symbols[i], strength, colour, 2 * guideTextSize));
        renderedBoldSymbols.push(renderSketch(symbols[i], 2 * strength, colour, 2 * guideTextSize));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    sizing();
    if (loadingComplete) { //Pre-render can only run if all data has been loaded
        preRender();
    }
    
}

//////////////////////////////////////////////
/* --------------------------------------
 DRAW CYCLE
 -------------------------------------- */
//////////////////////////////////////////////
function draw() {
    background(bg);
    translate(totalOffsetX, totalOffsetY);

    if (!loadingComplete) {
        text('loading...', 0, 0);
        if (loadingCount >= numberOfContent) {
            loadingComplete = true;
            preRender();
        }
    }
    else {

        //Save cursor position for this cycle but only if mouse has not been clicked, in that case cursor position is updated in the mouseClicked function
        if (!clicked) {
            cursorX = mouseX;
            cursorY = mouseY;
        }

        // Update time since sketch started drawing
        let currentDrawTime = -1;
        if (round < 0) {
            //Welcome stage
            for (let i = 0; i <= 4 * welcomeInstance; i++) { //Factor 4 because I decided to only have 2 welcome instance (0 and 1)
                showWelcomeText(3 * millis(), i);
            }
            //Display arrows and boxes
            for (let i = 0; i < 4; i++) {
                let bold = false;
                if (welcomeInstance > 0) {
                    displayArrows(i, bold);
                    displayBoxes(i);
                    displayGuideText();
                } else if (welcomeInstance == 0) {
                    displayArrows(1, bold);
                    displayBoxes(0);
                }
            }
        } else if (round < 10) {
            //Game stage    
            if (nextRound) {
                currentDrawTime = -1; // -1 is used to disregard time
                if (round < 10) { //The game is played over 10 rounds
                    newRound(artistNumbers[round], soundNumbers[round]);
                }
                nextRound = false;
            } else if (instance < totalInstances) { //This is the drawing stage where a participant looks at all the sketches being drawn after the other
                currentDrawTime = millis() - drawStartTime;
                newInstance = getInstance(currentDrawTime); //Check if one drawing time cycle has passed which means that one sketch has been completed
                //////////////////
                /*
                This bunch of confusing code was written to have sketches be drawn one after the other,
                but turned out it doesn't look great. It's still here in case someone wants to back to it
                */
                //////////////////
                if (newInstance > instance) { //If a drawing time cycle has passed, go into this loop
                    if (newInstance < totalInstances) { //Play the same sound for every new sketch that's being drawn, there are 4 sketches in total
                        //sounds[soundNumbers[round]].play();

                        sound.play();
                    }
                    instance = newInstance; //Save the new instance number
                }
            } else if (instance == totalInstances) { //This is the selection phase where the participant choses a sketch
                /* uncomment if question mark should be displayed
                 if (selectStartTime == 0) {
                 selectStartTime = millis();
                 }
                 //Display a question mark in the middle
                 let selectCurrentTime = millis() - selectStartTime;
                 write('?', 8*selectCurrentTime, strength, colour, boxX + arrowX, boxY + arrowY, arrowScaler);
                 */
            } else if (instance > totalInstances) { //This is the stage where the participants sees if their choice was correct
                //currentDrawTime = -1; //

                sound.pause(); //Stop any sounds that are still playing

                if (evalStartTime == 0) {
                    evalStartTime = millis();
                }
                let currentEvalTime = millis() - evalStartTime;

                if (correctAnswer) {
                    drawSketch(symbols[2], 8 * currentEvalTime, strength, colour, boxX + arrowX, boxY + arrowY, arrowScaler);
                } else {
                    write('X', 8 * currentEvalTime, strength, colour, boxX + arrowX, boxY + arrowY, arrowScaler);
                }

                if (evalTime < currentEvalTime) {
                    nextRound = true;
                    round++;
                    if (correctAnswer) {
                        score++;
                    }
                }
            }

            //Display arrows, sketches and boxes
            for (let i = 0; i < 4; i++) {
                let bold = false;
                if (i == selectedIndex) {
                    bold = true;
                }
                if (i < ((instance + 1) * (4 / totalInstances))) {
                    displayArrows(i, bold);
                    displaySketch(allPaths[i], currentDrawTime - Math.floor(i * (totalInstances / 4)) * drawingTime, strength, colour, boxScaler, i);
                } else if (instance < 0) {
                    displayArrows(i, bold); // to avoid the arrows shortly disappearing before the next round
                }
                displayBoxes(i);
            }
            displayGuideText();
        } else if (round >= 10) {
            //End stage
            displayEndText();
        }

        //Reset mouse clicked flag
        clicked = false;
    }
}
//////////////////////////////////////////////
/* --------------------------------------
 EXTRA FUNCTIONS
 -------------------------------------- */
//////////////////////////////////////////////

/* --------------------------------------
 SEQUENCE
 -------------------------------------- */

//Welcome/Tutorial
function nextWelcomeInstance() {
    welcomeInstance++;
}

//Game rounds
//Display stage 
function getInstance(time) { //The 4 sketches are played one after the other
    return Math.floor(time / drawingTime);
}

// Evaluation stage
function evaluateSelection(selected) {
    instance = totalInstances + 1; //Go to the next stage
    allAnswers.push(soundOptions[selected]); //Save all anwsers in an array for data submission
    selectedIndex = selected;
    if (selectedIndex == correctIndex) {
        correctAnswer = true;
    } else {
        correctAnswer = false;
    }
}

/* --------------------------------------
 PREPARING NEXT SOUND AND DRAWING
 -------------------------------------- */
function newRound(artistNumber, playSound) {
    allPaths = []; //Reset allPath array
    resetTimes();

    sound = new Audio('../audio/sound' + str(playSound + 1) + '.mp3'); 

    soundOptions = getSoundNumbers(playSound);

    for (let i = 0; i < 4; i++) {
        let raw_paths = [];
        let paths = [];
        raw_paths = getDrawingData(artistNumber, soundOptions[i], drawingData); //Get path data    
        let l = raw_paths.length;
        let drawStartTimeOffset = raw_paths[0][2][0]; //Get the drawing time at which the sketch was started 
        let timeScaler = drawingTime / (raw_paths[l - 1][2][raw_paths[l - 1][2].length - 1] - drawStartTimeOffset); //Scale drawing time so that it always takes the same amount of time
        for (let j = 0; j < l; j++) {
            let path = [];
            let x = raw_paths[j][0];
            let y = raw_paths[j][1];
            let time = raw_paths[j][2];
            //Fill path array with new path data
            for (let k = 0; k < x.length; k++) {
                let normalisedTime = (time[k] - drawStartTimeOffset) * timeScaler;
                path.push(new dot(x[k], y[k], normalisedTime));
            }
            paths.push(path);
        }
        allPaths.push(paths);
    }
}

// This function return the sound numbers that the displayed sketches correlate with.
// Right now it's random but in the final implementation this will be informed by dissimilarty measurements

function getSoundNumbers(sound) {
    let array = [];
    let temp = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    let offset = Math.floor(Math.random(7));

    let flag = false;
    for (let i = 0; i < 4; i++) {
        let s = temp[i + offset];
        array.push(s);
        if (s == sound) {
            flag = true;
            correctIndex = i;
        }
    }
    if (!flag) {
        let randomIndex = Math.floor(Math.random(4));
        correctIndex = randomIndex;
        array[randomIndex] = sound; //one of the sound numbers is the actual sound
    }
    return array;
}

/* --------------------------------------
 PLAY SOUNDS
 -------------------------------------- */


/* --------------------------------------
 DISPLAY INTERFACE
 -------------------------------------- */
//Calculate factors to position the various elements 
function getPosition(i) {
    let x;
    let y;
    switch (i) {
        case 0: //Left 
            x = 0;
            y = 1;
            break;
        case 1:  //Top
            x = 1;
            y = 0;
            break;
        case 2: //Right
            x = 2;
            y = 1;
            break;
        case 3: //Bottom
            x = 1;
            y = 2;
            break;
        default:
            x = 0;
            y = 0;
    }
    return [x, y];
}

function cursorPos(posX, posY, sizeX, sizeY, cursorX, cursorY) {
    if (cursorX >= posX && cursorX <= posX + sizeX && cursorY >= posY && cursorY <= posY + sizeY) {
        return true;
    } else {
        return false;
    }
}

//Display sketch boxes
function displayBoxes(i) {
    let pos = getPosition(i);
    image(renderedBoxes[i], pos[0] * boxX, pos[1] * boxY, boxX, boxY);
}

//Display Arrows
function displayArrows(boxNumber, bold) {
    let pos = getPosition(boxNumber);
    let posX = (pos[0] * arrowX) + boxX;
    let posY = (pos[1] * arrowY) + boxY;

    if (bold || (cursorPos(posX + totalOffsetX, posY + totalOffsetY, arrowX, arrowY, cursorX, cursorY) && instance <= totalInstances)) {
        image(renderedBoldArrows[boxNumber], posX, posY, arrowX, arrowY);
        if (clicked) { //if mouse has been clicked, do something
            if (round < 0) { //Welcome stage
                if (welcomeInstance > 0) {
                    nextRound = true; //Start the game
                    round++;
                } else if (boxNumber == 1 && welcomeInstance == 0) { //Continue with welcome/tutorial when upper key is clicked
                    nextWelcomeInstance();
                    clicked = false; //set to false so that it doesn't trigger the other loop in the next loop cycle
                }
            } else if (round < 10) { //Game stage
                evaluateSelection(boxNumber); //evaluate selection
            } else {
            }
        }
    } else if (!bold) {
        image(renderedArrows[boxNumber], posX, posY, arrowX, arrowY);
    }
}

// Draw sketches
function displaySketch(data, time, strength, colour, scale, boxNumber) {
    //Display sketch 
    let pos = getPosition(boxNumber);
    drawSketch(data, time, strength, colour, pos[0] * boxX, pos[1] * boxY, scale);
}

/* --------------------------------------
 WRITE TEXT
 -------------------------------------- */

//Welcome message when webpage is first accessed
function showWelcomeText(time, boxNumber) {
    let margin = 2; //number of characters as margin
    let pos = getPosition(boxNumber);

    if (boxNumber == 0) {
        write("Welcome", time, 1.4 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + margin * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("Press the", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 3) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("arrow-up key", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 5) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("or click the", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 7) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("arrow-up icon", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 9) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("to continue...", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 11) * welcomeTextSize * originalBoxSize, welcomeTextSize);
    } else if (boxNumber == 1) {
        write("This game has 10", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + margin * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("rounds. You will", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 2) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("hear a sound and", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 4) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("see 4 different", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 6) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("sketches in each", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 8) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("round. You have to", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 10) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("guess which sketch", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 12) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("belongs to the", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 14) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("sound.", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 16) * welcomeTextSize * originalBoxSize, welcomeTextSize);
    } else if (boxNumber == 2) {
        write("You can select", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + margin * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("a sketch using", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 2) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("the arrows.", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 4) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("You can replay", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 6) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("a sound by", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 8) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("pressing the r key", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 10) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("or by clicking", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 12) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("replay in the top", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 14) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("right corner.", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 16) * welcomeTextSize * originalBoxSize, welcomeTextSize);
    } else if (boxNumber == 3) {
        write("For each correct", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + margin * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("guess, your score", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 2) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("will increase.", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 4) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("In the end, you", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 6) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("can compare your", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 8) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("score with other", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 10) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("players.", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 12) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("Use any arrow-key", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 14) * welcomeTextSize * originalBoxSize, welcomeTextSize);
        write("to start...", time, 0.7 * strength, colour, pos[0] * boxX + margin * welcomeTextSize * originalBoxSize, pos[1] * boxY + (margin + 16) * welcomeTextSize * originalBoxSize, welcomeTextSize);
    }
}

//Display guide text
function displayGuideText() {
    //Positioning for the text is chosen so that it centres vertically and horizontially 
    //Text about which round we are in (bottom left corner)
    let text = "Round";
    write(text, -1, strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY + guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    text = str(round + 1) + " of 10";
    write(text, -1, strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY + guideTextMargin + guideTextSize * originalBoxSize, guideTextSize);

    //Text that states the score (bottom right corner)
    text = "Score";
    write(text, -1, strength, colour, 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY + guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    text = str(score);
    write(text, -1, strength, colour, 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY + guideTextMargin + guideTextSize * originalBoxSize, guideTextSize);

    //Replay text (top right corner)
    text = "Replay";
    //Make bold if hovered
    if (cursorPos(2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length) + totalOffsetX, guideTextMargin - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * text.length, originalBoxSize * guideTextSize * 3, cursorX, cursorY) && instance <= totalInstances) {
        image(renderedBoldSymbols[0], 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - 2), guideTextMargin, 2 * guideTextSize * originalBoxSize, 2 * guideTextSize * originalBoxSize);
        write(text, -1, 2 * strength, colour, 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);

        //If mouse has been clicked, run repeat function
        if (clicked && round < 10 && round >= 0) {
            replay(soundNumbers[round]);
        }
    } else { //Normal line strength
        image(renderedSymbols[0], 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - 2), guideTextMargin, 2 * guideTextSize * originalBoxSize, 2 * guideTextSize * originalBoxSize);
        write(text, -1, strength, colour, 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    }

    //leave text (top left corner)

    text = "Leave";
    //Make bold if hovered
    if (cursorPos(originalBoxSize * guideTextSize * 0.5 * (10 - text.length) + totalOffsetX, guideTextMargin - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * text.length, originalBoxSize * guideTextSize * 3, cursorX, cursorY)) {
        image(renderedBoldSymbols[1], originalBoxSize * guideTextSize * 0.5 * (10 - 2), guideTextMargin, 2 * guideTextSize * originalBoxSize, 2 * guideTextSize * originalBoxSize);
        write(text, -1, 2 * strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);

        //If mouse has been clicked, leave the application
        if (clicked) {
            window.location.href = "../index.html";
        }

    } else { //Normal line strength 
        image(renderedSymbols[1], originalBoxSize * guideTextSize * 0.5 * (10 - 2), guideTextMargin, 2 * guideTextSize * originalBoxSize, 2 * guideTextSize * originalBoxSize);
        write(text, -1, strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    }
}

//Display ending text
function displayEndText() {
    //State the final score
    text = "Your final score is";
    write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), boxY - guideTextSize * originalBoxSize, guideTextSize);
    text = str(score);
    write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), boxY + guideTextSize * originalBoxSize, guideTextSize);

    //Ask to submit data
    text = "Compare your score to other players";
    if (cursorPos(boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length) + totalOffsetX, 2 * boxY - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * text.length, originalBoxSize * guideTextSize, cursorX, cursorY)) {
        write(text, -1, 2 * strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY - guideTextSize * originalBoxSize, guideTextSize);
        if (clicked) {
            setCookie(score, allAnswers, soundNumbers);
        }

    } else { //Normal line strength 
        write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY - guideTextSize * originalBoxSize, guideTextSize);
    }
}

/* --------------------------------------
 REPLAY SOUND AND REDRAW SKETCHES
 -------------------------------------- */
function replay(playSound) {
    resetTimes();
    sound.pause(); //Stop sound
    sound.currentTime = 0; //Reset sound
    sound.play(); //Play sound
}

/* --------------------------------------
 RESET TIMES
 -------------------------------------- */
function resetTimes() {
    instance = -1; //Reset sound instances
    drawStartTime = millis(); //Reset start time of the drawing 
    selectStartTime = 0; //Reset start time of the questionmark in the selection stage
    evalStartTime = 0; //Reset start time of the symbols drawn in the evaluation stage
    selectedIndex = -1;
}

/* --------------------------------------
 RANDOMISE ORDER
 -------------------------------------- */
//Function to shuffle an array
function shuffleArray(array) {
    //Randomise order of an array
    for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        let tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
    }
    return array;
}


/* --------------------------------------
 HANDLE KEY AND MOUSE INPUTS
 -------------------------------------- */
function keyPressed() {

    if (round < 0) {
        if (keyCode === UP_ARROW && welcomeInstance == 0) {
            nextWelcomeInstance();
        } else if ((keyCode === LEFT_ARROW || keyCode === UP_ARROW || keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW) && welcomeInstance > 0) {
            nextRound = true; //Start next round
            round++;
        }
    } else if (round < 10) {
        if (instance <= totalInstances) { //Only allow this if it's not evaluation stage
            if ((key == 'r' || key == 'R') && round < 10 && round >= 0) {
                replay(soundNumbers[round]);
            }

            if (keyCode === LEFT_ARROW || keyCode === UP_ARROW || keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW) {
                let selection;
                if (keyCode === LEFT_ARROW) {
                    selection = 0;
                } else if (keyCode === UP_ARROW) {
                    selection = 1;
                } else if (keyCode === RIGHT_ARROW) {
                    selection = 2;
                } else if (keyCode === DOWN_ARROW) {
                    selection = 3;
                }
                evaluateSelection(selection);
            }
        }
    }
    if (keyCode === ENTER) {
        round = 9;
    }
}

function mouseClicked() {
    clicked = true;
    cursorX = mouseX;
    cursorY = mouseY;
}


/* --------------------------------------
 CREATE COOKIE TO SAVE DATA
 -------------------------------------- */

function setCookie(score, answers, order) {
    let exdays = 7;
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "Score=" + score + ";" + expires + ";" + "path=/";
    document.cookie = "Answers=" + answers + ";" + expires + ";" + "path=/";
    document.cookie = "Order=" + order + ";" + expires + ";" + "path=/";
}
