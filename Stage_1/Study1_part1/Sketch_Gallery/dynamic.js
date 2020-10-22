let iterName = ["", "B"]; //Filename suffix for different iteration
let soundNames = ['Crackles', 'Telephonic', 'Strings', 'String Grains', 'Subbass', 'Noise', 'Piano', 'Impact', 'Processed Guitar', 'Electric Guitar']; //Names of the sound files
let invertColour = true;


function createNavigation() {
    //Create selection matrix for 28 participants
    let ptSelection = document.getElementById("ptSelection");
    for (let i = 0; i < 28; i++) {
        let container = document.createElement('DIV');
        let label = document.createElement("LABEL");
        let checkbox = document.createElement("INPUT");

        container.className = "checkbox-container";

        let labelText;
        if (i>8) {
            labelText = String(i+1);
        }
        else {
            labelText = '0' + String(i+1);
        }
        label.for = "ptCheckbox" + String(i+1);
        label.innerHTML = labelText;
        checkbox.type = "checkbox";
        checkbox.id = "ptCheckbox" + String(i + 1);
        checkbox.className = "ptCheckbox";
        checkbox.checked = true;
        checkbox.onchange = function () { showSketches() };
        container.appendChild(label);
        container.appendChild(checkbox);
        ptSelection.appendChild(container);
    }

    //Create selection matrix for 10 sounds
    let sndSelection = document.getElementById("sndSelection");
    for (let i = 0; i < 10; i++) {
        let container = document.createElement('DIV');
        let label = document.createElement("LABEL");
        let checkbox = document.createElement("INPUT");

        container.className = "checkbox-container";

        label.for = "sndCheckbox" + String(i + 1);
        let labelText;
        if (i>8) {
            labelText = String(i+1);
        }
        else {
            labelText = '0' + String(i+1);
        }
        label.innerHTML = labelText;
        checkbox.type = "checkbox";
        checkbox.id = "sndCheckbox" + String(i + 1);
        checkbox.className = "sndCheckbox";
        checkbox.checked = true;
        checkbox.onchange = function () { showSketches() };
        container.appendChild(label);
        container.appendChild(checkbox);

        sndSelection.appendChild(container);
    }

    showSketches();
}

function createAudioPlayers() {
    let soundbar = document.getElementById("sound-sidebar");


    for (let i=0; i<soundNames.length; i++) {
        let audioTag = document.createElement('AUDIO');
        audioTag.controls = "controls";

        let label = document.createElement('P');
        label.innerHTML = "Sound " + String(i+1) + " - " + soundNames[i];
        let audioPlayer = document.createElement('SOURCE');
        audioPlayer.src = "../Study_setup/Audio/sound" + String(i+1) + ".mp3";
        audioPlayer.type = "audio/mp3";
        audioTag.appendChild(audioPlayer);
        soundbar.appendChild(label);
        soundbar.appendChild(audioTag);
    }

    // THis is just hear so that the last audio element does not get cut off
    let end = document.createElement('P');
    end.style.height = "10px";
    soundbar.appendChild(end);
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

    //Get the width of each sketch
    let width = 7.5*document.getElementById("scaleSlider").value;

    //Create x label with participant numbers on top of table
    let xLabel = document.createElement("tr");
    //Start with a cell in the top left corner, it will be left empty
    let cornerCell = document.createElement('th');
    xLabel.appendChild(cornerCell);
    //Now fill the rest of the cells with the participant numbers
    for (let i=0; i<pt.length; i++) {
        for (let j=0; j<iter.length; j++) {
            let header = document.createElement('th');
            header.style.maxWidth = width;
            header.innerHTML = 'Part.' + String(pt[i]) + iterName[j];
            xLabel.appendChild(header);
        }    
    }
    sketchPanel.appendChild(xLabel);
    for (let i = 0; i<snd.length; i++) {
        //Create new table row
        let row = document.createElement("tr");

        //Create y label with sound names in the beginning of each row
        let yLabel = document.createElement('th');
        yLabel.className = "yLabel";
        yLabel.innerHTML = soundNames[snd[i] - 1];
        row.appendChild(yLabel);
        
        for (let j = 0; j < pt.length; j++) {
            for (let k = 0; k<iter.length; k++) {

                //Create new table cell
                let cell = document.createElement("td");
                cell.className = "sketchFigure";
                cell.id = "pt:" + pt[j] + "snd:" + snd[i] + "iter:" + iter[k];
                cell.style.width = width; //table cell cannot be wider than the image, don't grow cell if the labels are bigger
                cell.title = 'Participant: ' + pt[j] + iterName[iter[k]-1] + '\nSound: ' + snd[i] + ' (' + soundNames[snd[i]-1] + ')';

                //Create new image element that will display a sketch
                let img = document.createElement("img");
                let src = 'Sketches/Participant' + pt[j] + '/shape' + snd[i] + iterName[iter[k] - 1] + '.png'; 
                img.src = src;
                img.className = "sketchImage";
                let filter = "invert(0%)";
                if (invertColour) {
                    filter = "invert(100%)";
                }
                img.style.filter = filter;

                //Append image to cell and cell to row
                cell.appendChild(img);
                row.appendChild(cell);
            }
        }
        //Append row to table
        sketchPanel.appendChild(row);
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
    let cell = document.getElementsByTagName("td");
    let width = 7.5 * scaler;
    //Re-scale cells with images
    for (let i = 0; i < cell.length; i++) {
        cell[i].style.width = width;
    }
    //Rescale labels
    let xLabel = document.getElementsByClassName("xLabel");
    let yLabel = document.getElementsByClassName("yLabel");
    for (let i=0; i < xLabel.length; i++) {
        xLabel[i].style.maxWidth = width;
    }
    for (let i=0; i < yLabel.length; i++) {
        yLabel[i].style.maxHeight = width;
    }
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


function showWindow(id,display) {
    let element = document.getElementById(id);
    element.style.display = display;
}