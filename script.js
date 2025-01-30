const selectTag = document.querySelectorAll("select");
const pasteButton = document.querySelector(".paste");
const fromText = document.querySelector(".from-text");
const toTexT = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");
const binIcon = document.querySelector('.bin-icon');
const translateBtn = document.querySelector("button");
const icons = document.querySelectorAll(".row i");
const fileInput = document.getElementById("fileInput");

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

// Translate button event listener
translateBtn.addEventListener("click", () => {
    const text = fromText.value;
    if (!text) return;
    translateText(text);
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

// Other event listeners (paste, exchange, bin, icons, etc.) remain unchanged
