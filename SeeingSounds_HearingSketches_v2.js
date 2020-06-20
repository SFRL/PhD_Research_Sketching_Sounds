//General data
canvasX = 750;
canvasY = 750;
fr = 30; //Framerate

let drawingData = {}; // Global object to hold results from the loadJSON call

//Drawing parameters
let bg = 255;
let colour = 0;
let strength = 2;

//Drawing data and flats
let paths = [];
let lastPaths = [];

//Sound Files
let sounds = [];
let nextSoundNumber, soundNumber, lastSoundNumber = -1;

// Time stamps
let offset = 0;
let drawingTime = 4500;
let startTime = 0;

// Navigationbar
let white = [];
let black = [];
let naviSize, naviX, naviY;

//Images
let welcome;
let artist;
let paper = [];
let numbers = [];
let soundNames = [];

//Animation
let posOffset0, posOffset1, posOffset2, welcomeOffset;
let offsetX0, offsetY0, offsetX1, offsetY1, offsetX2, offsetY2, welcomeOffsetX, welcomeOffsetY;
let extraOffset = 5;
let speed = 20;
let sizeScaler;
let welcomeFlag = true;
let nextSound = false;
let steps = 0;
let order = [0, 1, 2];
let pt, lastPt, nextPt = -1;
let textHeight;

// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  //Load drawing data
  data = loadJSON("drawing_data.json");
  //Load sounds and images
  soundFormats('mp3');
  for (let i = 0; i<10; i++) {
    sounds.push(loadSound('audio/sound' + str(i+1)));
    white.push(loadImage('images/' + str(i) + 'white.png'));
    black.push(loadImage('images/' + str(i) + 'black.png'));
    numbers.push(loadImage('images/' + str(i) + '.png'));
    soundNames.push(loadImage('images/Sound' + str(i) + '.png'));
  }


  //Load welcome message, artist and paper
  welcome = loadImage('images/welcome.png');
  artist = loadImage('images/artist.png');
  for (let i=0; i<3; i++) {
    paper.push(loadImage('images/box' + str(i+1) + '.png'));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  sizing();
}

function sizing() {
  // Determine positioning and sizing of elements
  // |-0.06----0.06-----0.06-|

  let margin = 0.1;
  let topmargin = 0.06;
  let canvas = 0.5 * (1 - 3*margin);

  textHeight = topmargin * windowHeight;

  offsetX0 = - windowWidth * canvas;
  offsetY0 = windowHeight * topmargin;

  offsetX1 = windowWidth * margin;
  offsetY1 = windowHeight * topmargin;

  offsetX2 = windowWidth * (2*margin+canvas);
  offsetY2 = windowHeight * topmargin;

  welcomeOffsetX = offsetX1;
  welcomeOffsetY = offsetY1;

  canvasX = windowWidth * canvas;
  canvasY = canvasX;

  speed = canvasX/10;

  naviSize = (2*canvasX + margin*windowWidth)/10;
  naviX = offsetX1;
  naviY = 2*offsetY1 + canvasY;

  //Center everything vertically
  let totalMargin = int(0.5*(windowHeight - (naviY+naviSize))); 
  if (totalMargin > 0) {
    offsetY0+=totalMargin;
    offsetY1+=totalMargin;
    offsetY2+=totalMargin;
    welcomeOffsetY+=totalMargin;
    naviY+=totalMargin;
  }

  posOffset0 = createVector(offsetX0, offsetY0);
  posOffset1 = createVector(offsetX1, offsetY1);
  posOffset2 = createVector(offsetX2, offsetY2);
  welcomeOffset = createVector(welcomeOffsetX + steps*(canvasX+margin*windowWidth), welcomeOffsetY);

  sizeScaler = (canvasX-2*extraOffset)/750.0; //Scale drawing size to canvas, subtract extraOffset to make sure that the drawing is always within the frame
  strength = windowWidth/700; //Drawing strength depends on window size
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sizing();
}

function draw() {

  //Animation of papers moving 
  let currentTime = 0;

  if (nextSound) {
    currentTime = drawingTime + 1000;
    if (posOffset1.x < offsetX2) {
      posOffset0.set(posOffset0.x+speed, posOffset0.y);
      posOffset1.set(posOffset1.x+speed, posOffset1.y);
      posOffset2.set(posOffset2.x+speed, posOffset2.y);
      if (steps<2) {
        welcomeOffset.set(welcomeOffset.x+speed, welcomeOffset.y);
      }
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
      steps++;
      if (steps<3) {
        welcomeOffset.set(welcomeOffsetX + steps*(offsetX2-offsetX1), welcomeOffsetY);
      }
      lastPt = pt;
      lastPaths = paths;
      pt = nextPt;
      paths = [];      
      lastSoundNumber = soundNumber;
      soundNumber = nextSoundNumber; //Get the number of the sound that has been selected

      nextSound = false;
      newSound();
    }
  }

  // Update time since sketch started drawing
  currentTime = millis() - startTime;

  background(bg);

  //Text
  push();
  textSize(10);
  noFill();
  stroke(0);
  strokeWeight(0.5);
  //textAlign(RIGHT,BOTTOM);
  rotate(HALF_PI);
  translate(5, -windowWidth+10);
  text('Seeing sounds, hearing shapes - Sebastian Lobbers 2020', 0, 0);
  pop();

  //Welcome screen in the beginning
  if (steps<2) {
    image(welcome, welcomeOffset.x, welcomeOffset.y, canvasX, canvasY);
  }


  //Paper to the left out of sight
  image(paper[order[0]], posOffset0.x, posOffset0.y, canvasX, canvasY);
  //Display next participant number
  if (nextPt>=0) {
    let nextArtist = int(nextPt/2)+1;
    push();    
    translate(posOffset0.x, posOffset0.y-textHeight);
    image(artist, 0, 0, 2*textHeight, textHeight);
    image(numbers[int(nextArtist/10)], 2*textHeight, 0, 0.4*textHeight, textHeight);
    image(numbers[nextArtist%10], 2*textHeight+0.4*textHeight, 0, 0.3*textHeight, textHeight);
    image(soundNames[nextSoundNumber], 2*textHeight+0.8*textHeight, 0, 4*textHeight, textHeight);
    pop();
  }


  //Current Sketch
  // Draw canvas  
  image(paper[order[1]], posOffset1.x, posOffset1.y, canvasX, canvasY);
  //Display participant number
  if (pt>=0) {
    let currentArtist = int(pt/2)+1;
    push();    
    translate(posOffset1.x, posOffset1.y-textHeight);
    image(artist, 0, 0, 2*textHeight, textHeight);
    image(numbers[int(currentArtist/10)], 2*textHeight, 0, 0.4*textHeight, textHeight);
    image(numbers[currentArtist%10], 2*textHeight+0.4*textHeight, 0, 0.3*textHeight, textHeight);
    image(soundNames[soundNumber], 2*textHeight+0.8*textHeight, 0, 4*textHeight, textHeight);
    pop();
  }
  // Draw the sketch
  for (let i = 0; i < paths.length; i++) {
    let dots = paths[i];
    noFill();
    beginShape();
    for (let j=0; j<dots.length; j++) {           
      let dotTime = dots[j].time;
      if (currentTime > dotTime || nextSound) { //immediatelely display whole sketch if a new sound was selected
        if (dots[j].position.x >= 0 && dots[j].position.x <= 750 && dots[j].position.y >= 0 && dots[j].position.y <= 750) {
          dots[j].display(strength, colour, posOffset1, sizeScaler);
        }
      }
    }
    endShape();
  }

  //Last Sketch
  //Draw canvas
  if (steps>0) { //Only display if at least one sound was played
    image(paper[order[2]], posOffset2.x, posOffset2.y, canvasX, canvasY);
  }

  //Display participant number
  if (lastPt>=0) {
    let lastArtist = int(lastPt/2)+1;
    push();    
    translate(posOffset2.x, posOffset2.y-textHeight);
    image(artist, 0, 0, 2*textHeight, textHeight);
    image(numbers[int(lastArtist/10)], 2*textHeight, 0, 0.4*textHeight, textHeight);
    image(numbers[lastArtist%10], 2*textHeight+0.4*textHeight, 0, 0.3*textHeight, textHeight);
    image(soundNames[lastSoundNumber], 2*textHeight+0.8*textHeight, 0, 4*textHeight, textHeight);
    pop();
  }
  // Draw last sketch
  for (let i = 0; i < lastPaths.length; i++) {
    let dots = lastPaths[i];
    noFill();
    beginShape();
    for (let j=0; j<dots.length; j++) {           
      if (dots[j].position.x >= 0 && dots[j].position.x <= 750 && dots[j].position.y >= 0 && dots[j].position.y <= 750) {
        dots[j].display(strength, colour, posOffset2, sizeScaler);
      }
    }
    endShape();
  }

  //Navigation bar at the bottom
  let barheight = 0.2 * (naviY - (offsetY1 + canvasY));
  for (let i=0; i<10; i++) {
    j = i-1;
    if (i==0) {
      j = 9;
    }
    if (i == nextSoundNumber && (sounds[i].isPlaying() || nextSound)) {
      fill(0);
      strokeWeight(0);
      rect(naviX+naviSize*j, naviY-barheight, naviSize, barheight);
      rect(naviX+naviSize*j, naviY+naviSize, naviSize, barheight);
      image(black[i], naviX+naviSize*j, naviY, naviSize, naviSize);
    } else {
      image(white[i], naviX+naviSize*j, naviY, naviSize, naviSize);
    }
  }
}

function getDrawingData(pt, snd) {
  let currentSnd = data[snd];
  let currentData = currentSnd[pt];
  return currentData;
}

function newSound() {
  paths = []; //Reset path
  sounds[soundNumber].play();       
  let raw_paths = [];
  raw_paths = getDrawingData(pt, soundNumber); //Get path data    
  let l = raw_paths.length;
  // Update timing info
  startTime = millis(); //Get time when this sketch was started
  offset = raw_paths[0][2][0]; //Get the drawing time of the first sketch
  let timeScaler = drawingTime/(raw_paths[l-1][2][raw_paths[l-1][2].length - 1] - offset); //Scale drawing time so that it always takes the same amount of time
  for (let i=0; i<l; i++) {
    let path = [];
    let x = raw_paths[i][0];
    let y = raw_paths[i][1];
    let time = raw_paths[i][2];      
    for (let j=0; j<x.length; j++) {        
      let normalisedTime = (time[j] - offset) * timeScaler;
      path.push(new dot(createVector(x[j], y[j]), normalisedTime));
    }
    paths.push(path);
  }
}

function keyPressed() {
  //When key is pressed display new sketch
  if (isFinite(key)) {    
    if (soundNumber >= 0) {
      sounds[soundNumber].stop();
    }
    nextSound = true; //The next sound will be initiliased in the next draw cycle
    nextSoundNumber = int(key); //Save pressed key for the next sound to be played
    nextPt = str(Math.floor(random(56))); //Get random participant for that sound number
    if (nextPt==47 && nextSoundNumber==9) { //This sketch is empty so chose a different participant
     nextPt=48;  
    }
  }
}

//Class for drawing dots
class dot {

  constructor(pos, time) {
    this.position = pos;
    this.time = time;
    this.done = false;
  }

  display(strength, colour, posOffset, scale) {
    stroke(colour);
    strokeWeight(strength);
    vertex(this.position.x*scale + posOffset.x + extraOffset, this.position.y*scale + posOffset.y + extraOffset); //Add extraOffset to make sure that drawing is always in frame
  }
}
