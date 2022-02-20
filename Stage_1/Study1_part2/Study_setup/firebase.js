// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
    apiKey: "AIzaSyCYE7retrgRBE9cE7OzJOp-0lGbFUwZtqI",
    authDomain: "phd-studies-eddd5.firebaseapp.com",
    databaseURL: "https://phd-studies-eddd5.firebaseio.com/",
    storageBucket: "phd-studies-eddd5.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service

let messagesRef = firebase.database().ref();
let newMessageRef = messagesRef.push();
newMessageRef.set({
test: "hello word"

});
