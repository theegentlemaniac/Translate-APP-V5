const selectTag = document.querySelectorAll("select:not(#download-format)"); // Exclude download dropdown
const pasteButton = document.querySelector(".paste");
const fromText = document.querySelector(".from-text");
const toTexT = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");
const binIcon = document.querySelector('.bin-icon');
const translateBtn = document.querySelector("button");
const icons = document.querySelectorAll(".row i");
const fileInput = document.getElementById("fileInput");

// Populate language options (only for country dropdowns)
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

// Translate button event listener
translateBtn.addEventListener("click", () => {
    let text = fromText.value;
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;

    if (!text) return;
    toTexT.setAttribute("placeholder", "Translating...");

    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl).then(res => res.json()).then(data => {
        toTexT.value = data.responseData.translatedText;
        toTexT.setAttribute("placeholder", "Translation");
    });

    console.log(text, translateFrom, translateTo);
});

// Exchange languages and text
exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value;
    let tempLang = selectTag[0].value;

    fromText.value = toTexT.value;
    toTexT.value = tempText;

    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

// Show/hide paste button based on input
fromText.addEventListener("input", () => {
    if (fromText.value.trim().length > 0) {
        pasteButton.style.display = "none";
    } else {
        pasteButton.style.display = "flex";
    }
});

// Paste text from clipboard
pasteButton.addEventListener("click", async () => {
    try {
        const textFromClipboard = await navigator.clipboard.readText();
        fromText.value = textFromClipboard;
        pasteButton.style.display = "none";
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

// Show/hide bin icon based on input
binIcon.style.display = 'none';
fromText.addEventListener('input', () => {
    if (fromText.value.trim().length > 0) {
        binIcon.style.display = 'block';
    } else {
        binIcon.style.display = 'none';
    }
});

// Clear textarea when bin icon is clicked
binIcon.addEventListener('click', () => {
    fromText.value = '';
    binIcon.style.display = 'none';
});

// Copy text or speak text
icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (target.classList.contains("fa-copy")) {
            if (target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toTexT.value);
            }
        } else {
            let utterance;
            if (target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toTexT.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});

// Speech recognition setup
const microphoneIcon = document.querySelector(".fa-microphone");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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
// Capture the transcription result and display it in the textarea
recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    fromText.value = transcript; // Replace text with the new transcription
    console.log("Transcript:", transcript);

    // Manually trigger the "input" event to update UI elements
    fromText.dispatchEvent(new Event("input"));
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

// File upload event listener
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("File type:", file.type); // Log the file type
    console.log("File name:", file.name); // Log the file name

    // Show loading indicator
    toTexT.setAttribute("placeholder", "Processing file...");

    try {
        const extractedText = await extractTextFromFile(file);
        fromText.value = extractedText;
        translateText(extractedText); // Automatically translate after extraction
    } catch (error) {
        console.error("Error processing file:", error);
        toTexT.value = "Error processing file!";
    }
});

// Function to extract text from a file
async function extractTextFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async function (e) {
            let extractedText = "";

            try {
                if (file.type === "text/plain") {
                    extractedText = e.target.result;
                } else if (file.type === "application/pdf") {
                    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        extractedText += textContent.items.map((item) => item.str).join(" ") + "\n";
                    }
                } else if (file.name.endsWith(".docx")) {
                    const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                    extractedText = result.value;
                } else {
                    reject(new Error("Unsupported file type"));
                }
                resolve(extractedText);
            } catch (error) {
                reject(error);
            }
        };

        if (file.type === "application/pdf" || file.name.endsWith(".docx")) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    });
}

// Function to handle translation
async function translateText(text) {
    if (!text) return;

    const translateFrom = selectTag[0].value;
    const translateTo = selectTag[1].value;
    toTexT.setAttribute("placeholder", "Translating...");

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`;

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        toTexT.value = data.responseData.translatedText;
        toTexT.setAttribute("placeholder", "Translation");
    } catch (error) {
        console.error("Translation failed:", error);
        toTexT.value = "Translation error!";
    }
}

// Download button and format selector
const downloadButton = document.querySelector(".download-icon");
const downloadFormat = document.getElementById("download-format");

// Function to download the translated text
downloadButton.addEventListener("click", () => {
    const translatedText = toTexT.value.trim();
    if (!translatedText) {
        alert("No translated text to download!");
        return;
    }

    const format = downloadFormat.value;

    if (format === "txt") {
        downloadAsText(translatedText);
    } else if (format === "pdf") {
        downloadAsPDF(translatedText);
    } else if (format === "docx") {
        downloadAsDocx(translatedText);
    }
});

// Function to download as a TXT file
function downloadAsText(text) {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "translation.txt";
    a.click();
}

// Function to download as a PDF file using jsPDF
function downloadAsPDF(text) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(text, 10, 10);
    doc.save("translation.pdf");
}

// Function to download as a DOCX file using docx.js
function downloadAsDocx(text) {
    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: text,
                        spacing: { after: 200 },
                    }),
                ],
            },
        ],
    });

    docx.Packer.toBlob(doc).then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "translation.docx";
        a.click();
    });
}
