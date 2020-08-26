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
let paths = [];
let lastPaths = [];

//Sound 
let sounds = [];
let soundNames = ['Crackles', 'Telephonic', 'Strings', 'String Grains', 'Subbass', 'Noise', 'Piano', 'Impact', 'Synth Guitar', 'E-Guitar'];
let nextSoundNumber, soundNumber, lastSoundNumber = -1;

// Navigationbar
let naviSize, naviX, naviY;
let renderedNaviIcons = [];
let renderedNaviIconsBold = [];

//Font
let font;
let artistTextSize;
let naviTextSize;
let welcomeTextSize;

// Sketch boxes
let boxes;
let renderedBoxes = [];
let originalBoxSize = 750;
let boxX, boxY;

//Positioning and scaling
let posOffset0, posOffset1, posOffset2, welcomeOffset;
let offsetX0, offsetY0, offsetX1, offsetY1, offsetX2, offsetY2, welcomeOffsetX, welcomeOffsetY;
let extraOffset = 0;
let sizeScaler;

//Times and duration
let drawingTime = 4500;
let startTime = 0;

//Sequence timing 
let welcomeFlag = true;
let nextSound = false;
let steps = 0;
let order = [0, 1, 2];
let pt, lastPt, nextPt = -1;

//Animation speed
let speed; 


// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  //Load drawing data
  drawingData = loadJSON("../data/drawing_data.json");

  //Load sounds
  for (let i = 0; i<10; i++) {
    sounds.push(new Audio('../audio/sound' + str(i+1) + '.mp3'));
  }
  font = loadJSON('../data/font.json');
  boxes = loadJSON('../data/boxes.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  sizing();
  preRender();
}

function sizing() {
  // Determine positioning and sizing of elements
  // |-0.1----0.1-----0.1-|

  let sideMargin = 0.1; //realative distance between boxes
  let topMargin = 0.06; //relative distance of free space above boxes
  let boxScaler = 0.5 * (1 - 3*sideMargin); //Scale the box size that contains the sketches 

  //Define the offsets for each drawing box
  offsetX0 = - windowWidth * boxScaler;
  offsetY0 = windowHeight * topMargin;

  offsetX1 = windowWidth * sideMargin;
  offsetY1 = windowHeight * topMargin;

  offsetX2 = windowWidth * (2*sideMargin+boxScaler);
  offsetY2 = windowHeight * topMargin;

  welcomeOffsetX = offsetX1;
  welcomeOffsetY = offsetY1;

  boxX = windowWidth * boxScaler;
  boxY = boxX;

  //Define the animation speed depending on the canvas box size
  speed = boxX/10;

  //Set size and positioning of the navigation menu
  naviSize = (2*boxX + sideMargin*windowWidth)/(10*originalBoxSize);
  naviX = offsetX1;
  naviY = 2*offsetY1 + boxY;

  //Define different textsizes 
  welcomeTextSize = boxX/(originalBoxSize*22); //25 is the length of the longest welcome text line including margin

  artistTextSize = topMargin; //Text size of the artist/artwork description above the paper, make sure that it is not longer than the paper 
  if (22*artistTextSize*originalBoxSize>boxX) { //22 is the maximum number of characters for the artist/artwrok description  (this happens if the artistnumber has 2 digets and "sound grains" has been selected for sound
    artistTextSize = boxX/(originalBoxSize*22);
  }

  naviTextSize = naviSize/13; //13 is the length of the longest sound name "sound grains" plus 1 character for margin

  //Center everything vertically
  let totalMargin = int(0.5*(windowHeight - (naviY+originalBoxSize*naviSize))); //relative distance of space from top of window 
  if (totalMargin > 0) { //If the overall height of the interface is smaller than the the window height, centre the interface 
    offsetY0+=totalMargin;
    offsetY1+=totalMargin;
    offsetY2+=totalMargin;
    welcomeOffsetY+=totalMargin;
    naviY+=totalMargin;
  }

  posOffset0 = createVector(offsetX0, offsetY0);
  posOffset1 = createVector(offsetX1, offsetY1);
  posOffset2 = createVector(offsetX2, offsetY2);
  welcomeOffset = createVector(welcomeOffsetX + steps*(boxX+sideMargin*windowWidth), welcomeOffsetY);

  sizeScaler = boxX/originalBoxSize; //Scale drawing size to canvas, subtract extraOffset to make sure that the drawing is always within the frame
  strength = windowWidth/700; //Drawing strength depends on window size, the number 700 was determined empirically
}

function preRender() {
  //Render boxes and navigation icons in the beginning to save computing power
  for (let i=0; i<10; i++) {
    renderedNaviIcons.push(renderSketch([...font[str(i)], ...boxes[i]], strength, colour, naviSize*0.7));
    renderedNaviIconsBold.push(renderSketch([...font[str(i)], ...boxes[i]], strength*2, colour, naviSize*0.7));
    renderedBoxes.push(renderBoxes(boxes[i], strength, colour, sizeScaler));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sizing();
  preRender();
}

function draw() { 
  background(bg);

  //Animation of boxes moving 
  if (nextSound) {
    moveBoxes();
  }

  // Update time since sketch started drawing    
  let currentTime;
  if (nextSound) {
    currentTime = -1; // -1 is used to disregard time
  } else {
    currentTime = millis() - startTime;
  }

  //Welcome screen in the beginning
  if (steps<2) {
    showWelcomeText(millis()*2, strength, colour, welcomeOffset.x, welcomeOffset.y, welcomeTextSize);
  }   

  //Next Sketch
  drawSection([], nextPt, nextSoundNumber, 0, -1, strength, colour, posOffset0.x, posOffset0.y, sizeScaler, artistTextSize);

  //Current Sketch
  drawSection(paths, pt, soundNumber, 1, currentTime, strength, colour, posOffset1.x, posOffset1.y, sizeScaler, artistTextSize);

  //Last Sketch
  drawSection(lastPaths, lastPt, lastSoundNumber, 2, -1, strength, colour, posOffset2.x, posOffset2.y, sizeScaler, artistTextSize);

  //Navigation bar at the bottom
  navigation();
}


/* --------------------------------------
 DISPLAY NAVIGATION BAR
 -------------------------------------- */
function navigation() {  
  for (let i=0; i<10; i++) {
    j = i-1;
    if (i==0) {
      j = 9;
    }
    if (i == nextSoundNumber && (!sounds[i].paused || nextSound)) {
      image(renderedNaviIconsBold[i], naviX+originalBoxSize*naviSize*(j+0.15), naviY);
    } else {
      image(renderedNaviIcons[i], naviX+originalBoxSize*naviSize*(j+0.15), naviY);
    }

    let centreText = originalBoxSize*0.5*(naviSize - soundNames[i].length * naviTextSize);
    write(soundNames[i], -1, strength, colour, naviX+originalBoxSize*naviSize*j+centreText, naviY+naviSize*0.72*originalBoxSize, naviTextSize);
  }
}

/* --------------------------------------
 ANIMATION OF BOXES MOVING TO THE RIGHT
 -------------------------------------- */
function moveBoxes() {
  //Move boxes to the right as long as they haven't reached their next position
  if (posOffset1.x < offsetX2) {
    posOffset0.set(posOffset0.x+speed, posOffset0.y);
    posOffset1.set(posOffset1.x+speed, posOffset1.y);
    posOffset2.set(posOffset2.x+speed, posOffset2.y);
    if (steps<2) {
      welcomeOffset.set(welcomeOffset.x+speed, welcomeOffset.y);
    }
    //If boxes reach next position, update position data and order
  } else {
    //Re-order paper images
    for (let i=0; i<order.length; i++) {
      order[i]--;
      if (order[i] < 0) {
        order[i] = 2;
      }
    }
    posOffset0.set(offsetX0, offsetY0);
    posOffset1.set(offsetX1, offsetY1);
    posOffset2.set(offsetX2, offsetY2);

    //Count number of sounds that have been played so far
    steps++;
    //Only update the welcome text position until it is moved to the right out of sight
    if (steps<3) {
      welcomeOffset.set(welcomeOffsetX + steps*(offsetX2-offsetX1), welcomeOffsetY);
    }

    //Update artist,drawing data and sound number
    lastPt = pt;
    lastPaths = paths;
    pt = nextPt;
    paths = [];      
    lastSoundNumber = soundNumber;
    soundNumber = nextSoundNumber; //Get the number of the sound that has been selected

    nextSound = false; //nexSound flag set to false until next sound is selected
    newSound();
  }
}

/* --------------------------------------
 START PLAYING AND DRAWING A NEW SOUND
 -------------------------------------- */
function newSound() {
  paths = []; //Reset path
  sounds[soundNumber].play();       
  let raw_paths = [];
  raw_paths = getDrawingData(pt, soundNumber, drawingData); //Get path data    
  let l = raw_paths.length;
  // Update timing info
  startTime = millis(); //Get time when this sketch was started
  let startTimeOffset = raw_paths[0][2][0]; //Get the drawing time at which the first sketch
  let timeScaler = drawingTime/(raw_paths[l-1][2][raw_paths[l-1][2].length - 1] - startTimeOffset); //Scale drawing time so that it always takes the same amount of time
  for (let i=0; i<l; i++) {
    let path = [];
    let x = raw_paths[i][0];
    let y = raw_paths[i][1];
    let time = raw_paths[i][2];
    //Fill path array with new path data
    for (let j=0; j<x.length; j++) {        
      let normalisedTime = (time[j] - startTimeOffset) * timeScaler;
      path.push(new dot(x[j], y[j], normalisedTime));
    }
    paths.push(path);
  }
}

//Prepare for the next sound to be played
function prepareSound() {
  if (soundNumber >= 0) {
      sounds[soundNumber].pause(); //Stop playing the old sound
      sounds[soundNumber].currentTime = 0; //Rewind sound
  }
  nextSound = true; //The next sound will be initiliased in the next draw cycle  
  nextPt = str(Math.floor(random(56))); //Get random participant for that sound number
  if (nextPt==47 && nextSoundNumber==9) { //This sketch is empty so chose a different participant
    nextPt=48;
  }
}

/* --------------------------------------
 DRAW A SECTION OF THE INTERFACE (BOX, ARTIST+SOUND DESCRIPTION AND SKETCH)
 -------------------------------------- */
function drawSection(data, artistNumber, soundNumber, boxNumber, time, strength, colour, offsetX, offsetY, scale, textSize) {
  //Current Sketch

  //Display participant number
  if (artistNumber>=0) {
    artistNumber = int(artistNumber/2)+1;
    write("Artist" + str(artistNumber) + "-" + soundNames[soundNumber], -1, strength, colour, offsetX, offsetY-textSize*originalBoxSize, textSize);
  }
  // Draw the sketch
  drawSketch(data, time, strength, colour, offsetX, offsetY, scale);

  // Draw box  
  image(renderedBoxes[order[boxNumber]], offsetX, offsetY, boxX, boxY);
}


/* --------------------------------------
 WRITE TEXT IN CUSTOM FONT
 -------------------------------------- */
//Welcome message when webpage is first accessed
function showWelcomeText(time, strength, colour, offsetX, offsetY, scale) {
  let margin = 2; //number of characters as margin
  //write("Hello World", -1, strength, colour, offset, scale);
  write("Welcome", time, 2*strength, colour, offsetX+margin*scale*originalBoxSize, offsetY+margin*scale*originalBoxSize, scale);
  write("Press number key", time, strength, colour, offsetX+margin*scale*originalBoxSize, offsetY+(margin+3)*scale*originalBoxSize, scale);
  write("or", time, strength, colour, offsetX+margin*scale*originalBoxSize, offsetY+(margin+5)*scale*originalBoxSize, scale);
  write("click number field", time, strength, colour, offsetX+margin*scale*originalBoxSize, offsetY+(margin+7)*scale*originalBoxSize, scale);
  write("to start", time, strength, colour, offsetX+margin*scale*originalBoxSize, offsetY+(margin+9)*scale*originalBoxSize, scale);
}

/* --------------------------------------
 HANDLE KEY AND MOUSE INPUTS
 -------------------------------------- */
function keyPressed() {
  //When numbber key is pressed display new sketch
  if (isFinite(key)) {
    nextSoundNumber = int(key); //Save pressed key for the next sound to be played
    prepareSound();
  }
}

function mousePressed() {
  //When someone clicks one of the key symbols sound is played
  if (mouseY>=naviY && mouseY<=naviY+naviSize*originalBoxSize) {
    let mousePos = Math.floor((mouseX-naviX)/(originalBoxSize*naviSize));
    if (mousePos>=0 && mousePos<=9) {
      nextSoundNumber = (mousePos+1)%10;     
      prepareSound();
    }
  }
}


//Text (Maybe display again later
/*
  push();
 textSize(10);
 noFill();
 stroke(0);
 strokeWeight(0.5);
 rotate(HALF_PI);
 translate(5, -windowWidth+10);
 text('Seeing sounds, hearing shapes - Sebastian Lobbers 2020', 0, 0);
 pop();
 */
