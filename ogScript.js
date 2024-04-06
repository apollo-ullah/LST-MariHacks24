document.getElementById('startButton').addEventListener('click', function() {
    console.log('Speech recognition started...');
    // Implementation will go here
    // Add this inside the click event listener of the startButton
    var recognition = new webkitSpeechRecognition() || new SpeechRecognition(); // Prefix may be needed depending on the browser
    recognition.lang = document.getElementById('inputLang').value; // Make sure to set this correctly from the <select>
    
    recognition.onresult = function(event) {
        var speechToText = event.results[0][0].transcript;
        console.log(speechToText);
        var inputLang = document.getElementById('inputLang').value; // Ensure this value is correct
        var targetLang = document.getElementById('outputLang').value; // Ensure this value is correct
        // console.log(inputLang);
        // console.log(targetLang);
        translateTextAsync(speechToText, inputLang, targetLang);
    };

    // Placeholder for translation function
    async function translateTextAsync(text, inputLang, targetLang) {
        const url = 'https://google-translator9.p.rapidapi.com/v2';
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '8f736d5867msh55fed24ff57fbddp10d402jsn3095e9a263ac',
                'X-RapidAPI-Host': 'google-translator9.p.rapidapi.com'
            },
            body: JSON.stringify({
                q: text,
                source: inputLang,
                target: targetLang,
                format: 'text'
            })
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            // Debugging: Inspect the actual structure of the response
            console.log(data);

            // Improved error handling to check for the existence of the expected path in the response
            if (data && data.data && data.data.translations && data.data.translations.length > 0) {
                const translatedText = data.data.translations[0].translatedText;
                document.getElementById('status').textContent = 'Translated: ' + translatedText;
                synthesizeSpeech(translatedText, targetLang);
            } else {
                // Handle cases where the translations array might be empty or not in the expected format
                console.error('Translation API returned an unexpected response:', JSON.stringify(data));
                document.getElementById('status').textContent = 'Translation API returned an unexpected response. Check console for details.';
            }
        } catch (error) {
            console.error('Error calling the translation API:', error);
            document.getElementById('status').textContent = `Translation error: ${error.message}`;
        }
    }
        
    function synthesizeSpeech(text, langCode) {
        // Create a new instance of SpeechSynthesisUtterance
        var utterance = new SpeechSynthesisUtterance(text);
    
        // Set the language of the utterance to the target language code
        utterance.lang = langCode;
    
        // Optional: Configure other properties of the utterance
        utterance.rate = 1; // Speed of speech
        utterance.pitch = 1; // Pitch of speech
    
        // Handling the 'end' event to perform actions after the speech has finished
        utterance.onend = function(event) {
            console.log('SpeechSynthesisUtterance ended after ' + event.elapsedTime + ' milliseconds.');
            // Perform any cleanup or follow-up actions here
        };
    
        // Handling errors
        utterance.onerror = function(event) {
            console.error('SpeechSynthesisUtterance encountered an error: ', event.error);
        };
    
        // Speak the utterance using the speechSynthesis API
        window.speechSynthesis.speak(utterance);
    }

    recognition.onerror = function(event) {
        document.getElementById('status').textContent = 'Error recognizing speech: ' + event.error;
    };

    recognition.start();
});
