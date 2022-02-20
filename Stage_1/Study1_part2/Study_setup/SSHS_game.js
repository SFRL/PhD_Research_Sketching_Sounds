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
let font; //"homemade font"  
let digitalFont = 'Courier New';
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

//Bar chart with score distribution
let barChart;

//Positioning
let totalOffsetX, totalOffsetY;

//Mouse handling 
let cursorX = 0
let cursorY = 0; //Save position of cursor
let clicked = false; //Flag whether mouse has been clicked or not

//Game dynamics
let correctIndex; //Index of the box that displays the sketch relating to the sound that is played
let selectedIndex = -1; //Index of the box that was selected by participant
let correctAnswer = false; //Flag whether participant selected the right sketch
let soundOptions; //The options that were presented to a participant in a round
let allAnswers = []; //Save all answers in an array
let score = 0; //The number of correct selections
let displayScores; //Values of all how often participants reached certain scores, array is retrieved from database

//Times and duration  
let drawingTime = 4500; //Time it takes to draw a sketch 
let drawStartTime = 0;
let selectStartTime = 0;
let evalTime = 2000; //This is how long the evaluation stage lasts     
let evalStartTime = 0;

//Sequence timing
let loadingComplete = false; //True when all content has been loaded 
let loadingCount = 0; //Increment when content has been loaded 
let numberOfContent = 16; //How many different content files have to be loaded  
let welcomeFlag = true;
let nextRound = false;
let sketchStage = false;
let evalStage = false;
let round = -1;
let welcomeInstance = 0; //Counts the different stages of the welcome/tutorial stage    
let totalInstances = 1; //How many instances are there during the sketch display
let instance = -1; //The instance of the same sound playing, in one round the same sound is played "totalInstances" times

let artistNumbers = [3, 11, 15, 19, 21, 25, 29, 33, 39, 43, 55]; //Artists who only drew abstract representations, odd numbers indicate the second round of sketches       
let soundNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; //All sound indices

//UserID that is passed to google survey
let userID;

function loadingData() {
    //Loading JSON data
    drawingData = loadJSON('data/drawing_data.json', incremementLoadingCount);
    font = loadJSON('data/font.json', incremementLoadingCount);
    boxes = loadJSON('data/boxes.json', incremementLoadingCount);
    arrows = loadJSON('data/arrows.json', incremementLoadingCount);
    symbols = loadJSON('data/symbols.json', incremementLoadingCount);

    //Load sounds
    for (let i = 0; i < 10; i++) {
        sounds.push(document.createElement("audio"));
        sounds[i].src = 'audio/sound' + str(i + 1) + '.mp3';
        sounds[i].oncanplaythrough = incremementLoadingCount();
    }
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

    //Create invisible divs to control sound playback
    //Replay button
    let replayDIV = document.createElement('DIV');
    replayDIV.className = 'invisiblebutton';
    replayDIV.id = 'replaybutton';
    replayDIV.onclick = function () { replay(soundNumbers[round]) }; //for some reason the replay function needs to be nested in another function
    document.body.appendChild(replayDIV);

    //Start button 
    let startDIV = document.createElement('DIV');
    startDIV.className = 'invisiblebutton';
    startDIV.id = 'startbutton';
    startDIV.onclick = function () { startGame() };
    document.body.appendChild(startDIV);

    //Arrows
    for (let i = 0; i < 4; i++) {
        let arrowDIV = document.createElement('DIV');
        arrowDIV.className = 'invisiblebutton';
        arrowDIV.id = 'arrow' + str(i);
        document.body.appendChild(arrowDIV);
        arrowDIV.onclick = function () { prepareSound(round) };
    }

    sizing();
    loadingData();
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
    welcomeTextSize = (1.7 * boxX) / 25; //25 is the length of the longest welcome text line including margin

    guideTextSize = boxX / (originalBoxSize * 10); //10 is the length of the longest guide text line including 2 character margin 
    guideTextMargin = 0.5 * (boxY - 3 * guideTextSize); //Center guide text vertically, number 3 because the guide text has 2 lines with one 1 line space inbetween them 

    boxScaler = boxX / originalBoxSize;
    arrowScaler = arrowX / originalBoxSize;

    strength = Math.min(boxX,boxY) / 200; //Drawing strength depends on window size, the number 700 was determined empirically

    //Determine the size and position of the overlayed html elements
    let DOM = document.getElementsByClassName("canvasoverlay");
    let domheight = boxY;
    let domwidth = domheight * (16 / 9);

    for (let i = 0; i < DOM.length; i++) {
        DOM[i].style.top = str(totalOffsetY + boxY) + 'px';
        DOM[i].style.left = str(totalOffsetX + 1.5 * boxX - 0.5 * domwidth) + 'px';
        DOM[i].style.width = str(domwidth) + 'px';
        DOM[i].style.height = str(domheight) + 'px';
        DOM[i].style.borderWidth = str(strength) + 'px';
        DOM[i].style.fontSize = str(welcomeTextSize) + 'px';
    }

    document.getElementById('popup').style.padding = str(welcomeTextSize) + 'px';

    //Give size and position to invisible buttons and add onclick function
    //Replay button
    let replayDIV = document.getElementById('replaybutton');
    replayDIV.style.left = totalOffsetX + 2 * boxX + originalBoxSize * guideTextSize * 0.5 * (10 - 6); //6 because the word replay has 6 letters  
    replayDIV.style.top = totalOffsetY + guideTextMargin - guideTextSize * originalBoxSize;
    replayDIV.style.width = originalBoxSize * guideTextSize * 6;
    replayDIV.style.height = originalBoxSize * guideTextSize * 3;
    replayDIV.style.display = 'none'; //Hide in the beginning 

    //Start button 
    let startDIV = document.getElementById('startbutton');
    startDIV.style.left = boxX + originalBoxSize * guideTextSize * 0.5 * (10 - 20) + totalOffsetX;
    startDIV.style.top = 2.5 * boxY - guideTextSize * originalBoxSize + totalOffsetY;
    startDIV.style.width = originalBoxSize * guideTextSize * 20;
    startDIV.style.height = originalBoxSize * guideTextSize;

    //Arrows  
    for (let i = 0; i < 4; i++) { 
        let arrowDIV = document.getElementById('arrow' + str(i));
        let pos = getPosition(i);
        arrowDIV.style.left = (pos[0] * arrowX) + boxX + totalOffsetX;
        arrowDIV.style.top = (pos[1] * arrowY) + boxY + totalOffsetY;
        arrowDIV.style.width = arrowX;
        arrowDIV.style.height = arrowY;
        arrowDIV.style.display = 'none';
    }
}

function preRender() {
    //Pre-render boxes, arrows and leave/replay symbol
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

window.addEventListener('orientationchange', function () { window.location.href = "index.html"; }); //Reload on orientation change

//////////////////////////////////////////////
/* --------------------------------------
 DRAW CYCLE
 -------------------------------------- */
//////////////////////////////////////////////
function draw() {
    background(bg);
    translate(totalOffsetX, totalOffsetY);

    // Update time since sketch started drawing
    let currentDrawTime;

    if (!loadingComplete) {
        //Loading message until all relevant data is pre-loaded
        textSize(welcomeTextSize);
        textStyle(NORMAL);
        textFont(digitalFont);
        strokeWeight(0.6 * strength);
        let loadingText = str(int(100 * loadingCount / numberOfContent));
        text(loadingText + '% loaded', 1.5 * boxX - textWidth(loadingText), 1.5 * boxY);
        if (loadingCount >= numberOfContent) {
            loadingComplete = true;
            preRender();
        }
    }
    else if (round < 0) {
    //Welcome stage
    displayWelcomeSection();
    } else if (round < 10) {
        //Game stage
        //Get sketches for next round 
        if (nextRound) {
            currentDrawTime = 0; // set current draw time to 0
            if (round < 10) { //The game is played over 10 rounds   
                newRound(artistNumbers[round], soundNumbers[round]);
            }
            nextRound = false;
            sketchStage = true;
        } else if (sketchStage) {  
          //This is the sketching stage where a participant looks at all the sketches being drawn

            //Make sure that the sound is paused at starttime 0s before playing  
            if (sounds[soundNumbers[round]].paused && sounds[soundNumbers[round]].currentTime == 0) {
                sounds[soundNumbers[round]].muted = false; //Unmute it   
                sounds[soundNumbers[round]].play();
            }

            //Only start drawing when sound is playing and not muted   
            let timePassed = 0;
            if (!sounds[soundNumbers[round]].muted && sounds[soundNumbers[round]].currentTime > 0) {
                timePassed = millis() - drawStartTime;
            }
            else {
                resetTimes();
            }
            currentDrawTime = timePassed;

        } else if (evalStage) {
            //This is the stage where the participants sees if their choice was correct
            sounds[soundNumbers[round]].pause(); //Make sure sound is paused
            currentDrawTime = -1; //-1 means that the sketches are displayed entirely

            if (evalStartTime == 0) {
                evalStartTime = millis();
            }
            let currentEvalTime = millis() - evalStartTime;

            if (correctAnswer) { // Draw checkmark for correct answer  
                drawSketch(symbols[2], 8 * currentEvalTime, strength, colour, boxX + arrowX, boxY + arrowY, arrowScaler);
            } else { // Draw X for wrong answer
                write('X', 8 * currentEvalTime, strength, colour, boxX + arrowX, boxY + arrowY, arrowScaler);
            }

            if (evalTime < currentEvalTime) {
                evalStage = false;
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
            
            if (sketchStage || evalStage) {
                displayArrows(i, bold);
                displaySketch(allPaths[i], currentDrawTime, strength, colour, boxScaler, i);
            }
            else if (nextRound) {
                displayArrows(i, bold); // to avoid the arrows shortly disappearing before the next round  
            }
            displayBoxes(i);
        }
        displayGuideText();
    } else if (round == 10) {
        //End of Game/Data submission 
        displaySubmissionSection();

        if (displayScores) {
            round = 11;
            barChart = renderScoresChart(2 * boxX, boxY);
        }

    } else if (round == 11) {
        //Show bar chart and link to survey
        displayResultSection();
    }

    //Reset mouse clicked flag 
    clicked = false;

}
////////////////////////////////////////////// 
/* --------------------------------------
 EXTRA FUNCTIONS
 -------------------------------------- */
//////////////////////////////////////////////

/* --------------------------------------
 SEQUENCE
 -------------------------------------- */

//Game rounds
//Display stage 
function getInstance(time) { //The 4 sketches are played one after the other
    return Math.floor(time / drawingTime);
}

// Evaluation stage
function evaluateSelection(selected) {
    evalStage = true; //Go to evaluation stage
    sketchStage = false;
    allAnswers.push(soundOptions[selected]); //Save all anwsers in an array for data submission
    selectedIndex = selected;
    if (selectedIndex == correctIndex) {
        correctAnswer = true;
    } else {
        correctAnswer = false;
    }
}

//Display the welcome/tutorial section   
function displayWelcomeSection() {
    let writeText = "Seeing Sounds, Hearing Shapes";
    write(writeText, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - writeText.length), guideTextSize * originalBoxSize, guideTextSize);

    //Short explanation
    textSize(welcomeTextSize);
    textStyle(NORMAL);
    textFont(digitalFont);
    strokeWeight(0.6*strength);
    text('Welcome to our interactive web-app. Test your abilitiy to match sounds \nand drawings! We asked 28 people to draw their visual interpretation\nof 10 different sounds. Can you find the right drawing for each sound?', boxX + originalBoxSize * guideTextSize * 0.5 * (10 - writeText.length), 4 * guideTextSize * originalBoxSize);

    //Tutorial gif
    //The gif is displayed with html, overlaying the canvas   
    document.getElementById("tutorialGif").style.display = "block";

    //Start the game   
    writeText = "Click here to start!";
    if (cursorPos(boxX + originalBoxSize * guideTextSize * 0.5 * (10 - writeText.length) + totalOffsetX, 2.5 * boxY - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * writeText.length, originalBoxSize * guideTextSize, cursorX, cursorY)) {
        write(writeText, -1, 2 * strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - writeText.length), 2.5 * boxY - guideTextSize * originalBoxSize, guideTextSize);
        if (clicked) { //Start game

        }
    } else { //Normal line strength        
        write(writeText, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - writeText.length), 2.5 * boxY - guideTextSize * originalBoxSize, guideTextSize);
    }
}

function startGame() {
    prepareSound(-1);
    document.getElementById("tutorialGif").style.display = "none"; //Hide tutorial gif  
    document.getElementById('startbutton').style.display = 'none';
    document.getElementById('replaybutton').style.display = 'block';
    for (let i = 0; i < 4; i++) {
        document.getElementById('arrow' + str(i)).style.display = 'block';
    }
    round++;
    nextRound = true;
    
}

//Display data submission section
function displaySubmissionSection() {
    //State the final score
    text = "Your final score is";
    write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), boxY - guideTextSize * originalBoxSize, guideTextSize);
    text = str(score);
    write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), boxY + guideTextSize * originalBoxSize, guideTextSize);

    //Ask to submit data
    text = "Click here to continue!";
    if (cursorPos(boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length) + totalOffsetX, 2 * boxY - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * text.length, originalBoxSize * guideTextSize, cursorX, cursorY)) {
        write(text, -1, 2 * strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY - guideTextSize * originalBoxSize, guideTextSize);
        if (clicked) { //Submit data
            document.getElementById('popup').style.display = 'block';
        }

    } else { //Normal line strength    
        write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY - guideTextSize * originalBoxSize, guideTextSize);
    }
}

function displayResultSection() {
    //Show results 
    let text = 'Your score compared to others';
    write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 0.5 * boxY - guideTextSize * originalBoxSize, guideTextSize);
    image(barChart, 0.5 * boxX, 0.75 * boxY, 2 * boxX, boxY);
    text = 'Click here to take our survey!';

    if (cursorPos(boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length) + totalOffsetX, 2.5 * boxY - guideTextSize * originalBoxSize + totalOffsetY, originalBoxSize * guideTextSize * text.length, originalBoxSize * guideTextSize, cursorX, cursorY)) {
        write(text, -1, 2 * strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2.5 * boxY - guideTextSize * originalBoxSize, guideTextSize);
        if (clicked) { //Open survey in new tab 
            window.open('https://docs.google.com/forms/d/e/1FAIpQLScxFumFff7jsFit_NlvFxyuQEITVgyleScShpGHR8YFPlMFcQ/viewform?entry.463010215=' + userID, '_blank');
        }
    } else { //Normal line strength
        write(text, -1, strength, colour, boxX + originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2.5 * boxY - guideTextSize * originalBoxSize, guideTextSize);
    }
}

/* --------------------------------------
 PREPARING NEXT SKETCH
 -------------------------------------- */
function newRound(artistNumber, playSound) {
    allPaths = []; //Reset allPath array
    resetTimes();

    //sound = new Audio('audio/sound' + str(playSound + 1) + '.mp3');

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

/*
 * This function return the sound numbers that the displayed sketches correlate with.
 * The sounds are determined by dissimiliarty measures (eucledian distance between normalised
 * audio feature vectors, see study 1 analysis Jupyter notebook for more info)
 */ 

function getSoundNumbers(sound) {
    let array = [];

    switch (sound) {
        case 0:
            array = [0, 9, 1, 4];
            break;
        case 1:
            array = [1, 8, 7, 5];
            break;
        case 2:
            array = [2, 6, 8, 5];
            break;
        case 3:
            array = [3, 9, 6, 5];
            break;
        case 4:
            array = [4, 9, 7, 5];
            break;
        case 5:
            array = [5, 7, 1, 4];
            break;
        case 6:
            array = [6, 7, 3, 5];
            break;
        case 7:
            array = [7, 9, 8, 5];
            break;
        case 8:
            array = [8, 6, 7, 5];
            break;
        case 9:
            array = [9, 7, 8, 5];
            break;
        default:
            array = [0, 0, 0, 0];
            break;
    }

    array = shuffleArray(array); //Randomise order

    correctIndex = array.indexOf(sound); //correct Index is a global variable
    return array;
}

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

    if (bold || (cursorPos(posX + totalOffsetX, posY + totalOffsetY, arrowX, arrowY, cursorX, cursorY) && sketchStage)) {
        image(renderedBoldArrows[boxNumber], posX, posY, arrowX, arrowY);
        if (clicked && round >= 0 && round < 10) { //if mouse has been clicked, do something    
            evaluateSelection(boxNumber); //evaluate selection 
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


// Plot a bar chart for the scores distribution 
function renderScoresChart(width, height) {

    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    let sum = displayScores.reduce(reducer); //sum of all scores

    let barWidth = width / (displayScores.length + 1); //Plus 1 for one barwidth margin on the left
    let offsetX = barWidth;
    let textSize = offsetX * 0.2 * 1.7;
    let offsetY = 1.1 * textSize;
    let chartHeight = height - 3 * offsetY;
    let pg = createGraphics(int(width + 1), int(height + textSize + 1)); //Add textsize to height so that the x-axis label does not get cut off
    pg.fill(0);

    pg.textFont(digitalFont);
    pg.textSize(textSize);
    pg.strokeWeight(strength);
    pg.line(offsetX, offsetY, offsetX, chartHeight + offsetY); //Y-axis

    //Y-axis labels
    for (let i = 0; i < 4; i++) {
        let yPos = chartHeight * i * 0.25 + offsetY;
        pg.line(0.95 * offsetX, yPos, 1.05 * offsetX, yPos);
        pg.text(str(100 - i * 25) + '%', 0, yPos);
    }

    for (let i = 0; i < displayScores.length; i++) {
        let barHeight = 0;
        if (sum > 0) {
            barHeight = -chartHeight * (displayScores[i] / sum);
        }
        if (i == score) {
            pg.fill(0);
            pg.textStyle(BOLD);
        }
        else {
            pg.noFill();
            pg.textStyle(NORMAL);
        }
        pg.rect(offsetX + barWidth * i, offsetY + chartHeight, barWidth, barHeight); //Boxes   
        pg.fill(0);
        pg.text(str(i), offsetX + barWidth * (i + 0.5) - 0.5 * pg.textWidth(str(i)), chartHeight + 2 * offsetY); //Box labels
    }

    pg.text('Scores', offsetX + 0.5 * (width - offsetX) - 0.5 * pg.textWidth('Scores'), chartHeight + 3 * offsetY); //X-axis label

    return pg;
}

/* --------------------------------------
 WRITE TEXT
 -------------------------------------- */
//Display guide text
function displayGuideText() {
    //Positioning for the text is chosen so that it centres vertically and horizontially 
    //Text about which round we are in (bottom left corner)
    let text = "Round";
    write(text, -1, strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), 2 * boxY + guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    text = str(Math.min(10, round + 1)) + " of 10";
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
            console.log('Restarting the app');
            window.location.href = "index.html";
        }

    } else { //Normal line strength  
        image(renderedSymbols[1], originalBoxSize * guideTextSize * 0.5 * (10 - 2), guideTextMargin, 2 * guideTextSize * originalBoxSize, 2 * guideTextSize * originalBoxSize);
        write(text, -1, strength, colour, originalBoxSize * guideTextSize * 0.5 * (10 - text.length), guideTextMargin - guideTextSize * originalBoxSize, guideTextSize);
    }
}

/* --------------------------------------
 HANDLE SOUNDS
 -------------------------------------- */

function prepareSound(round) {
    //Hide/display relevant invisible buttons, so nothing gets clicked accidently  
    if (round == 9) {
        document.getElementById('replaybutton').style.display = 'none';
        for (let i = 0; i < 4; i++) {
            document.getElementById('arrow' + str(i)).style.display = 'none';
        }
    }
    if (round >= 0 && round < 10) {
        sounds[soundNumbers[round]].pause() //Stop current sound from playing
    }
    if (round >= -1 && round < 9) {
        //This play pause construct is needed for the sound to work on mobile
        let nextSound = sounds[soundNumbers[round + 1]]; //Get next sound   
        nextSound.muted = true;
        let playPromise = nextSound.play();
        if (playPromise !== undefined) { //Wait for sound to start playing before pausing to avoid error   
            playPromise.then(_ => {
                nextSound.pause();
                nextSound.currentTime = 0; //Rewind sound 
                }
            )
            playPromise.catch(error => { alert(error.message) });
        }
    }
}

//Replay sounds and redraw sketches
function replay(playSound) {
    if (round < 10 && round >= 0 && sketchStage) {
        resetTimes();
        sounds[playSound].pause(); //Stop sound
        sounds[playSound].currentTime = 0; //Reset sound  
    }
}


/* --------------------------------------
 RESET TIMES
 -------------------------------------- */
function resetTimes() {
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
        if (sketchStage) { //Only allow this during the sketch stage 
            if ((key == 'r' || key == 'R') && round < 10 && round >= 0) {
                replay(soundNumbers[round]);
                cursorX = 0; //This is necessary, otherwhise hover does not work if you use keyboard input 
                cursorY = 0;
            }

            if (keyCode === LEFT_ARROW || keyCode === UP_ARROW || keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW) {
                prepareSound(round); //Prepare sound for next round
                cursorX = 0; //This is necessary, otherwhise hover does not work if you use keyboard input 
                cursorY = 0;
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
        //Go to the last round, uncomment if needed
        //round = 9;
    }
}

function mousePressed() {
    clicked = true;
    cursorX = mouseX;
    cursorY = mouseY;
}

function mouseMoved() {
    cursorX = mouseX;
    cursorY = mouseY;

}

function touchStarted() {
    clicked = true;
    cursorX = mouseX;
    cursorY = mouseY;
}

function touchEnded() {
    cursorX = -1;
    cursorY = -1;
}


/* --------------------------------------
 CREATE COOKIE AND SUBMIT DATA
 -------------------------------------- */
function acceptSubmission(accept) {

    if (accept) {
        document.getElementById('popup').innerHTML = "Please wait. Your data is being submitted...";
        userID = submitData(score, allAnswers, soundNumbers, artistNumbers);
        setCookie(userID);
    }
    else {
        window.location.href = "index.html";
    }
    document.getElementById('popup').style.display = 'none';

}

function setCookie(key) {
    let exdays = 7;
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "UserID=" + key + ";" + "SameSite=none;" + "Secure=true" + expires + ";" + "path=/"; //Remember user key so that multiple submissions can be marked
}

function submitData(score, answers, order, artists) {

    //The database 
    let db = firebase.database();
    let key = getCookie("UserID"); //Check for user key in cookie
    let newUser = true;
    if (key) {
        newUser = false;
    }
    //Retrieve score data  
    db.ref('scores').once('value').then(function (snapshot) {
        let scores = snapshot.val();
        //save scores in global variable to display them  
        displayScores = scores;

        //Update score data on firebase if no cookie was found     
        if (this.updateScore) {
            let scoreUpdate = {};
            scoreUpdate['/scores/' + str(this.score)] = displayScores[this.score] + 1;
            this.db.ref().update(scoreUpdate);
        }
    }.bind({ score: score, db: db, updateScore: newUser })); //.bind passes additional arguments to firebase promise callback function

    if (newUser) { //If no cookie is found, create new UserID and submit data 
        //Create new key     
        key = db.ref('participants').push().key;


        //Get browser and device data
        let browser = [
            { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
            { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
            { name: 'Safari', value: 'Safari', version: 'Version' },
            { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
            { name: 'Opera', value: 'Opera', version: 'Opera' },
            { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
            { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
        ]

        let os = [
            { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
            { name: 'Windows', value: 'Win', version: 'NT' },
            { name: 'iPhone', value: 'iPhone', version: 'OS' },
            { name: 'iPad', value: 'iPad', version: 'OS' },
            { name: 'Kindle', value: 'Silk', version: 'Silk' },
            { name: 'Android', value: 'Android', version: 'Android' },
            { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
            { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
            { name: 'Macintosh', value: 'Mac', version: 'OS X' },
            { name: 'Linux', value: 'Linux', version: 'rv' },
            { name: 'Palm', value: 'Palm', version: 'PalmOS' }
        ]

        let header = [
            navigator.platform,
            navigator.userAgent,
            navigator.appVersion,
            navigator.vendor,
            window.opera
        ];

        let agent = header.join(' ');
        os = matchItem(agent, os);
        browser = matchItem(agent, browser);


        //Submit data
        db.ref('participants/' + key).set({
            score: score,
            answers: answers,
            sound_order: order,
            artist_order: artists,
            browser: browser,
            operating_system: os
        });
    }
    return key;
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}

//Parse browser data
function matchItem(string, data) {
    var i = 0,
        j = 0,
        html = '',
        regex,
        regexv,
        match,
        matches,
        version;

    for (i = 0; i < data.length; i += 1) {
        regex = new RegExp(data[i].value, 'i');
        match = regex.test(string);
        if (match) {
            regexv = new RegExp(data[i].version + '[- /:;]([\d._]+)', 'i');
            matches = string.match(regexv);
            version = '';
            if (matches) { if (matches[1]) { matches = matches[1]; } }
            if (matches) {
                matches = matches.split(/[._]+/);
                for (j = 0; j < matches.length; j += 1) {
                    if (j === 0) {
                        version += matches[j] + '.';
                    } else {
                        version += matches[j];
                    }
                }
            } else {
                version = '0';
            }
            return {
                name: data[i].name,
                version: parseFloat(version)
            };
        }
    }
    return { name: 'unknown', version: 0 };
}


