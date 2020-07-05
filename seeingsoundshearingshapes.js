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
let naviSize, naviX, naviY;
let renderedNaviIcons;
let renderedNaviIconsBold;

//custom font
let font;
let artistTextSize;
let naviTextSize;

/*
let upperCase = [];
 let lowerCase = [];
 let minus, plus;
 */

let boxes;
let renderedBoxes;

let rawboxes = [];


let paper = [];
let soundNames = [];

//Animation
let posOffset0, posOffset1, posOffset2, welcomeOffset;
let offsetX0, offsetY0, offsetX1, offsetY1, offsetX2, offsetY2, welcomeOffsetX, welcomeOffsetY;
let extraOffset = 50;
let speed = 20;
let sizeScaler;
let welcomeFlag = true;
let nextSound = false;
let steps = 0;
let order = [0, 1, 2];
let pt, lastPt, nextPt = -1;


// Put any asynchronous data loading in preload to complete before "setup" is run
function preload() {
  //Load drawing data
  drawingData = loadJSON("data/drawing_data.json");

  //Load sounds
  soundFormats('mp3');
  for (let i = 0; i<10; i++) {
    sounds.push(loadSound('audio/sound' + str(i+1)));
    //rawboxes.push(loadJSON('data/box' + str(i+1) + '.json'));
  }
  font = loadJSON('data/font.json');
  boxes = loadJSON('data/boxes.json');
  /*
  for (let i = 0; i<26; i++) {
   lowerCase.push(loadJSON('data/s' + str(i) + '.json'));
   upperCase.push(loadJSON('data/L' + str(i) + '.json'));
   }
   
   minus = loadJSON('data/minus.json');
   plus = loadJSON('data/plus.json');
   */
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  sizing();
  preRender();

  soundNames = ['Crackles', 'Telephonic', 'Strings', 'String Grains', 'Subbass', 'Noise', 'Piano', 'Impact', 'Synth Guitar', 'E-Guitar'];

  //makeBoxes();
  //makeFont();
}

function sizing() {
  // Determine positioning and sizing of elements
  // |-0.06----0.06-----0.06-|

  let margin = 0.1; //realative distance between papers
  let topmargin = 0.06; //relative distance of free space above papers
  let canvas = 0.5 * (1 - 3*margin);

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

  artistTextSize = topmargin; //Text size of the artist/artwork description above the paper, make sure that it is not longer than the paper 
  if (22*artistTextSize*750>canvasX) { //22 is the maximum number of characters for the artist/artwrok description  (this happens if the artistnumber has 2 digets and "sound grains" has been selected for sound
    artistTextSize = canvasX/(750*22);
  }

  naviSize = (2*canvasX + margin*windowWidth)/(10*750);
  naviX = offsetX1;
  naviY = 2*offsetY1 + canvasY;

  naviTextSize = naviSize/13;

  //Center everything vertically
  let totalMargin = int(0.5*(windowHeight - (naviY+750*naviSize))); //relative distance of space from top of window 
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
  welcomeOffset = createVector(welcomeOffsetX + steps*(canvasX+margin*windowWidth), welcomeOffsetY);

  sizeScaler = (canvasX)/750.0; //Scale drawing size to canvas, subtract extraOffset to make sure that the drawing is always within the frame
  strength = windowWidth/700; //Drawing strength depends on window size
}

function preRender() {
  renderedNaviIcons = [];
  renderedNaviIconsBold = [];
  renderedBoxes = [];
  
  for (let i=0; i<10; i++) {
    renderedNaviIcons.push(renderSketch([...font[str(i)], ...boxes[i]], strength, colour, naviSize*0.7));
    renderedNaviIconsBold.push(renderSketch([...font[str(i)], ...boxes[i]], strength*2, colour, naviSize*0.7));
    renderedBoxes.push(renderSketch(boxes[i],strength,colour,sizeScaler));
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sizing();
  preRender();
}

function draw() {
  //Animation of papers moving 
  if (nextSound) {
    //currentTime = drawingTime + 1000;
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
  let currentTime;
  if (nextSound) {
    currentTime = -1; // -1 is used to disregard time
  } else {
    currentTime = millis() - startTime;
  }

  background(bg);

  //Text
  push();
  textSize(10);
  noFill();
  stroke(0);
  strokeWeight(0.5);
  rotate(HALF_PI);
  translate(5, -windowWidth+10);
  text('Seeing sounds, hearing shapes - Sebastian Lobbers 2020', 0, 0);
  pop();

  //Welcome screen in the beginning
  if (steps<2) {
    //image(welcome, welcomeOffset.x, welcomeOffset.y, canvasX, canvasY);
  }   


  //Next Sketch
  drawSection([], nextPt, nextSoundNumber, 0, -1, strength, colour, posOffset0, sizeScaler, artistTextSize);

  //Current Sketch
  drawSection(paths, pt, soundNumber, 1, currentTime, strength, colour, posOffset1, sizeScaler, artistTextSize);

  //Last Sketch
  drawSection(lastPaths, lastPt, lastSoundNumber, 2, -1, strength, colour, posOffset2, sizeScaler, artistTextSize);

  //Navigation bar at the bottom
  for (let i=0; i<10; i++) {
    j = i-1;
    if (i==0) {
      j = 9;
    }

    if (i == nextSoundNumber && (sounds[i].isPlaying() || nextSound)) {
      image(renderedNaviIconsBold[i], naviX+750*naviSize*(j+0.15), naviY);
    } else {
      image(renderedNaviIcons[i], naviX+750*naviSize*(j+0.15), naviY);
    }

    let centreText = 750*0.5*(naviSize - soundNames[i].length * naviTextSize);
    write(soundNames[i], -1, strength, colour, createVector(naviX+750*naviSize*j+centreText, naviY+naviSize*0.72*750), naviTextSize);
  }
}

function getDrawingData(pt, snd, data) {
  let currentSnd = data[snd];
  let currentData = currentSnd[pt];
  return currentData;
}

function getInterfaceData(data) {
  let l = 0;
  //Get length of JSON object
  while (data[l]) {
    l++;
  }
  let sketch = [];

  for (let i=0; i<l; i++) {
    let raw_path = data[i];
    let path = [];    
    for (let j=0; j<raw_path.length; j++) {        

      path.push(new dot(raw_path[j].x, raw_path[j].y, raw_path[j].time));
    }
    sketch.push(path);
  }
  return sketch;
}

function newSound() {
  paths = []; //Reset path
  sounds[soundNumber].play();       
  let raw_paths = [];
  raw_paths = getDrawingData(pt, soundNumber, drawingData); //Get path data    
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
      path.push(new dot(x[j]*(1-extraOffset/750)+0.5*extraOffset, y[j]*(1-extraOffset/750)+0.5*extraOffset, normalisedTime));
    }
    paths.push(path);
  }
}

function drawSection(data, artistNumber, soundNumber, boxNumber, time, strength, colour, offset, scale, textSize) {
  //Current Sketch
  // Draw canvas  
  image(renderedBoxes[order[boxNumber]], offset.x, offset.y, canvasX, canvasY);
  //Display participant number
  if (artistNumber>=0) {
    artistNumber = int(artistNumber/2)+1;
    write("Artist" + str(artistNumber) + "-" + soundNames[soundNumber], -1, strength, colour, createVector(offset.x, offset.y-textSize*750), textSize);
  }
  // Draw the sketch
  drawSketch(data, time, strength, colour, offset, scale);
}


function drawSketch(data, time, strength, colour, offset, scale) {

  for (let i = 0; i < data.length; i++) {

    let dots = data[i];
    noFill();
    beginShape();
    for (let j=0; j<dots.length; j++) {

      let dotTime = dots[j].time;
      if (time > dotTime || time<0) { //immediatelely display whole sketch if a new sound was selected
        if (dots[j].x >= 0 && dots[j].x <= 750 && dots[j].y >= 0 && dots[j].y <= 750) {
          stroke(colour);
          strokeWeight(strength);
          vertex(dots[j].x*scale+offset.x, dots[j].y*scale+offset.y);
        }
      }
    }
    endShape();
  }
}

function renderSketch(data, strength, colour, scale) {

  let pg = createGraphics(scale*750, scale*750);

  for (let i = 0; i < data.length; i++) {
    let dots = data[i];
    pg.noFill();
    pg.beginShape();
    for (let j=0; j<dots.length; j++) {

      if (dots[j].x >= 0 && dots[j].x <= 750 && dots[j].y >= 0 && dots[j].y <= 750) {
        pg.stroke(colour);
        pg.strokeWeight(strength);
        pg.vertex(dots[j].x*(scale-(2*strength)/750)+strength, dots[j].y*(scale-(2*strength)/750)+strength);
      }
    }
    pg.endShape();
  }
  return pg;
}


function prepareSound() {
  if (soundNumber >= 0) {
    sounds[soundNumber].stop();
  }
  nextSound = true; //The next sound will be initiliased in the next draw cycle  
  nextPt = str(Math.floor(random(56))); //Get random participant for that sound number
  if (nextPt==47 && nextSoundNumber==9) { //This sketch is empty so chose a different participant
    nextPt=48;
  }
}

function write(string, time, strength, colour, offset, scale) {
  let chars = string.split('');
  for (let i=0; i<chars.length; i++) {
    if (chars[i] != ' ') { //Only draw something if there is no space
      drawSketch(font[chars[i]], time, strength, colour, createVector(offset.x+750*scale*i, offset.y), scale);
    }
  }
}

function keyPressed() {
  //When numbber key is pressed display new sketch
  if (isFinite(key)) {
    nextSoundNumber = int(key); //Save pressed key for the next sound to be played
    prepareSound();
  }
}

function mousePressed() {
  //When someone clicks one of the key symbols sound is played
  if (mouseY>=naviY && mouseY<=naviY+naviSize*750) {
    let mousePos = Math.floor((mouseX-naviX)/(750*naviSize));
    if (mousePos>=0 && mousePos<=9) {
      nextSoundNumber = (mousePos+1)%10;     
      prepareSound();
    }
  }
}




//Class for drawing dots
class dot {
  constructor(x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time;
  }

  display(strength, colour, posOffset, scale) {
    stroke(colour);
    strokeWeight(strength);
    vertex(this.x*scale + posOffset.x + extraOffset, this.y*scale + posOffset.y + extraOffset); //Add extraOffset to make sure that drawing is always in frame
  }
}


function makeFont() {

  let font = {
  'A': 
  getInterfaceData(upperCase[0]), 
  'B': 
  getInterfaceData(upperCase[1]), 
  'C': 
  getInterfaceData(upperCase[2]), 
  'D': 
  getInterfaceData(upperCase[3]), 
  'E': 
  getInterfaceData(upperCase[4]), 
  'F': 
  getInterfaceData(upperCase[5]), 
  'G': 
  getInterfaceData(upperCase[6]), 
  'H': 
  getInterfaceData(upperCase[7]), 
  'I': 
  getInterfaceData(upperCase[8]), 
  'J': 
  getInterfaceData(upperCase[9]), 
  'K': 
  getInterfaceData(upperCase[10]), 
  'L': 
  getInterfaceData(upperCase[11]), 
  'M': 
  getInterfaceData(upperCase[12]), 
  'N': 
  getInterfaceData(upperCase[13]), 
  'O': 
  getInterfaceData(upperCase[14]), 
  'P': 
  getInterfaceData(upperCase[15]), 
  'Q': 
  getInterfaceData(upperCase[16]), 
  'R': 
  getInterfaceData(upperCase[17]), 
  'S': 
  getInterfaceData(upperCase[18]), 
  'T': 
  getInterfaceData(upperCase[19]), 
  'U': 
  getInterfaceData(upperCase[20]), 
  'V': 
  getInterfaceData(upperCase[21]), 
  'W': 
  getInterfaceData(upperCase[22]), 
  'X': 
  getInterfaceData(upperCase[23]), 
  'Y': 
  getInterfaceData(upperCase[24]), 
  'Z': 
  getInterfaceData(upperCase[25]), 
  'a': 
  getInterfaceData(lowerCase[0]), 
  'b': 
  getInterfaceData(lowerCase[1]), 
  'c': 
  getInterfaceData(lowerCase[2]), 
  'd': 
  getInterfaceData(lowerCase[3]), 
  'e': 
  getInterfaceData(lowerCase[4]), 
  'f': 
  getInterfaceData(lowerCase[5]), 
  'g': 
  getInterfaceData(lowerCase[6]), 
  'h': 
  getInterfaceData(lowerCase[7]), 
  'i': 
  getInterfaceData(lowerCase[8]), 
  'j': 
  getInterfaceData(lowerCase[9]), 
  'k': 
  getInterfaceData(lowerCase[10]), 
  'l': 
  getInterfaceData(lowerCase[11]), 
  'm': 
  getInterfaceData(lowerCase[12]), 
  'n': 
  getInterfaceData(lowerCase[13]), 
  'o': 
  getInterfaceData(lowerCase[14]), 
  'p': 
  getInterfaceData(lowerCase[15]), 
  'q': 
  getInterfaceData(lowerCase[16]), 
  'r': 
  getInterfaceData(lowerCase[17]), 
  's': 
  getInterfaceData(lowerCase[18]), 
  't': 
  getInterfaceData(lowerCase[19]), 
  'u': 
  getInterfaceData(lowerCase[20]), 
  'v': 
  getInterfaceData(lowerCase[21]), 
  'w': 
  getInterfaceData(lowerCase[22]), 
  'x': 
  getInterfaceData(lowerCase[23]), 
  'y': 
  getInterfaceData(lowerCase[24]), 
  'z': 
  getInterfaceData(lowerCase[25]), 
  '0': 
  getInterfaceData(numbers[0]), 
  '1': 
  getInterfaceData(numbers[1]), 
  '2': 
  getInterfaceData(numbers[2]), 
  '3': 
  getInterfaceData(numbers[3]), 
  '4': 
  getInterfaceData(numbers[4]), 
  '5': 
  getInterfaceData(numbers[5]), 
  '6': 
  getInterfaceData(numbers[6]), 
  '7': 
  getInterfaceData(numbers[7]), 
  '8': 
  getInterfaceData(numbers[8]), 
  '9': 
  getInterfaceData(numbers[9]), 
  '+': 
  getInterfaceData(plus), 
  '-': 
  getInterfaceData(minus)
};

print(font);
saveJSON(font, 'font.json', true);
}

function makeBoxes() {
  let newBoxes = [];
  for (let i=0; i<10; i++) {
    let oldBox = getInterfaceData(rawboxes[i]);
    let newBox = [];
    for (let j=0; j<oldBox.length; j++) {
      let newLength = int(oldBox[j].length/30);
      for (let k=0; k<newLength; k++) {
        newBox.push(oldBox[j][k*30]);
      }
    }
    newBox.push( {
    x: 
    newBox[0].x, y: 
    newBox[0].y, time: 
      newBox[newBox.length-1].time+100
    }
    );
    newBoxes.push([newBox]);
  }
  //print(newBoxes);
  saveJSON(newBoxes, 'boxes.json');
}
