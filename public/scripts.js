document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("matchForm");
    const resultsDiv = document.getElementById("matchedResultss");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const warning = document.getElementById("personalityWarning");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const initialValueInput = document.getElementById("initialValue");
    const setInitialValueButton = document.getElementById("setInitialValue");
    const totalValueElement = document.getElementById("totalValue");
    const tableTitle = document.getElementById("tableTitle");
    const table = document.getElementById("selectionTable");
    const categoryTable = document.getElementById("categoryTable");
    const personalityTable = document.getElementById("personalityTable");
    const codeTable = document.getElementById("codeTable");
    const resultSection = document.getElementById("resultSection");
    const restartButton = document.getElementById("restartButton");
    
    const personalityOptions = ["confident", "charismatic", "rude", "stingy", "honest", "reliable", 
                          "selfish", "lazy", "affable", "reckless", "jealous", "manipulative"];
  


    let totalValue = 100;
    let totalGain = 0;
    let totalLoss = 0;
    let selectedPersonalities = [];
    let selectedCode = null;
    let selectedCategory = null;
    let selectedType = null;
    let isSelectingCodes = true;

  
    function playSound(type) {
    let audio = new Audio();

    switch (type) {
        case "bronze":
            audio.src = "bronze.mp3";  // Ensure the file exists
            break;
        case "silver":
            audio.src = "silver.mp3";
            break;
        case "gold":
            audio.src = "gold.mp3";
            break;
    }

    audio.volume = 0.7;  // Adjust volume (0 to 1)
    audio.play().catch(error => console.error("Error playing sound:", error));
}
    function showFluctuationPopup(type) {
    // Remove existing popups before adding a new one
    let existingPopup = document.querySelector(".fluctuation-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the pop-up element
    let popup = document.createElement("div");
    popup.classList.add("fluctuation-popup");

    // Apply type-specific styling
    switch (type) {
        case "bronze":
            popup.classList.add("bronze-popup");
            popup.textContent = "Bronze Boost!";
            break;
        case "silver":
            popup.classList.add("silver-popup");
            popup.textContent = "Silver Surge!";
            break;
        case "gold":
            popup.classList.add("gold-popup");
            popup.textContent = "Gold Growth!";
            break;
    }

    // Append pop-up to the graph container
     document.getElementById("graphContainer").appendChild(popup);
    // Remove pop-up after animation (2.5s)
    setTimeout(() => {
        popup.remove();
    }, 2500);
}
function showFallPopup(percentFall) {
    // Remove existing popups before adding a new one
    let existingPopup = document.querySelector(".fluctuation-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the pop-up element
    let popup = document.createElement("div");
    popup.classList.add("fluctuation-popup", "fall-popup"); // Add a class for styling
    popup.textContent = `Value Decreased by ${percentFall}%`;

    // Append the pop-up to the graph container
    document.getElementById("graphContainer").appendChild(popup);

    // Remove the pop-up after 2.5s
    setTimeout(() => {
        popup.remove();
    }, 2500);
}


    if (personalityList) {
        personalityList.addEventListener("click", function (event) {
            let clickedItem = event.target;

            if (clickedItem.tagName === "LI") {
                let value = clickedItem.getAttribute("data-value");

                if (selectedPersonalities.includes(value)) {
                    // Deselect if already selected
                    selectedPersonalities = selectedPersonalities.filter(p => p !== value);
                    clickedItem.classList.remove("selected");
                } else {
                    if (selectedPersonalities.length < 3) {
                        // Select new item
                        selectedPersonalities.push(value);
                        clickedItem.classList.add("selected");
                    } else {
                        // Show warning if trying to select more than 3
                        warning.style.display = "block";
                        setTimeout(() => warning.style.display = "none", 2000);
                    }
                }
            }
        });
    }
  setInitialValueButton.addEventListener("click", function () {
    let newValue = parseFloat(initialValueInput.value);

    if (!isNaN(newValue) && newValue > 0) {
        let walletElement = document.getElementById("walletBalance");
        let walletBalance = parseFloat(walletElement.textContent) || 0; // Get current wallet balance

        if (totalValue > newValue) {
            let excessValue = totalValue - newValue; // Calculate excess amount
            walletBalance += excessValue; // Store excess in the wallet
        } else {
            let amountToDeduct = newValue - totalValue; // Amount user is adding
            if (walletBalance >= amountToDeduct) {
                walletBalance -= amountToDeduct; // Deduct from wallet
            } else {
                alert("Insufficient funds in wallet.");
                return; // Stop execution if not enough money
            }
        }

        totalValue = newValue; // Set new total value
        totalValueElement.textContent = totalValue.toFixed(2); // Update total value
        walletElement.textContent = walletBalance.toFixed(2); // Update wallet balance
    } else {
        alert("Please enter a valid positive number.");
    }
});
   let walletElement = document.getElementById("walletBalance");
   walletElement.classList.add("wallet-update");

   // Remove the animation class after animation ends
   setTimeout(() => {
    walletElement.classList.remove("wallet-update");
   }, 500);

      
    // Initialize the display
    totalValueElement.textContent = totalValue.toFixed(2);

    // === THEME TOGGLE FIX ===
    const savedTheme = localStorage.getItem("theme") || "dark";
    body.setAttribute("data-theme", savedTheme);
    themeToggle.innerHTML = savedTheme === "dark" ? "🌙" : "☀️";

    if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        let newTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        themeToggle.innerHTML = newTheme === "dark" ? "🌙" : "☀️";
    });
}
    // Hamburger Menu Toggle
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
        });
    });


 // === PLOTLY GRAPH INITIALIZATION ===
const userId = localStorage.getItem("userId"); // Ensure userId is stored on login

let timestamps = [
    new Date("2025-02-28T12:00:00Z"),
    new Date("2025-02-28T12:01:00Z"),
    new Date("2025-02-28T12:02:00Z")
];

let cardValues = [totalValue, totalValue, totalValue]; // Initial values
let barColors = ["gray", "gray", "gray"]; // Neutral to start

let layout = {
    title: "Card Value Fluctuation",
    xaxis: {
        title: "",
        type: "date",
        tickformat: "%H:%M:%S",
        tickmode: "auto",
        showgrid: false,
        color: "#ccc"
    },
    yaxis: {
        title: "Card Value",
        showgrid: false,
        color: "#ccc"
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#fff" },
    margin: { t: 50, r: 30, b: 43, l: 60 }
};

function drawGraph() {
    const formattedTimestamps = timestamps.map(t => new Date(t));

    const barTrace = {
        x: formattedTimestamps,
        y: cardValues,
        type: "bar",
        marker: { color: barColors },
        name: ""
    };

    const lineTrace = {
        x: formattedTimestamps,
        y: cardValues,
        type: "scatter",
        mode: "lines+markers",
        line: { color: "lime", width: 3 },
        marker: { size: 6 },
        name: ""
    };

    Plotly.react("cardGraph", [barTrace, lineTrace], layout);
}

// === BACKEND INTEGRATION ===

// Fetch initial totalValue from backend
async function loadInitialValue(userId) {
    try {
        const res = await fetch(`http://localhost:5000/api/graph-value/${userId}`);
        const data = await res.json();
        totalValue = data.totalValue || 100;
        cardValues.push(totalValue);
        timestamps.push(new Date());
    } catch (err) {
        console.error("Failed to load initial value:", err);
    }
}

// Save updated value to backend
async function saveGraphValue(userId, totalValue) {
    try {
        await fetch(`http://localhost:5000/api/graph-value/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ totalValue })
        });
    } catch (err) {
        console.error("Failed to save graph value:", err);
    }
}

function updateGraph() {
    let fluctuation = (Math.random() * 0.1) - 0.05;
    let newValue = totalValue * (1 + fluctuation);

    let minLimit = totalValue * 0.90;
    let maxLimit = totalValue * 1.10;
    newValue = Math.max(Math.min(newValue, maxLimit), minLimit);

    let difference = newValue - totalValue;

    if (difference > 0) {
        totalGain += difference;
        barColors.push("lime");
    } else {
        totalLoss += Math.abs(difference);
        barColors.push("crimson");
    }

    totalValue = newValue;
    timestamps.push(new Date());
    cardValues.push(totalValue);

    if (timestamps.length > 20) {
        timestamps.shift();
        cardValues.shift();
        barColors.shift();
    }

    drawGraph();

    let gainElement = document.getElementById("gainValue");
    let lossElement = document.getElementById("lossValue");
    let totalElement = document.getElementById("totalValue");

    if (gainElement) gainElement.textContent = `+${totalGain.toFixed(2)}`;
    if (lossElement) lossElement.textContent = `-${totalLoss.toFixed(2)}`;
    if (totalElement) totalElement.textContent = totalValue.toFixed(2);
}

// === START GRAPH AFTER LOADING INITIAL VALUE ===
loadInitialValue(userId).then(() => {
    drawGraph(); // Run once after loading
    setInterval(updateGraph, 3000); // Then update every 3 seconds
});


    const categories = ["C1", "C2", "C3", "C4", "C5"];
    const groups = ["G1", "G2", "G3", "G4", "G5"];

    let R1 = {}, R2 = {};
    let pairings = [];

    // Initialize R1 and R2 values
    let count = 1;
    groups.forEach((group) => {
        categories.forEach((category) => {
            R1[`${group}${category}`] = count;
            R2[`${group}${category}`] = count + 25;
            count++;
        });
    });

    // Generate pairings for R1
    Object.keys(R1).forEach((r1Key) => {
        let r1Value = R1[r1Key];
        let groupIndex = groups.indexOf(r1Key.slice(0, 2));
        let categoryIndex = categories.indexOf(r1Key.slice(2));

        let r2Pairings = [];
        for (let i = 0; i < 5; i++) {
            let targetGroupIndex = (groupIndex + i) % 5;
            let targetCategoryIndex = (categoryIndex + i) % 5;
            let r2Key = `${groups[targetGroupIndex]}${categories[targetCategoryIndex]}`;
            r2Pairings.push(R2[r2Key]);
        }

        pairings.push({ R1: r1Value, R1_Self: r1Value, R2_Pairings: r2Pairings });
    });

    // Generate pairings for R2
    Object.keys(R2).forEach((r2Key) => {
        let r2Value = R2[r2Key];
        let groupIndex = groups.indexOf(r2Key.slice(0, 2));
        let categoryIndex = categories.indexOf(r2Key.slice(2));

        let r1Pairings = [];
        for (let i = 0; i < 5; i++) {
            let targetGroupIndex = (groupIndex + i) % 5;
            let targetCategoryIndex = (categoryIndex + i) % 5;
            let r1Key = `${groups[targetGroupIndex]}${categories[targetCategoryIndex]}`;
            r1Pairings.push(R1[r1Key]);
        }

        pairings.push({ R2: r2Value, R2_Self: r2Value, R1_Pairings: r1Pairings });
    });

    // === MATCHING SYSTEM USING RUNTIME DATA ===
    function generatePairings(cardCode, category) {
        let matchedPairs = pairings.find(p => p.R1 === cardCode || p.R2 === cardCode);
        if (!matchedPairs) return [];

        let matchedCodes = matchedPairs.R1_Pairings ? matchedPairs.R1_Pairings : matchedPairs.R2_Pairings;
        let matchedCards = collections[category]?.filter(user => matchedCodes.includes(user.code)) || [];

        return matchedCards;
    }

    // === RUNTIME DATA FOR UPDATING CARDS EVERY MINUTE ===
const collections = {};
const personalities = ["confident", "charismatic", "rude", "stingy", "honest", "reliable", 
                      "selfish", "lazy", "affable", "reckless", "jealous", "manipulative"];
const types = ["bronze", "silver", "gold"];

// Initialize collections with cards (codes 1–50 per group)
for (let i = 1; i <= 5; i++) {
    collections[i] = [];
    for (let j = 1; j <= 50; j++) {
        collections[i].push({
            code: j,
            personality: getRandom(personalities),
            type: getRandom(types),
            history: [] // ✅ Add history array for each card
        });
    }
}

// Function to update cards every minute
function updateCards() {
    for (let i = 1; i <= 5; i++) {
        let numSimilarPersonalities = getSimilarPersonalityCount();
        let newPersonality = getRandom(personalities);

        // Shuffle the cards to randomly select which get the same new personality
        shuffleArray(collections[i]);

        for (let j = 0; j < collections[i].length; j++) {
            const card = collections[i][j];

            // Only apply new personality to a limited number
            if (j < numSimilarPersonalities) {
                card.personality = newPersonality;
            }

            // Update type based on probability
            let rand = Math.random() * 100;
            if (rand <= 20) {
                card.type = "gold";
            } else if (rand <= 70) {
                card.type = "silver";
            } else {
                card.type = "bronze";
            }

            // ✅ Record update in history
            const now = new Date();
            card.history.push({
                time: now.toLocaleTimeString(), // You can use now.getTime() instead if you prefer
                personality: card.personality,
                type: card.type
            });

            // ✅ Keep only last 10 updates (10 minutes of history)
            if (card.history.length > 10) {
                card.history.shift();
            }
        }
    }
}
const trendGrid = document.getElementById("trend-grid");
const modal = document.getElementById("history-modal");
const modalCode = document.getElementById("modal-card-code");
const historyList = document.getElementById("history-list");
const closeModal = document.getElementById("close-modal");

closeModal.onclick = () => modal.classList.add("hidden");
window.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// Initialize Trend Cards
function renderTrendCards() {
  trendGrid.innerHTML = '';
  const group = collections[1]; // Pick any collection or loop through all

  group.forEach(card => {
    const div = document.createElement("div");
    div.className = "trend-card";
    div.textContent = card.code;

    // If card was updated recently (within 10 minutes), highlight it
    const now = new Date();
    const latest = card.history[card.history.length - 1];
    if (latest) {
      const updatedTime = new Date();
      const [h, m, s] = latest.time.split(':').map(Number);
      updatedTime.setHours(h, m, s);

      const minutesAgo = (now - updatedTime) / 60000;
      if (minutesAgo <= 10) {
        div.classList.add("updated");
      }
    }

    // On click, show history
    div.onclick = () => showHistory(card);
    trendGrid.appendChild(div);
  });
}

// Show history of selected card
function showHistory(card) {
  modal.classList.remove("hidden");
  modalCode.textContent = card.code;
  historyList.innerHTML = '';

  card.history.slice().reverse().forEach(update => {
    const li = document.createElement("li");
    li.textContent = `${update.time} — ${update.personality} (${update.type})`;
    historyList.appendChild(li);
  });
}

// Update Trend UI every minute with runtime updates
setInterval(() => {
  updateCards();
  renderTrendCards();
}, 60 * 1000);

renderTrendCards(); // Initial render

// Random count of cards to apply the same personality to
function getSimilarPersonalityCount() {
    let random = Math.random() * 100;
    if (random <= 2) return 30;
    if (random <= 10) return 20;
    if (random <= 30) return 15;
    if (random <= 50) return 10;
    return [2, 4, 8][Math.floor(Math.random() * 3)];
}

// Get a random item from an array
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Run the update every minute
setInterval(updateCards, 60 * 1000);
updateCards(); // Initial call


    // === MATCHING SYSTEM BASED ON R1 & R2 PAIRING ===
    form.addEventListener("submit", function (e) {
    e.preventDefault();

    let cardCode = parseInt(document.getElementById("cardCode").value);
    let collectionId = parseInt(document.getElementById("cardCategory").value);
    let userType = document.getElementById("cardType").value.toLowerCase(); // User-selected type
    let userPersonalities = selectedPersonalities.map(p => p.toLowerCase());

    if (!cardCode || !collectionId || collectionId < 1 || collectionId > 5 || !userType || userPersonalities.length === 0) {
        alert("Please enter valid card code, collection, type, and at least one personality.");
        return;
    }

    let matchedCards = generatePairings(cardCode, collectionId);
    

    // Check if any matched card has the same type and at least one of the user's entered personalities
    let hasValidMatch = matchedCards.some(card =>
        card.type.toLowerCase() === userType && userPersonalities.includes(card.personality.toLowerCase())
    );

    let fluctuation;
    
    if (hasValidMatch) {
        // Rise based on type
        switch (userType) {
            case "bronze":
                fluctuation = (Math.random() * (64 - 50) + 50) / 100; // 64% to 50%
                  showFluctuationPopup("bronze");
                break;
            case "silver":
                fluctuation = (Math.random() * (79 - 65) + 65) / 100; // 79% to 65%
                  showFluctuationPopup("silver");
                break;
            case "gold":
                fluctuation = (Math.random() * (100 - 80) + 80) / 100; // 100% to 80%
               showFluctuationPopup("gold");
                break;
        }
    } else {
    fluctuation = -Math.random() * 0.5; // No valid match → value decreases by up to 50%

    // Convert fluctuation to percentage and show popup
    let percentFall = Math.abs((fluctuation * 100).toFixed(1)); // Convert to positive percentage
    showFallPopup(percentFall);
}

     // Apply fluctuation
    let newValue = totalValue * (1 + fluctuation);
    let difference = newValue - totalValue;

    if (difference > 0) {
        totalGain += difference;
    } else {
        totalLoss += Math.abs(difference);
    }

    totalValue = newValue;

   // Default fluctuation resumes (-5% to +5%) at the new value
timestamps.push(new Date());
cardValues.push(totalValue);

if (timestamps.length > 20) {
    timestamps.shift();
    cardValues.shift();
}

let formattedTimestamps = timestamps.map(t => new Date(t));
Plotly.react("cardGraph", [{
    x: formattedTimestamps,  // ✅ Use formatted local timestamps 
    y: cardValues,
    mode: "lines",
    line: { color: "lime" }
}], layout);  // Keep existing layout settings
   
document.getElementById("totalValue").textContent = totalValue.toFixed(2);

// Resume default fluctuation after 3 seconds
setTimeout(() => {
    let defaultFluctuation = (Math.random() * 0.1) - 0.05; // Generates -5% to +5%

    // Calculate the new value after applying fluctuation
    let newFluctuatedValue = totalValue * (1 + defaultFluctuation);

    // Apply boundary constraints (max fluctuation -10% to +10% of the new value)
    let minLimit = totalValue * 0.90; // -10% limit
    let maxLimit = totalValue * 1.10; // +10% limit

    if (newFluctuatedValue < minLimit) {
        newFluctuatedValue = minLimit; // Prevent excessive drop
    } else if (newFluctuatedValue > maxLimit) {
        newFluctuatedValue = maxLimit; // Prevent excessive rise
    }

    totalValue = newFluctuatedValue;

}, 3000);

    
          resultsDiv.innerHTML = `<h3>Matched Results:</h3>`;
 if (matchedCards.length === 0) {
    resultsDiv.innerHTML += `<p>No matches found.</p>`;
} else {
    matchedCards.forEach(card => {
        resultsDiv.innerHTML += `<p>Card Code: ${card.code}, Personality: ${card.personality}, Type: ${card.type}</p>`;
    });
}
  function clearMatchedResults() {
      document.getElementById("matchedResultss").innerHTML = `<h3>Matched Results:</h3>`;
      console.log("Matched results cleared!"); // Debugging
}
  document.getElementById("clearResults").addEventListener("click", clearMatchedResults);

    });
    // Ensure all elements exist
    if (!table || !categoryTable || !personalityTable || !codeTable || !resultSection) {
        console.error("Error: One or more table elements not found!");
        return; // ✅ Stop execution if critical elements are missing
    }

    //
    /** Show Step 2: Category Selection */
    function showCategorySelection() {
        document.getElementById("categoryTitle").classList.remove("hidden");
        categoryTable.classList.remove("hidden");
    }

    /** Show Step 3: Personality Selection */
    function showPersonalitySelection() {
        document.getElementById("personalityTitle").classList.remove("hidden");
        personalityTable.classList.remove("hidden");
    }

    /** Show Step 4: Card Code Selection */
    function showCodeSelection() {
        document.getElementById("codeTitle").classList.remove("hidden");
        codeTable.classList.remove("hidden");
    }

  /** Show Step 5: Results */
function showResults() {
    resultSection.classList.remove("hidden");
    showRestartSelection(); // ✅ Call this function to make the button visible
}
/** Function to Show Restart Button */
function showRestartSelection() { 
    console.log("Showing Restart Button..."); // ✅ Debugging log
    restartButton.classList.remove("hidden"); // ✅ Make the button visible
}


    /** Populate Section A: Personality Selection */
    function updateSectionA() {
        let row1 = document.getElementById("sectionPersonalitiesRow1");
        let row2 = document.getElementById("sectionPersonalitiesRow2");

        row1.innerHTML = "";
        row2.innerHTML = "";

        personalityOptions.slice(0, 6).forEach(personality => {
            row1.innerHTML += `<td class="selectable" data-type="personality">${personality}</td>`;
        });

        personalityOptions.slice(6, 12).forEach(personality => {
            row2.innerHTML += `<td class="selectable" data-type="personality">${personality}</td>`;
        });
    }

    /** Generate 12 Random Card Codes */
    function getRandomCodes() {
        let availableCodes = Array.from({ length: 50 }, (_, i) => i + 1);
        return availableCodes.sort(() => 0.5 - Math.random()).slice(0, 12);
    }

    /** Populate Section B: Card Code Selection */
    function updateSectionB() {
        if (!isSelectingCodes) return;

        let codes = getRandomCodes();
        let row1 = document.getElementById("sectionCodesRow1");
        let row2 = document.getElementById("sectionCodesRow2");

        row1.innerHTML = "";
        row2.innerHTML = "";

        codes.slice(0, 6).forEach(code => {
            row1.innerHTML += `<td class="selectable" data-type="code">${code}</td>`;
        });

        codes.slice(6, 12).forEach(code => {
            row2.innerHTML += `<td class="selectable" data-type="code">${code}</td>`;
        });
    }

    /** Handle Type Selection (Step 1) */
    document.getElementById("cardTypeSection").addEventListener("click", function (event) {
        let clickedCell = event.target.closest(".selectable[data-type='type']");
        if (!clickedCell) return;

        document.querySelectorAll('[data-type="type"]').forEach(cell => cell.classList.remove("selected"));
        clickedCell.classList.add("selected");

        selectedType = clickedCell.textContent.toLowerCase();
        console.log("Type selected:", selectedType);

        showCategorySelection(); // ✅ Move to Step 2
    });

    /** Handle Category Selection (Step 2) */
    document.getElementById("cardCategorySection").addEventListener("click", function (event) {
        let clickedCell = event.target.closest(".selectable[data-type='category']");
        if (!clickedCell) return;

        document.querySelectorAll('[data-type="category"]').forEach(cell => cell.classList.remove("selected"));
        clickedCell.classList.add("selected");

        selectedCategory = parseInt(clickedCell.textContent);
        console.log("Category selected:", selectedCategory);

        showPersonalitySelection(); // ✅ Move to Step 3
        updateSectionA(); // ✅ Populate personalities
    });

    /** Handle Personality Selection (Step 3) */
    document.getElementById("sectionPersonalities").addEventListener("click", function (event) {
        let clickedCell = event.target.closest(".selectable[data-type='personality']");
        if (!clickedCell) return;

        let personality = clickedCell.textContent.trim();

        if (clickedCell.classList.contains("selected")) {
            selectedPersonalities = selectedPersonalities.filter(p => p !== personality);
            clickedCell.classList.remove("selected");
        } else if (selectedPersonalities.length < 3) {
            selectedPersonalities.push(personality);
            clickedCell.classList.add("selected");
        }

        console.log("Selected Personalities:", selectedPersonalities);

        if (selectedPersonalities.length === 3) {
            showCodeSelection(); // ✅ Move to Step 4
            updateSectionB(); // ✅ Populate codes
        }
    });
     function generatePairings(cardCode, category) {
    let matchedPairs = pairings.find(p => p.R1 === cardCode || p.R2 === cardCode);
    if (!matchedPairs) return [];

    let matchedCodes = matchedPairs.R1_Pairings ? matchedPairs.R1_Pairings : matchedPairs.R2_Pairings;
    let matchedCards = collections[category]?.filter(user => matchedCodes.includes(user.code)) || [];

    return matchedCards;
}

    /** Handle Code Selection (Step 4) */
    document.getElementById("sectionCodes").addEventListener("click", function (event) {
        let clickedCell = event.target.closest(".selectable[data-type='code']");
        if (!clickedCell) return;

        document.querySelectorAll('[data-type="code"]').forEach(cell => cell.classList.remove("selected-code"));
        clickedCell.classList.add("selected-code");

        selectedCode = parseInt(clickedCell.textContent.trim());
        console.log("Selected Code:", selectedCode);

        showResults(); // ✅ Move to final results
        displayMatchedResults();
    });

    /** Display Matched Results (Step 5) */
 function displayMatchedResults() {
    // ✅ Fetch matched cards using pairing algorithm
    let matchedCards = generatePairings(selectedCode, selectedCategory);

    let matchedResults = document.getElementById("matchedResults");
    
    // ✅ Update the section with matched cards
    matchedResults.innerHTML = `
        <div class="matched-grid">
            ${matchedCards.length > 0 ? matchedCards.map(card => `
                <div class="matched-card">
                    <strong>Code:</strong> ${card.code} <br>
                    <strong>Type:</strong> ${card.type} <br>
                    <strong>Personality:</strong> ${card.personality}
                </div>
            `).join("") : `<p>No matches found.</p>`}
        </div>
    `;

    // ✅ Update the graph with fluctuation based on matches
    updateGraphFluctuation(matchedCards);
}

    /** Function to Update Graph Based on Matches */
function updateGraphFluctuation(matchedCards) {
    let hasValidMatch = matchedCards.some(card =>
        card.type.toLowerCase() === selectedType && selectedPersonalities.includes(card.personality.toLowerCase())
    );

    let fluctuation;
    if (hasValidMatch) {
        switch (selectedType) {
            case "bronze": fluctuation = (Math.random() * (0.64 - 0.50) + 0.50); 
            showFluctuationPopup("bronze");
            break;
            case "silver": fluctuation = (Math.random() * (0.79 - 0.65) + 0.65); 
            showFluctuationPopup("silver");
            break;
            case "gold": fluctuation = (Math.random() * (1.00 - 0.80) + 0.80);
            showFluctuationPopup("gold");
            break;
        }
    } else {
    fluctuation = -Math.random() * 0.5; // No valid match → value decreases by up to 50%

    // Convert fluctuation to percentage and show popup
    let percentFall = Math.abs((fluctuation * 100).toFixed(1)); // Convert to positive percentage
    showFallPopup(percentFall);
}

    // ✅ Apply fluctuation to total value
    let newValue = totalValue * (1 + fluctuation);
    let difference = newValue - totalValue;

    if (difference > 0) totalGain += difference;
    else totalLoss += Math.abs(difference);

    totalValue = newValue;
    timestamps.push(new Date());
    cardValues.push(totalValue);

    // ✅ Keep last 20 points for smooth graph performance
    if (timestamps.length > 20) {
        timestamps.shift();
        cardValues.shift();
    }

    // ✅ Update the graph
    Plotly.react("cardGraph", [{
        x: timestamps.map(t => new Date(t)),
        y: cardValues,
        mode: "lines",
        line: { color: "lime" }
    }], layout);

    // ✅ Update total value on UI
    document.getElementById("totalValue").textContent = totalValue.toFixed(2);

    // ✅ Resume default fluctuation after 3 seconds
    setTimeout(() => {
        let defaultFluctuation = (Math.random() * 0.1) - 0.05;
        
       // Calculate the new value after applying fluctuation
    let newFluctuatedValue = totalValue * (1 + defaultFluctuation);

    // Apply boundary constraints (max fluctuation -10% to +10% of the new value)
    let minLimit = totalValue * 0.90; // -10% limit
    let maxLimit = totalValue * 1.10; // +10% limit

    if (newFluctuatedValue < minLimit) {
        newFluctuatedValue = minLimit; // Prevent excessive drop
    } else if (newFluctuatedValue > maxLimit) {
        newFluctuatedValue = maxLimit; // Prevent excessive rise
    }

    totalValue = newFluctuatedValue;

}, 3000);

}

   restartButton.addEventListener("click", function () {
    console.log("Resetting table..."); // ✅ Debugging log

    // Clear selections
    selectedCode = null;
    selectedCategory = null;
    selectedType = null;
    selectedPersonalities = [];
    isSelectingCodes = true;

    // Reset all selected classes
    document.querySelectorAll(".selected, .selected-code").forEach(cell => cell.classList.remove("selected", "selected-code"));

    // Hide result section and restart selection
    resultSection.classList.add("hidden");

    // Reset table titles and hide later steps
    tableTitle.textContent = "Step 1: Select Card Type";
    document.getElementById("categoryTitle").classList.add("hidden");
    document.getElementById("personalityTitle").classList.add("hidden");
    document.getElementById("codeTitle").classList.add("hidden");

    categoryTable.classList.add("hidden");
    personalityTable.classList.add("hidden");
    codeTable.classList.add("hidden");

    // Reset tables
    updateSectionA(); // Repopulate personality section
    updateSectionB(); // Repopulate code section

    console.log("Table reset complete.");
});


    console.log("Script loaded successfully!"); // ✅ Debugging

  });
   
    