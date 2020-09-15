let dots = [];
let paths = [];
let sets = [];
let startTime = 0;

//Colour and width of the drawing
let colour = 255;
let bg = 0;
let strength = 2;

//Setup Canvas

function setup() {
    let canvas = createCanvas(750, 750);
    background(bg);
    canvas.parent('sketchHolder');
}


//Draw the sketch on canvas
function draw() {
    background(bg);
    let l = 0;
    if (paths.length) {
        l = paths.length;
    }

    for (let j = 0; j <= l; j++) {
        let currentDots = paths[j];
        if (j == l) {
            currentDots = dots;
        }
        noFill();
        beginShape();
        for (let i = 0; i < currentDots.length; i++) {
            currentDots[i].display(strength,colour);
        }
        endShape();
    }


    for (let i = 0; i < dots.length; i++) {
        dots[i].display(strength,colour);
    }
}

//Get start time of this iteration:
function resetTime() {
    startTime = millis();
}

//Mouse Actions
function mousePressed() {
    dots = [];
}
function mouseDragged() {
    let birth = millis() - startTime;
    dots.push(new dot(birth, mouseX, mouseY));
}
function mouseReleased() {
    paths.push(dots);
}


//Class for drawing dots
class dot {

    constructor(time, x, y) {
        this.birthTime = time;
        this.x = x;
        this.y = y;
    }

    display(strength, colour) {
        stroke(colour);
        strokeWeight(strength);
        vertex(this.x, this.y);
    }
}





