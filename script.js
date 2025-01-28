const selectTag = document.querySelectorAll("select");
const pasteButton = document.querySelector(".paste");
const fromText = document.querySelector(".from-text");
const toTexT = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");  
const binIcon = document.querySelector('.bin-icon');
translateBtn = document.querySelector("button");
icons = document.querySelectorAll(".row i");

// Populate language options
selectTag.forEach((tag, id) => {
    for (const country_code in countries) {
        let selected;
        if (id === 0 && country_code === "en-GB") {
            selected = "selected";
        } else if (id === 1 && country_code === "hi-IN") {
            selected = "selected";
        }

        let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value;
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;

    if(!text) return;
    toTexT.setAttribute("placeholder", "Translating...");

    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl).then(res => res.json()).then(data => {

        toTexT.value = data.responseData.translatedText;
        toTexT.setAttribute("placeholder", "Translation");
    })

    console.log(text, translateFrom, translateTo);
});

exchangeIcon.addEventListener("click", () => {
  
    let tempText = fromText.value; 
    let tempLang = selectTag[0].value; 


    fromText.value = toTexT.value;
    toTexT.value = tempText; 

    
    selectTag[0].value = selectTag[1].value; 
    selectTag[1].value = tempLang; 
});



fromText.addEventListener("input", () => {
    if (fromText.value.trim().length > 0) {
        pasteButton.style.display = "none"; 
    } else {
        pasteButton.style.display = "flex"; 
    }
});


pasteButton.addEventListener("click", async () => {
    try {
        const textFromClipboard = await navigator.clipboard.readText();
        fromText.value = textFromClipboard;
        pasteButton.style.display = "none";
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});



binIcon.style.display = 'none';

// Add an event listener to detect input changes
fromText.addEventListener('input', () => {
    if (fromText.value.trim().length > 0) {
        binIcon.style.display = 'block'; // Show the bin icon if there's text
    } else {
        binIcon.style.display = 'none'; // Hide the bin icon if textarea is empty
    }
});

// Add an event listener to the bin icon to clear the textarea
binIcon.addEventListener('click', () => {
    fromText.value = ''; // Clear the text
    binIcon.style.display = 'none'; // Hide the bin icon after clearing
});

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(target.classList.contains("fa-copy"))
        {
            if(target.id == "from"){
                navigator.clipboard.writeText(fromText.value);
            }

            else{
                navigator.clipboard.writeText(toTexT.value);
            }
        }

        else{

            let utterance;

            if(target.id == "from"){
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            }

            else{
                utterance = new SpeechSynthesisUtterance(toTexT.value);
                utterance.lang = selectTag[1].value;
            }

            speechSynthesis.speak(utterance);


        }
    });
})


const microphoneIcon = document.querySelector(".fa-microphone");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

// Configure the SpeechRecognition API
recognition.continuous = false; // Stops listening after speech input ends
recognition.interimResults = false; // Only return final results
recognition.lang = selectTag[0].value; // Set language dynamically

// Start speech recognition when the microphone icon is clicked
microphoneIcon.addEventListener("click", () => {
    try {
        recognition.start();
        microphoneIcon.style.color = "red"; // Change color to indicate recording
    } catch (err) {
        console.error("Speech recognition failed to start:", err);
        alert("Speech recognition failed to start. Please try again.");
    }
});

// Capture the transcription result and display it in the textarea
recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    fromText.value = transcript; // Replace text with the new transcription
    console.log("Transcript:", transcript);
});

// Handle recognition end (e.g., when the user stops speaking)
recognition.addEventListener("end", () => {
    microphoneIcon.style.color = ""; // Reset the microphone icon color
    console.log("Speech recognition ended.");
});

// Handle recognition errors
recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error:", event.error);
    alert("Speech recognition error: " + event.error);
});
