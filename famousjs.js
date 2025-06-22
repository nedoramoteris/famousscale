// Fetch fame data from the text file
async function fetchFameData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/nedoramoteris/famousscale/refs/heads/main/famousscale.txt');
        const text = await response.text();
        const lines = text.split('\n');
        const fameData = [];
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            const parts = line.split('|').map(item => item.trim());
            const [character, imageUrl, community, level, ...descriptionParts] = parts;
            const description = descriptionParts.join('|') || "";
            
            fameData.push({ 
                character, 
                imageUrl, 
                community: community.toLowerCase(), 
                level: parseInt(level),
                description
            });
        }
        
        return fameData;
    } catch (error) {
        console.error('Error fetching fame data:', error);
        return [];
    }
}

// Get color for fame level (darker, muddier colors)
function getFameColor(level) {
    // Vibrant but earthy progression from red to green
    const colors = [
        '#7d1a1a', // Deep blood red (0)
        '#8a2c0b', // Rust red (1)
        '#983e0a', // Burnt orange (2)
        '#a5530a', // Terracotta (3)
        '#b36a12', // Amber (4)
        '#bf8220', // Honey (5)
        '#c99b34', // Mustard (6)
        '#c2b44e', // Olive (7)
        '#a8ad54', // Moss (8)
        '#8aa75c', // Sage (9)
        '#5e9e6a'  // Forest (10)
    ];
    return colors[Math.min(Math.max(level, 0), 10)];
}

// Display fame data in separate columns
async function displayFameData() {
    const data = await fetchFameData();
    const supernaturalContainer = document.getElementById('supernaturalFame');
    const humanContainer = document.getElementById('humanFame');
    
    // Clear containers
    supernaturalContainer.innerHTML = '';
    humanContainer.innerHTML = '';
    
    // Process data
    const supernaturalData = data.filter(item => 
        item.community.includes('supernatural') || 
        item.community.includes('magic') ||
        item.community.includes('arcane')
    );
    const humanData = data.filter(item => 
        item.community.includes('human') || 
        item.community.includes('mundane') ||
        item.community.includes('normal')
    );
    
    // Sort by level (descending)
    supernaturalData.sort((a, b) => b.level - a.level);
    humanData.sort((a, b) => b.level - a.level);
    
    // Display supernatural fame
    supernaturalData.forEach(item => {
        const fameItem = createFameItem(item);
        supernaturalContainer.appendChild(fameItem);
    });
    
    // Display human fame
    humanData.forEach(item => {
        const fameItem = createFameItem(item);
        humanContainer.appendChild(fameItem);
    });
    
    // Populate character list
    populateCharacterList(data);
}

// Create a fame item element with description
function createFameItem(item) {
    const fameItem = document.createElement('div');
    fameItem.className = 'fame-item';
    
    // Info container (image, name, level)
    const infoContainer = document.createElement('div');
    infoContainer.className = 'fame-info';
    
    const img = document.createElement('img');
    img.className = 'fame-image';
    img.src = item.imageUrl || `https://via.placeholder.com/50/292725/6E6761?text=${item.character.charAt(0)}`;
    img.alt = item.character;
    img.loading = 'lazy';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'fame-name';
    nameSpan.textContent = item.character;
    
    const levelContainer = document.createElement('div');
    levelContainer.className = 'fame-level-container';
    
    const levelDiv = document.createElement('div');
    levelDiv.className = 'fame-level';
    
    const levelFill = document.createElement('div');
    levelFill.className = 'fame-level-fill';
    levelFill.style.width = `${item.level * 10}%`;
    levelFill.style.backgroundColor = getFameColor(item.level);
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'fame-value';
    valueSpan.textContent = item.level;
    valueSpan.style.color = getFameColor(item.level);
    
    levelDiv.appendChild(levelFill);
    levelContainer.appendChild(levelDiv);
    levelContainer.appendChild(valueSpan);
    
    infoContainer.appendChild(img);
    infoContainer.appendChild(nameSpan);
    infoContainer.appendChild(levelContainer);
    
    // Description
    const descDiv = document.createElement('div');
    descDiv.className = 'fame-description';
    descDiv.textContent = item.description;
    
    fameItem.appendChild(infoContainer);
    fameItem.appendChild(descDiv);
    
    return fameItem;
}

// Populate character list
function populateCharacterList(data) {
    const charactersContainer = document.getElementById('charactersContainer');
    charactersContainer.innerHTML = '';
    
    // Get unique characters
    const uniqueCharacters = [...new Set(data.map(item => item.character))];
    const characterMap = {};
    
    // Create map of characters with their highest fame entry
    data.forEach(item => {
        if (!characterMap[item.character] || item.level > characterMap[item.character].level) {
            characterMap[item.character] = item;
        }
    });
    
    // Create character cards
    uniqueCharacters.forEach(character => {
        const item = characterMap[character];
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const img = document.createElement('img');
        img.className = 'character-image';
        img.src = item.imageUrl || `https://via.placeholder.com/40/292725/6E6761?text=${character.charAt(0)}`;
        img.alt = character;
        img.loading = 'lazy';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'character-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'character-name';
        nameDiv.textContent = character;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'character-details';
        detailsDiv.textContent = `${item.community} (${item.level}/10)`;
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(detailsDiv);
        card.appendChild(img);
        card.appendChild(infoDiv);
        charactersContainer.appendChild(card);
        
        // Add click event to scroll to character
        card.addEventListener('click', () => {
            const fameItems = document.querySelectorAll('.fame-item');
            for (const item of fameItems) {
                if (item.querySelector('.fame-name').textContent === character) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    item.style.backgroundColor = '#33312e';
                    setTimeout(() => {
                        item.style.backgroundColor = '';
                    }, 2000);
                    break;
                }
            }
        });
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('characterSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = document.querySelectorAll('.character-card');
        const fameItems = document.querySelectorAll('.fame-item');
        
        // Filter character list
        cards.forEach(card => {
            const name = card.querySelector('.character-name').textContent.toLowerCase();
            card.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
        
        // Highlight matching fame items
        fameItems.forEach(item => {
            const name = item.querySelector('.fame-name').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.backgroundColor = '#33312e';
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.style.backgroundColor = '';
            }
        });
    });
}

// Dark mode toggle
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☾' : '☀';
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    
    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☾';
    }
}

// Initialize the application
async function initialize() {
    setupDarkModeToggle();
    setupSearch();
    await displayFameData();
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.textContent = 'Loading data...';
    document.body.appendChild(loadingIndicator);
    
    // Remove loading indicator when done
    setTimeout(() => {
        loadingIndicator.remove();
    }, 500);
}

// Start the application
initialize();
// Fetch with error handling and cache busting
async function fetchFameData() {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/nedoramoteris/famousscale/refs/heads/main/famousscale.txt?t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        return parseFameData(text);
    } catch (error) {
        console.error('Fetch failed:', error);
        showError("Failed to load fame data. Using cached version.");
        return getCachedData();
    }
}

function parseFameData(text) {
    const lines = text.split('\n');
    const fameData = [];
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        const parts = line.split('|').map(item => item.trim());
        if (parts.length < 4) continue; // Skip invalid lines
        
        const [character, imageUrl, community, level, ...descriptionParts] = parts;
        const description = descriptionParts.join('|') || "";
        
        fameData.push({ 
            character, 
            imageUrl, 
            community: community.toLowerCase(), 
            level: parseInt(level) || 0,
            description
        });
    }
    
    // Cache the data
    localStorage.setItem('cachedFameData', JSON.stringify(fameData));
    return fameData;
}

function getCachedData() {
    const cached = localStorage.getItem('cachedFameData');
    return cached ? JSON.parse(cached) : [];
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Rest of your existing functions (getFameColor, displayFameData, etc.)

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // First check if we're on the right page
    if (!document.getElementById('supernaturalFame')) {
        return;
    }
    
    initialize().catch(error => {
        console.error("Initialization error:", error);
        showError("Failed to initialize application");
    });
});