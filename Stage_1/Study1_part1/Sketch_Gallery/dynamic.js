let iterName = ["", "B"]; //Filename suffix for different iteration
let soundNames = ['Crackles', 'Telephonic', 'Strings', 'String Grains', 'Subbass', 'Noise', 'Piano', 'Impact', 'Processed Guitar', 'Electric Guitar']; //Names of the sound files
let invertColour = false;


function createNavigation() {
    //Create selection matrix for 28 participants
    let ptSelection = document.getElementById("ptSelection");
    for (let i = 0; i < 28; i++) {
        let label = document.createElement("LABEL");
        let checkbox = document.createElement("INPUT");
        label.for = "ptCheckbox" + String(i + 1);
        label.innerHTML = String(i + 1);
        checkbox.type = "checkbox";
        checkbox.id = "ptCheckbox" + String(i + 1);
        checkbox.className = "ptCheckbox";
        checkbox.onchange = function () { showSketches() };
        ptSelection.appendChild(checkbox);
        ptSelection.appendChild(label);
    }

    //Create selection matrix for 10 sounds
    let sndSelection = document.getElementById("sndSelection");
    for (let i = 0; i < 10; i++) {
        let label = document.createElement("LABEL");
        let checkbox = document.createElement("INPUT");
        label.for = "sndCheckbox" + String(i + 1);
        label.innerHTML = String(i + 1);
        checkbox.type = "checkbox";
        checkbox.id = "sndCheckbox" + String(i + 1);
        checkbox.className = "sndCheckbox";
        checkbox.onchange = function () { showSketches() };
        sndSelection.appendChild(checkbox);
        sndSelection.appendChild(label);
    }
}

function showSketches() {
    //Delete sketches currently displayed
    let sketchPanel = document.getElementById("sketchPanel");
    while (sketchPanel.firstChild) {
        sketchPanel.removeChild(sketchPanel.firstChild);
    }

    //Get checked selection
    let pt = getCheckboxValues("ptCheckbox");
    let snd = getCheckboxValues("sndCheckbox");
    let iter = getCheckboxValues("iterCheckbox");

    for (let i = 0; i < pt.length; i++) {

        for (let j = 0; j < iter.length; j++) {
            let ptColumn = document.createElement("div");
            let scaler = document.getElementById("scaleSlider").value;
            ptColumn.className = "ptColumn";
            ptColumn.style.width = 750 / 100 * scaler;

            let xLabel = document.createElement("div");
            xLabel.className = "xLabel";
            xLabel.innerHTML = "Participant " + pt[i] + iterName[iter[j] - 1];
            ptColumn.appendChild(xLabel);

            for (let k = 0; k < snd.length; k++) {
                //Display new sketch images
                let sketchFigure = document.createElement('div');
                sketchFigure.className = "sketchFigure";
                sketchFigure.id = "pt:" + pt[k] + "snd:" + snd[k] + "iter:" + iter[j];
                sketchFigure.onmouseover = function () { showSketchInfo(this.id) };
                let sketchImage = document.createElement("img");
                let src = 'Sketches/Participant' + pt[i] + '/shape' + snd[k] + iterName[iter[j] - 1] + '.png';
                sketchImage.src = src;
                sketchImage.className = "sketchImage";
                let filter = "invert(0%)";
                if (invertColour) {
                    filter = "invert(100%)";
                }
                sketchImage.style.filter = filter;

                //Create yLabels in first column
                if (i == 0 && j == 0) {
                    let yLabel = document.createElement("div");
                    yLabel.className = "yLabel";
                    yLabel.innerHTML = soundNames[snd[k] - 1];
                    sketchFigure.appendChild(yLabel);
                }

                sketchFigure.appendChild(sketchImage);
                ptColumn.appendChild(sketchFigure);
            }
            document.getElementById("sketchPanel").appendChild(ptColumn);
        }
    }
}

function getCheckboxValues(className) {
    //Get values from checkboxes
    let checkboxes = document.getElementsByClassName(className);
    let selection = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selection.push(checkboxes[i].id.replace(/^\D+/g, ''));
        }
    }
    return selection;
}

function selectAll(select, className) {
    //Get the relevant checkboxes
    let checkboxes = document.getElementsByClassName(className);

    //Either check or uncheck all checkboxes, depending on the boolean value of 'select'
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = select;
    }

    //Update displayed sketches
    showSketches();
}

function scaleSketches(scaler) {
    let ptColumns = document.getElementsByClassName("ptColumn");
    for (let i = 0; i < ptColumns.length; i++) {
        ptColumns[i].style.width = 750 / 100 * scaler;
    }
}

function showSketchInfo(id) {
    //Parse id 
    let info = id.match(/\d+/g);
    document.getElementById("ptInfo").innerHTML = "Participant: " + info[0];
    document.getElementById("sndInfo").innerHTML = "Sound: " + info[1];
}

function setColour() {
    invertColour = !invertColour;
    let filter = "invert(0%)";
    if (invertColour) {
        filter = "invert(100%)";
    }
    let images = document.getElementsByClassName("sketchImage");
    for (let i = 0; i < images.length; i++) {
        images[i].style.filter = filter;
    }
}