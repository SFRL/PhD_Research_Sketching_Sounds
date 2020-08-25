

let currentContent = 0; //Which number of content is currently active
let numberOfSounds = 10; //Total Number of diffeent sounds
let order = [] //array holding the random order of the sounds

// Initialize Firebase

var config = {
    apiKey: "AIzaSyB0hCRQiEMe6IHuIjDdh0vufIMDaG9xyag",
    authDomain: "chatbotdatabase-da33b.firebaseapp.com",
    databaseURL: "https://chatbotdatabase-da33b.firebaseio.com",
    projectId: "chatbotdatabase-da33b",
    storageBucket: "chatbotdatabase-da33b.appspot.com",
    messagingSenderId: "510893789563"
};
firebase.initializeApp(config);

//Setup study page
function studySetup() {
    randomOrder();
    createSurvey();
    nextContent();
}

//Randomise the order of the sounds
function randomOrder() {

    //Fill order array progressively
    for (let i = 1; i <= numberOfSounds; i++) {
        order.push(i);
        order.push(i);
    }

    order = shuffleArray(order);
    console.log(order);
}

//Function to shuffle an array
function shuffleArray(array) {

    //Randomise order but make sure that no two adjecent elements are the same

    for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        let randomIndex;     
        let adjecentIndex = currentIndex + 1;
        if (currentIndex == array.length - 1) {
            adjecentIndex = currentIndex;
        }

        //Repeat until the current and next element are not the same
        do {
            randomIndex = Math.floor(Math.random() * currentIndex);
        }
        while (array[randomIndex] == array[adjecentIndex]);

  
        let tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue
    }
    //Check that 0 and 1 element are not the same and if they are swap 0 and last element

    if (array[0] == array[1]) {
        let tempValue = array[0];
        array[0] = array[array.length - 1];
        array[array.length - 1] = tempValue;
    }
    return array;
}

function createSurvey() {

    //----------------------------------------------------------------------------------------
    //GoldMSI
    //----------------------------------------------------------------------------------------
    let goldQuestions = ["I am able to judge whether someone is a good singer or not.",
                            "I usually know when I'm hearing a song for the first time.",
                            "I find it difficult to spot mistakes in a performance of a song even if I know the tune.",
                            "I can compare and discuss differences between two performances or versions of the same piece of music.",
                            "I have trouble recognizing a familiar song when played in a different way or by a different performer.",
                            "I can tell when people sing or play out of time with the beat.",
                            "I can tell when people sing or play out of tune.",
                            "When I sing, I have no idea whether I'm in tune or not.",
                            "When I hear a music piece, I can usually identify its genre."
    ]

    
    
    for (let i = 0; i < 8; i++) {
        let idName = "GoldMSI" + i; //Currently last question in the survey
        let question = document.getElementById(idName); //Get the DOM
        let questionCopy = question.cloneNode(true); //Clone it
        let newId = i + 1; 
        questionCopy.id = "GoldMSI" + newId; //Give it a new ID

        let inputs = questionCopy.getElementsByTagName("INPUT");

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].name = "gold" + newId;
        }

        questionCopy.getElementsByClassName("buttonGroup")[0].innerHTML = goldQuestions[newId]; //Add text to it;
        question.parentNode.insertBefore(questionCopy, question.nextSibling); //Add it to the survey

    }

    document.getElementById("GoldMSI0").getElementsByClassName("buttonGroup")[0].innerHTML = goldQuestions[0];

    //----------------------------------------------------------------------------------------
    //Post-Study Content
    //----------------------------------------------------------------------------------------
    //Maybe needed again at later stage
    /*
    let postQuestions = [ "It was easy to draw the sounds that I have heard.",
                          "I think my drawings represent the sounds well.", 
                          "I used abstract concepts to draw the sounds.",
                          "I used literal concepts to draw the sounds.", 
                          "I used different concepts for different sounds."
    ]

    let postDescription = ["", "", "e.g. shapes and lines", "e.g. a piano for a piano sound or a smiley face for a pleasant sound",
                          "sometimes abstract and sometimes literal"

    ]

    for (let i = 0; i < 4; i++) {
        let idName = "post" + i; //Currently last question in the survey
        let question = document.getElementById(idName); //Get the DOM
        let questionCopy = question.cloneNode(true); //Clone it
        let newId = i + 1;
        questionCopy.id = "post" + newId; //Give it a new ID

        let inputs = questionCopy.getElementsByTagName("INPUT");

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].name = "post" + newId;
        }

        questionCopy.getElementsByClassName("buttonGroup")[0].innerHTML = postQuestions[newId]; //Add text to it
        questionCopy.getElementsByClassName("buttonGroup")[1].innerHTML = postDescription[newId]; //Add text to it

        question.parentNode.insertBefore(questionCopy, question.nextSibling); //Add it to the survey

    }

    document.getElementById("post0").getElementsByClassName("buttonGroup")[0].innerHTML = postQuestions[0];
    document.getElementById("post0").getElementsByClassName("buttonGroup")[1].innerHTML = postDescription[0];
    */
}
//Show next content on page
function nextContent() {
    let pages = document.getElementsByClassName("content");

    //Scroll back to top of page
    window.scrollTo(0, 0);

    //Make all content pages except for the current one invisible

    for (let i = 0; i < pages.length; i++) {
        let displayStyle = "none"; //change to none again later
        if (i == currentContent) {
            displayStyle = "block";
        }
        pages[i].style.display = displayStyle;
    }
    
    currentContent++; 

}

//Start the study
function startStudy() {

    //hide all instructions
    let instruction = document.getElementsByClassName("instruction");

    for (let i = 0; i < instruction.length; i++) {
        instruction[i].style.display = "none";
    }

    //display study elements

    let study = document.getElementsByClassName("study");

    for (let i = 0; i < study.length; i++) {
        study[i].style.display = "block";
    }

    //change the next button

    let button = document.getElementById("soundButton");
    button.innerHTML = "Next";
    button.onclick = nextSound;

    //get the sound running
    updateAudio(1);

    //delete what has been drawn so far
    dots = [];
    paths = [];

    //Reset time counter
    resetTime();
}

//Sketch next sound
function nextSound() {
    //Pause audio before next sound is loaded
    let audio = document.getElementById("audio");
    audio.pause();

    //Add id to path number
    paths.unshift(sets.length);

    //add all curent paths to sets array
     
    sets.push(paths);

    //reset paths and dots arrays
    dots = [];
    paths = [];

    //Get the number of sounds played so far
    let soundnumber = sets.length + 1;

    //Go to next page after all sounds have been played
    if (soundnumber > 2*numberOfSounds) {
        nextContent();
    }
    else {
        //Update Sound header

        document.getElementById("soundnumber").innerHTML = "Sound " + soundnumber;

        //Update audio source
        updateAudio(soundnumber);

    }

    //Reset time counter
    resetTime();

}

//Update audio source
function updateAudio(number) {
    let index = number - 1; //because array index starts at 0 but sound numbering starts at  1
    let soundName = "Audio/sound" + order[index] + ".mp3";
    let audio = document.getElementById("audio");

    document.getElementById("audioSource").src = soundName;

    //re-load audio element
    audio.load();
    audio.loop = true; 
    audio.play();

}


//Submit all survey forms at once
let messagesRef = firebase.database().ref();

function submit() {

    //Define length of data array, only ticked elements should count but ...elements.length gets the number of all elements
    let numberofelements = document.getElementById("survey").elements.length;
    let data = [];

    for (let i = 0; i < numberofelements; i++) {

        let currentItem = document.getElementById("survey").elements.item(i);

        if (currentItem.tagName == "TEXTAREA" || currentItem.tagName == "SELECT") {

            if (!currentItem.value) {
                data.push("-");
            }
            else {
                data.push(currentItem.value);
            }

        }
        else if (currentItem.type == "radio") {
            let k = 0;
            let checkedFlag = false;
            let nextItem = document.getElementById("survey").elements;

            while (nextItem.item(i + k) && currentItem.name == nextItem.item(i + k).name) {
                if (nextItem.item(i + k).checked == true) {
                    data.push(nextItem.item(i + k).value);
                    checkedFlag = true;
                }
                k++;
            }
            i = i + k - 1; //Skip all the other radio buttons that were already checked in the while loop above, 
            //substract 1 because the for loop will add 1 again at the ende of the cycle

            if (!checkedFlag) {
                data.push("-");

            }
        }
    }

    //Order all the data from Sound 1-10 
    let orderedSets = Array(sets.length);

    for (let i = 0; i < sets.length; i++) {
        let index = order[i] - 1;
        if (orderedSets[index]) {
            index += 10;
        }
        orderedSets[index] = sets[i];
    }

    data.push(orderedSets);
    data.push(order);

    //Adjust Gold MSI scores
    if (data[8] >= 0) { 
        data[8] = -1 * (data[8] - 6);
    }
    if (data[10] >= 0) {
        data[10] = -1 * (data[10] - 6);
    }
    if (data[13] >= 0) {
        data[13] = -1 * (data[13] - 6);
    }

    //Submit data to firebase
   
    let newMessageRef = messagesRef.push();
    newMessageRef.set({
        a_Consent: data[0],
        b_Gender: data[1],
        c_Age: data[2],
        d_Culture: data[3],
        e_Listening: data[4],
        f_Producing: data[5],
        g_Gold1: data[6],
        h_Gold2: data[7],
        i_Gold3: data[8],
        j_Gold4: data[9],
        k_Gold5: data[10],
        l_Gold6: data[11],
        m_Gold7: data[12],
        n_Gold8: data[13],
        o_Gold9: data[14],
        w_DrawingData: data[15],
        x_Order: data[16]

    });

    //Go to next page
    nextContent();


}

