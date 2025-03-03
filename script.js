const accessKey = "8Dy6_rnf4Nc_9_uU1_nlFS74wDDdL549NElhK8KFvq0";

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const micBtn = document.getElementById("mic-btn");
const searchResult = document.getElementById("search-result");
const showMoreBtn = document.getElementById("show-more-btn");
const autocompleteDropdown = document.getElementById("autocomplete-dropdown");

let keyword = "";
let page = 1;

// Trending searches
const trendingSearches = ["Nature", "Cars", "Technology", "Food", "Travel", "Fashion", "Wildlife"];

// Fetch related searches from API
async function getRelatedSearches(query) {
    if (!query) {
        autocompleteDropdown.innerHTML = "";
        return;
    }

    const url = `https://api.datamuse.com/words?ml=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        autocompleteDropdown.innerHTML = "";
        data.slice(0, 6).forEach(suggestion => createSuggestionItem(suggestion.word, false));
    } catch (error) {
        console.error("Autocomplete error:", error);
    }
}

// Create suggestion item (related & trending)
function createSuggestionItem(text, isTrending) {
    let item = document.createElement("div");
    item.classList.add("autocomplete-item");

    // Left icon (search or trending)
    let leftIcon = document.createElement("span");
    leftIcon.innerHTML = isTrending ? "🔥" : "🔍"; // Trending icon for trending searches
    leftIcon.classList.add("suggestion-icon");

    // Suggestion text
    let suggestionText = document.createElement("span");
    suggestionText.innerText = text;
    suggestionText.classList.add("suggestion-text");

    // Right copy icon
    let copyIcon = document.createElement("span");
    copyIcon.innerHTML = "📋";
    copyIcon.classList.add("copy-icon");
    copyIcon.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
    };

    // Click on suggestion to search
    item.onclick = () => {
        searchBox.value = text;
        autocompleteDropdown.innerHTML = "";
        searchImages();
    };

    item.append(leftIcon, suggestionText, copyIcon);
    autocompleteDropdown.appendChild(item);
}

// Show trending searches when clicking the search box
searchBox.addEventListener("focus", () => {
    autocompleteDropdown.innerHTML = "";
    trendingSearches.forEach(search => createSuggestionItem(search, true));
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
        autocompleteDropdown.innerHTML = "";
    }
});

// Voice Search
micBtn.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
        searchBox.value = event.results[0][0].transcript;
        searchImages();
    };
});

// Fetch images from Unsplash API
async function searchImages() {
    keyword = searchBox.value.trim();
    if (!keyword) return;

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        
        if (page === 1) searchResult.innerHTML = ""; 

        data.results.forEach(photo => {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("image-item");

            const img = document.createElement("img");
            img.src = photo.urls.small;
            img.alt = photo.alt_description;

            imgContainer.appendChild(img);
            searchResult.appendChild(img);
        });

        showMoreBtn.style.display = data.total_pages > page ? "block" : "none";
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Event Listeners
searchBox.addEventListener("input", () => {
    getRelatedSearches(searchBox.value);
});

searchBtn.addEventListener("click", () => {
    page = 1;
    searchImages();
});

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        page = 1;
        searchImages();
    }
});

showMoreBtn.addEventListener("click", () => {
    page++;
    searchImages();
});

document.addEventListener("DOMContentLoaded", () => {
    // Select all images
    const images = document.querySelectorAll(".image-item img");
    const previewModal = document.getElementById("image-preview");
    const previewContent = document.getElementById("preview-content");
    const previewImage = document.getElementById("preview-image");
    const closeBtn = document.getElementById("close-preview");

    images.forEach(img => {
        // Create Hover Icons
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("image-icons");

        // Download Button
        const downloadBtn = document.createElement("button");
        downloadBtn.classList.add("icon-btn");
        downloadBtn.innerHTML = "📥";
        downloadBtn.onclick = () => downloadImage(img.src);

        // Share Button
        const shareBtn = document.createElement("button");
        shareBtn.classList.add("icon-btn");
        shareBtn.innerHTML = "📤";
        shareBtn.onclick = () => shareImage(img.src);

        iconContainer.appendChild(downloadBtn);
        iconContainer.appendChild(shareBtn);

        // Append icons inside image container
        img.parentElement.appendChild(iconContainer);

        // Click event to open preview
        img.addEventListener("click", () => {
            previewImage.src = img.src;
            previewModal.style.display = "flex";
        });
    });

    // Close Preview Modal
    closeBtn.addEventListener("click", () => {
        previewModal.style.display = "none";
    });

    // Download Image Function
    function downloadImage(url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "image.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Share Image Function
    function shareImage(url) {
        if (navigator.share) {
            navigator.share({
                title: "Check out this image!",
                url: url
            }).catch(error => console.log("Error sharing:", error));
        } else {
            alert("Sharing not supported on this browser.");
        }
    }
});
