/* ScienceGenius - an addon for SMART Notebook(R)
* Copyright (C) 2016 Omid Fakourfar and SMART Technologies
* This source code is licensed under a permissive open source license.
* See the LICENSE file for full license text. */

// Do we have the track name in sessionStorage? Default: No (starting from scratch)
var returningTrack = false;

/*
// 1. Rhyming dictionary auto-suggestion: Whenever the user types a line in the textarea, s/he will get rhyming suggestions based on the last word in line.
// 2. Syllabus count
*/
document.getElementById("lyrics").onkeyup = function(e){
  if(e.keyCode == 13){
    var lines = document.getElementById("lyrics").value.split('\n');
    var line = lines[lines.length - 2];
    var words = line.split(' ');
    var lastWord = words[words.length - 1];
    document.getElementById("RhymeBrainInput").value = lastWord;
    RhymeBrainSubmit();
  }
  var textarea = document.getElementById("lyrics");
  document.getElementById("lineNo").innerHTML = "Line number: " + textarea.value.substr(0, textarea.selectionStart).split("\n").length;
  var text = document.getElementById("lyrics").value.split('\n');
  var thisLine = text[text.length - 1];
  thisLine = thisLine.toLowerCase();
  if (thisLine.length <= 3 && thisLine.length > 0)
    thisLine = 1;
  else if (thisLine.length == 0){
    thisLine = 0;
    return 0;
  }
  else{
    thisLine = thisLine.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    thisLine = thisLine.replace(/^y/, '');
    thisLine = thisLine.match(/[aeiouy]{1,2}/g).length;
  }
  var count = thisLine;
  document.getElementById("sylCount").innerHTML = "Number of syllabus: " + count;
};

/*
// When the user clicks on any line in the textarea, the value for "syllabus count" will be updated with that line's syllabus count.
*/
function textClick(){
  var textarea = document.getElementById("lyrics");
  var lineNo = textarea.value.substr(0, textarea.selectionStart).split("\n").length;
  document.getElementById("lineNo").innerHTML = "Line number: " + lineNo;
  var text = document.getElementById("lyrics").value.split('\n');
  var thisLine = text[lineNo - 1];
  thisLine = thisLine.toLowerCase();
  if (thisLine.length <= 3 && thisLine.length > 0)
    thisLine = 1;
  else if (thisLine.length == 0){
    thisLine = 0;
    return 0;
  }
  else{
    thisLine = thisLine.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    thisLine = thisLine.replace(/^y/, '');
    thisLine = thisLine.match(/[aeiouy]{1,2}/g).length;
  }
  var count = thisLine;
  document.getElementById("sylCount").innerHTML = "Number of syllabus: " + count;
}

/*
// Play button event listener. Plays the track and disables the Play button.
*/
function play() {
  document.getElementById("aud-source").play();
  document.getElementById("playBtn").disabled = true;
}

/*
// Pause button event listener. Pauses the track and enables the Play button.
*/
function pause() {
  document.getElementById("aud-source").pause();
  document.getElementById("playBtn").disabled = false;
}

/*
// Stop button event listener. Stops the track and resets the time to 0, enables the Play button.
*/
function stop() {
  document.getElementById("aud-source").pause();
  document.getElementById("aud-source").currentTime = 0;
  document.getElementById("playBtn").disabled = false;
}

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

/*
// Time seek styling
*/
function updateTime() {
  var player = document.getElementById("aud-source");
  var minutes = Math.floor(player.currentTime / 60);
  var seconds = Math.floor(player.currentTime - minutes * 60);
  var durMin = Math.floor(player.duration / 60);
  var durSec = Math.floor(player.duration - durMin * 60);
  var curTime = str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
  var durTime = str_pad_left(durMin,'0',2)+':'+str_pad_left(durSec,'0',2);
  document.getElementById("tracktime").innerHTML = curTime + " / " + durTime;
}

/*
// Track Selection Change: User chooses desired track from the drop-down menu, the track plays automatically.
// If the user has come from next pages (for editing, etc.), "returningTrack" will be "True"; thus, the track will not play automatically.
*/
function selectionChange(){
  var selected = document.getElementById("trackSelect").value;
  document.getElementById("aud-source").setAttribute("src", "./mp3/"+selected);
  document.getElementById("playBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = false;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("tracktime").style.visibility = "visible";
  document.getElementById("submit").disabled = false;
  if (!returningTrack)
    play();
}

/*
// When returning to this page (for editing, etc.), this function retrieves the lyrics from sessionStorage and puts them in the textarea.
// It also selects the desired track in the dropdown menu.
*/
function loadLyrics(){
  document.getElementById("submit").disabled = true;
  if (sessionStorage.getItem("plainLyrics") !== null)
    document.getElementById("lyrics").value = sessionStorage.plainLyrics;
  if (sessionStorage.getItem("trackName") !== null){
    returningTrack = true;
    document.getElementById(JSON.parse(sessionStorage.trackName)).selected = true;
    selectionChange();
    returningTrack = false;
  }
}

/*
// Submit the query to RhymeBrain dictionary.
*/
function doRhyme(){
  RhymeBrainSubmit();
}

/*
// Home button event handler: Clears the sessionStorage and all the pages. Re-starts the add-on.
*/
function home(){
  sessionStorage.clear();
  deleteAllPages();
  window.location.href = "./index.html";
}

/*
// Deletes all NB pages.
*/
function deleteAllPages(){
  var pages = NB.document.getPages();
  for (id in pages){
    pagetoDel = NB.document.getPage(NB.document.getCurrentPageId());
    NB.document.deletePage(pagetoDel);
  }
}

/*
// Submits the data in this page and navigates to the "Time Stamp" step.
// - Stores lyrics (plain and line-by-line) in sessionStorage.
// - Puts a "." for empty lines to make sure the add-on runs properly on NB'16 (NB'16 ignores whitespace-only texts)
// - Stores track name in sessionStorage.
*/
function submit(){
  var enteredText = document.getElementById("lyrics").value;
  var updatedText = enteredText.replace(/\r?\n/g, '<br />');
  document.getElementById("lyricsDiv").innerHTML = updatedText;
  
  sessionStorage.plainLyrics = enteredText;
  sessionStorage.lyricsStorage = updatedText;

  var array = enteredText.split(/\n/);
  for (var i = 0; i < array.length; i++){
    if(array[i] === "")
      array[i] = ".";
  }
  array = JSON.stringify(array);
  sessionStorage.lyricsArray = array;

  var selectedTrack = document.getElementById("trackSelect").value;
  selectedTrack = JSON.stringify(selectedTrack);
  sessionStorage.trackName = selectedTrack;
  window.location.href = "./stamp.html";
}