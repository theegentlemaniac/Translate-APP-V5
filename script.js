const selectTag = document.querySelectorAll("select");
const pasteButton = document.querySelector(".paste");
const fromTextArea = document.querySelector(".from-text");
const binIcon = document.querySelector('.bin-icon');

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

// Hide the paste button when user starts typing
fromTextArea.addEventListener("input", () => {
    if (fromTextArea.value.trim().length > 0) {
        pasteButton.style.display = "none"; // Hide the Paste button
    } else {
        pasteButton.style.display = "flex"; // Show the Paste button again
    }
});



// Hide the bin icon initially
binIcon.style.display = 'none';

// Add an event listener to detect input changes
fromTextArea.addEventListener('input', () => {
    if (fromTextArea.value.trim().length > 0) {
        binIcon.style.display = 'block'; // Show the bin icon if there's text
    } else {
        binIcon.style.display = 'none'; // Hide the bin icon if textarea is empty
    }
});

// Add an event listener to the bin icon to clear the textarea
binIcon.addEventListener('click', () => {
    fromTextArea.value = ''; // Clear the text
    binIcon.style.display = 'none'; // Hide the bin icon after clearing
});
