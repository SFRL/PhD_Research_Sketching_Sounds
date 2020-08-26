
/* --------------------------------------
 HANDLE RAW DRAWING DATA FOR SKETCHES AND INTERFACE
 -------------------------------------- */
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

/* --------------------------------------
 DRAW A SKETCH
 -------------------------------------- */
function drawSketch(data, time, strength, colour, offsetX, offsetY, scale) {

  for (let i = 0; i < data.length; i++) {

    let dots = data[i];
    noFill();
    beginShape();
    for (let j=0; j<dots.length; j++) {

      let dotTime = dots[j].time;
      if (time > dotTime || time<0) { //immediatelely display whole sketch if a new sound was selected
        if (dots[j].x > strength && dots[j].x < originalBoxSize-strength && dots[j].y > strength && dots[j].y < originalBoxSize-strength) {
          stroke(colour);
          strokeWeight(strength);
          vertex(dots[j].x*scale+offsetX, dots[j].y*scale+offsetY);
        }
      }
    }
    endShape();
  }
}

/* --------------------------------------
 PRE-RENDER DRAWING DATA AND SAVE AS GRAPHICS OBJECT
 -------------------------------------- */
function renderSketch(data, strength, colour, scale) {
  let pg = createGraphics(scale*originalBoxSize, scale*originalBoxSize);

  for (let i = 0; i < data.length; i++) {
    let dots = data[i];
    pg.noFill();
    pg.beginShape();
    for (let j=0; j<dots.length; j++) {
      if (dots[j].x >= 0 && dots[j].x <= originalBoxSize && dots[j].y >= 0 && dots[j].y <= originalBoxSize) {
        pg.stroke(colour);
        pg.strokeWeight(strength);
        pg.vertex(dots[j].x*(scale-(2*strength)/originalBoxSize)+strength, dots[j].y*(scale-(2*strength)/originalBoxSize)+strength);
      }
    }
    pg.endShape();
  }
  return pg;
}

function renderBoxes(data, strength, colour, scale) {

  let pg = createGraphics(scale*originalBoxSize, scale*originalBoxSize);
  
  //Outline of the box
  pg.fill(255);
  pg.beginShape();
  for (let i = 0; i < data.length; i++) {
    let dots = data[i];
    for (let j=0; j<dots.length; j++) {
      if (dots[j].x >= 0 && dots[j].x <= originalBoxSize && dots[j].y >= 0 && dots[j].y <= originalBoxSize) {
        pg.stroke(255);
        pg.strokeWeight(strength);
        pg.vertex(dots[j].x*(scale-(2*strength)/originalBoxSize)+strength, dots[j].y*(scale-(2*strength)/originalBoxSize)+strength);
      }
    }
  }
  pg.vertex(0, data[data.length-1][data[data.length-1].length-1].y*(scale-(2*strength)/originalBoxSize)+strength);
  pg.vertex(0, scale*originalBoxSize);
  pg.vertex(scale*originalBoxSize, scale*originalBoxSize);
  pg.vertex(scale*originalBoxSize, 0);
  pg.vertex(data[0][0].x*(scale-(2*strength)/originalBoxSize)+strength, 0);
  pg.endShape(CLOSE);
  
  pg.beginShape();
  pg.vertex(0,0);
  pg.vertex(data[0][0].x*(scale-(2*strength)/originalBoxSize)+strength, 0);
  pg.vertex(pg.vertex(data[0][0].x*(scale-(2*strength)/originalBoxSize)+strength),data[0][0].y*(scale-(2*strength)/originalBoxSize)+strength);
  pg.vertex(data[data.length-1][data[data.length-1].length-1].x*(scale-(2*strength)/originalBoxSize)+strength, data[data.length-1][data[data.length-1].length-1].y*(scale-(2*strength)/originalBoxSize)+strength);
  pg.vertex(0, data[data.length-1][data[data.length-1].length-1].y*(scale-(2*strength)/originalBoxSize)+strength);
  pg.endShape(CLOSE);
  
  //Transparent inside of the box
  pg.noFill();
  pg.beginShape();
  for (let i = 0; i < data.length; i++) {
    let dots = data[i];
    for (let j=0; j<dots.length; j++) {
      if (dots[j].x >= 0 && dots[j].x <= originalBoxSize && dots[j].y >= 0 && dots[j].y <= originalBoxSize) {
        pg.stroke(colour);
        pg.strokeWeight(strength);
        pg.vertex(dots[j].x*(scale-(2*strength)/originalBoxSize)+strength, dots[j].y*(scale-(2*strength)/originalBoxSize)+strength);
      }
    }
  }
  pg.endShape(CLOSE);
  return pg;
}


/* --------------------------------------
 WRITE TEXT IN CUSTOM FONT
 -------------------------------------- */
function write(string, time, strength, colour, offsetX, offsetY, scale) {
  let chars = string.split('');
  for (let i=0; i<chars.length; i++) {
    if (chars[i] != ' ') { //Only draw something if there is no space
      drawSketch(font[chars[i]], time, strength, colour, offsetX+originalBoxSize*scale*i, offsetY, scale);
    }
  }
}

/* --------------------------------------
 DOT CLASS
 -------------------------------------- */
class dot {
  constructor(x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time;
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
