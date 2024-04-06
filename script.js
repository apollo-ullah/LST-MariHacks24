var recognition = new webkitSpeechRecognition() || new SpeechRecognition(); // Prefix may be needed depending on the browser

recognition.continuous = true; // Set the recognition to continuous mode

// Variable to track the state of speech recognition
var isListening = false;

// Update the language of the recognition
function updateLanguage() {
    recognition.lang = document.getElementById("inputLang").value;
}

// Toggle speech recognition on and off
function toggleRecognition() {
    if (isListening) {
        recognition.stop();
        document.querySelector('.pulsating-circle').style.animationPlayState = 'paused';
        console.log("Voice recognition stopped.");
    } else {
        updateLanguage(); // Update language each time before starting
        recognition.start();
        document.querySelector('.pulsating-circle').style.animationPlayState = 'running';
        console.log("Voice recognition started. Speak into the microphone.");
    }
    // Toggle the isListening state
    isListening = !isListening;
    // Update the button text based on the current state
    document.getElementById("toggleButton").textContent = isListening ? "End Conversation" : "Start Listening";
}

// Add event listener to the toggle button
document.getElementById("toggleButton").addEventListener("click", toggleRecognition);


// Handle the results of speech recognition
recognition.onresult = function (event) {
  // event.results is an array of SpeechRecognitionResults
  // It can contain multiple results if continuous mode is enabled
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      // Get the transcript of the recognized speech
      var speechToText = event.results[i][0].transcript;
      console.log("Recognized:", speechToText);
      var inputLang = document.getElementById("inputLang").value; // Ensure this value is correct
      var targetLang = document.getElementById("outputLang").value; // Ensure this value is correct

      // Here, you can call your function to handle translation and speech synthesis
      translateTextAsync(speechToText, inputLang, targetLang);
    }
  }
};

async function translateTextAsync(text, inputLang, targetLang) {
  const url = "https://google-translator9.p.rapidapi.com/v2";
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "8f736d5867msh55fed24ff57fbddp10d402jsn3095e9a263ac",
      "X-RapidAPI-Host": "google-translator9.p.rapidapi.com",
    },
    body: JSON.stringify({
      q: text,
      source: inputLang,
      target: targetLang,
      format: "text",
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Debugging: Inspect the actual structure of the response
    console.log(data);

    // Improved error handling to check for the existence of the expected path in the response
    if (
      data &&
      data.data &&
      data.data.translations &&
      data.data.translations.length > 0
    ) {
      const translatedText = data.data.translations[0].translatedText;
      document.getElementById("status").textContent =
        "Translated: " + translatedText;
      console.log("Translated:", translatedText);
      console.log("Synthesizing speech in " + targetLang);
      synthesizeSpeech(translatedText, targetLang);
    } else {
      // Handle cases where the translations array might be empty or not in the expected format
      console.error(
        "Translation API returned an unexpected response:",
        JSON.stringify(data)
      );
      document.getElementById("status").textContent =
        "Translation API returned an unexpected response. Check console for details.";
    }
  } catch (error) {
    console.error("Error calling the translation API:", error);
    document.getElementById(
      "status"
    ).textContent = `Translation error: ${error.message}`;
  }
}

function synthesizeSpeech(text, langCode) {
  // Create a new instance of SpeechSynthesisUtterance
  var utterance = new SpeechSynthesisUtterance(text);

  // Set the language of the utterance to the target language code
  utterance.lang = langCode;

  console.log(`Synthesizing: "${text}" in ${langCode}`);

  // Optional: Configure other properties of the utterance
  utterance.rate = 1; // Speed of speech
  utterance.pitch = 1; // Pitch of speech

  // Handling the 'end' event to perform actions after the speech has finished
  utterance.onend = function (event) {
    console.log(
      "SpeechSynthesisUtterance ended after " +
        event.elapsedTime +
        " milliseconds."
    );
    // Perform any cleanup or follow-up actions here
  };

  // Handling errors
  utterance.onerror = function (event) {
    console.error(
      "SpeechSynthesisUtterance encountered an error: ",
      event.error
    );
  };

  // Speak the utterance using the speechSynthesis API
  window.speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.pulsating-circle').style.animationPlayState = 'paused';
});

// Handle the end of speech recognition
// recognition.onend = function() {
//     console.log('Voice recognition ended.');
//     // You can restart the recognition service if you want it to continue listening
//     recognition.start();
// };

// Start the speech recognition
// recognition.start();


// Optionally, automatically restart recognition after it ends
recognition.onend = function() {
    if (isListening) { // Check if we're supposed to be listening
        recognition.start();
    }
};