// Main application JavaScript

let currentProducts = [];
let selectedProducts = [];

// DOM Elements
const textTab = document.querySelector('[data-tab="text"]');
const imageTab = document.querySelector('[data-tab="image"]');
const textSearchPanel = document.getElementById('text-search');
const imageSearchPanel = document.getElementById('image-search');
const textQueryInput = document.getElementById('text-query');
const textSearchBtn = document.getElementById('text-search-btn');
const imageInput = document.getElementById('image-input');
const imageUploadArea = document.getElementById('image-upload-area');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
const uploadTrigger = document.getElementById('upload-trigger');
const imageSearchBtn = document.getElementById('image-search-btn');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
const resultsTitle = document.getElementById('results-title');
const productsGrid = document.getElementById('products-grid');
const sortSelect = document.getElementById('sort-select');
const filterSelect = document.getElementById('filter-select');
const comparisonSection = document.getElementById('comparison-section');
const comparisonGrid = document.getElementById('comparison-grid');
const clearComparisonBtn = document.getElementById('clear-comparison');
const aiAgentWindow = document.getElementById('ai-agent-window');
const agentStatus = document.getElementById('agent-status');
const retailersList = document.getElementById('retailers-list');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const closeAgentBtn = document.getElementById('close-agent');
const aiAgentBackdrop = document.getElementById('ai-agent-backdrop');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadExamplePrompts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    textTab.addEventListener('click', () => switchTab('text'));
    imageTab.addEventListener('click', () => switchTab('image'));

    // Text search
    textSearchBtn.addEventListener('click', handleTextSearch);
    textQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleTextSearch();
    });

    // Image upload
    uploadTrigger.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageSelect);
    removeImageBtn.addEventListener('click', removeImage);
    imageSearchBtn.addEventListener('click', handleImageSearch);

    // Drag and drop
    imageUploadArea.addEventListener('dragover', handleDragOver);
    imageUploadArea.addEventListener('dragleave', handleDragLeave);
    imageUploadArea.addEventListener('drop', handleDrop);

    // Sorting and filtering
    sortSelect.addEventListener('change', applySortAndFilter);
    filterSelect.addEventListener('change', applySortAndFilter);

    // Comparison
    clearComparisonBtn.addEventListener('click', clearComparison);
    
    // AI Agent window
    if (closeAgentBtn) {
        closeAgentBtn.addEventListener('click', closeAgentWindow);
    }
}

// Tab switching
function switchTab(tab) {
    textTab.classList.toggle('active', tab === 'text');
    imageTab.classList.toggle('active', tab === 'image');
    textSearchPanel.classList.toggle('active', tab === 'text');
    imageSearchPanel.classList.toggle('active', tab === 'image');
    
    // Reset states
    hideAllStates();
    currentProducts = [];
    selectedProducts = [];
}

// Load example prompts
async function loadExamplePrompts() {
    try {
        const response = await fetch('/api/example-prompts');
        const data = await response.json();
        displayExamplePrompts(data.examples);
    } catch (error) {
        console.error('Error loading examples:', error);
    }
}

function displayExamplePrompts(examples) {
    const examplesList = document.getElementById('examples-list');
    examplesList.innerHTML = examples.map(example => 
        `<span class="example-chip" onclick="useExample('${example.replace(/'/g, "\\'")}')">${example}</span>`
    ).join('');
}

function useExample(example) {
    textQueryInput.value = example;
    textQueryInput.focus();
}

// Text search with SSE streaming
async function handleTextSearch() {
    const query = textQueryInput.value.trim();
    if (!query) {
        showError('Please enter a search query');
        return;
    }

    hideAllStates();
    showAgentWindow();
    resetAgentProgress();
    
    currentProducts = [];
    
    try {
        const response = await fetch('/api/search/text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, stream: true })
        });

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        handleStreamEvent(data, query);
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred while searching. Please try again.');
        closeAgentWindow();
    }
}

function handleStreamEvent(data, query) {
    switch (data.type) {
        case 'status':
            updateAgentStatus(data.message);
            break;
        case 'searching':
            addRetailerProgress(data.retailer, data.url, data.progress);
            break;
        case 'products':
            currentProducts.push(...data.products);
            updateRetailerStatus(data.retailer, 'success', data.count);
            break;
        case 'no_results':
            updateRetailerStatus(data.retailer, 'no-results', 0);
            break;
        case 'error':
            updateRetailerStatus(data.retailer, 'error', 0);
            break;
        case 'complete':
            currentProducts = data.products;
            updateAgentProgress(100);
            setTimeout(() => {
                closeAgentWindow();
                if (currentProducts.length > 0) {
                    displayResults(currentProducts, `Results for "${query}"`);
                } else {
                    showError('No products found. Please try a different search.');
                }
            }, 500);
            break;
    }
}

// Image handling
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewImage(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        validateAndPreviewImage(file);
    } else {
        showError('Please drop an image file');
    }
}

function validateAndPreviewImage(file) {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB');
        return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please use PNG, JPG, or WebP');
        return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        imageUploadArea.querySelector('.upload-content').style.display = 'none';
        imageSearchBtn.style.display = 'block';
        imageInput.files = new DataTransfer().files; // Reset input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    imagePreview.style.display = 'none';
    imageUploadArea.querySelector('.upload-content').style.display = 'block';
    imageSearchBtn.style.display = 'none';
    imageInput.value = '';
    previewImg.src = '';
}

// Image search with SSE streaming
async function handleImageSearch() {
    if (!imageInput.files || !imageInput.files[0]) {
        showError('Please select an image first');
        return;
    }

    hideAllStates();
    showAgentWindow();
    resetAgentProgress();
    
    currentProducts = [];

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('stream', 'true');

    try {
        const response = await fetch('/api/search/image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        handleStreamEvent(data, 'Image search');
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Image search error:', error);
        showError('An error occurred while searching. Please try again.');
        closeAgentWindow();
    }
}

// Display results
function displayResults(products, title) {
    resultsTitle.textContent = title;
    resultsSection.style.display = 'block';
    errorState.style.display = 'none';
    
    applySortAndFilter();
}

function renderProducts(products) {
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No products match your filters.</p>';
        return;
    }

    productsGrid.innerHTML = products.map((product, index) => {
        const isSelected = selectedProducts.includes(index);
        const availabilityClass = (product.availability || '').toLowerCase().includes('stock') ? 'in-stock' : 'out-of-stock';
        const confidence = Math.round((product.confidence_score || 0.8) * 100);
        const discount = product.discount_percentage ? parseFloat(product.discount_percentage) : null;
        const originalPrice = product.original_price;
        const hasOffers = product.offers && (Array.isArray(product.offers) ? product.offers.length > 0 : product.offers);
        
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" data-index="${index}">
                <input type="checkbox" class="compare-checkbox" ${isSelected ? 'checked' : ''} 
                       onchange="toggleProductComparison(${index})">
                ${discount ? `<div class="discount-badge">-${discount}%</div>` : ''}
                ${hasOffers ? `<div class="offers-badge">${Array.isArray(product.offers) ? product.offers.length : 1} Offer${Array.isArray(product.offers) && product.offers.length > 1 ? 's' : ''}</div>` : ''}
                ${product.image_url ? `<img src="${product.image_url}" alt="${product.title}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\'%3E%3Crect fill=\\'%23f3f4f6\\' width=\\'300\\' height=\\'200\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%239ca3af\\'%3ENo Image%3C/text%3E%3C/svg%3E'">` : ''}
                <h4 class="product-title">${escapeHtml(product.title)}</h4>
                <div class="product-price-container">
                    <div class="product-price">${product.currency || '$'}${escapeHtml(product.price)}</div>
                    ${originalPrice && discount ? `<div class="product-original-price">${product.currency || '$'}${escapeHtml(originalPrice)}</div>` : ''}
                </div>
                <div class="product-seller">${escapeHtml(product.seller)}</div>
                ${hasOffers ? `<div class="product-offers">${Array.isArray(product.offers) ? product.offers.slice(0, 2).map(offer => `<span class="offer-tag">${escapeHtml(offer)}</span>`).join('') : `<span class="offer-tag">${escapeHtml(product.offers)}</span>`}</div>` : ''}
                <div class="product-meta">
                    <span class="meta-item">
                        <span class="availability-badge ${availabilityClass}">${escapeHtml(product.availability || 'Unknown')}</span>
                    </span>
                    ${product.rating ? `<span class="meta-item">⭐ ${product.rating}</span>` : ''}
                    <span class="meta-item">
                        <span class="confidence-badge">${confidence}% Match</span>
                    </span>
                    ${product.shipping_cost ? `<span class="meta-item">🚚 ${escapeHtml(product.shipping_cost)}</span>` : ''}
                </div>
                ${product.product_url ? `<a href="${product.product_url}" target="_blank" rel="noopener noreferrer" class="product-link">View on Seller Site →</a>` : ''}
            </div>
        `;
    }).join('');

    // Update comparison section
    updateComparisonSection();
}

// Sorting and filtering
function applySortAndFilter() {
    let filtered = [...currentProducts];

    // Apply filter
    const filterValue = filterSelect.value;
    if (filterValue === 'in-stock') {
        filtered = filtered.filter(p => (p.availability || '').toLowerCase().includes('stock') && !(p.availability || '').toLowerCase().includes('out'));
    } else if (filterValue === 'free-shipping') {
        filtered = filtered.filter(p => (p.shipping_cost || '').toLowerCase().includes('free') || (p.shipping_cost || '').includes('$0'));
    } else if (filterValue === 'high-rating') {
        filtered = filtered.filter(p => p.rating && parseFloat(p.rating) >= 4);
    }

    // Apply sort
    const sortValue = sortSelect.value;
    filtered.sort((a, b) => {
        if (sortValue === 'relevance') {
            // Sort by confidence score first, then by rating, then by discount
            const confA = a.confidence_score || 0;
            const confB = b.confidence_score || 0;
            if (Math.abs(confA - confB) > 0.1) {
                return confB - confA;
            }
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            if (ratingA !== ratingB) {
                return ratingB - ratingA;
            }
            const discountA = parseFloat(a.discount_percentage) || 0;
            const discountB = parseFloat(b.discount_percentage) || 0;
            return discountB - discountA;
        } else if (sortValue === 'price-low' || sortValue === 'price-high') {
            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);
            return sortValue === 'price-low' ? priceA - priceB : priceB - priceA;
        } else if (sortValue === 'discount') {
            // Sort by discount percentage (highest first)
            const discountA = parseFloat(a.discount_percentage) || 0;
            const discountB = parseFloat(b.discount_percentage) || 0;
            if (discountA !== discountB) {
                return discountB - discountA;
            }
            // If same discount, sort by price (lower is better)
            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);
            return priceA - priceB;
        } else if (sortValue === 'offers') {
            // Sort by number of offers, then by discount
            const offersA = Array.isArray(a.offers) ? a.offers.length : (a.offers ? 1 : 0);
            const offersB = Array.isArray(b.offers) ? b.offers.length : (b.offers ? 1 : 0);
            if (offersA !== offersB) {
                return offersB - offersA;
            }
            // If same number of offers, sort by discount
            const discountA = parseFloat(a.discount_percentage) || 0;
            const discountB = parseFloat(b.discount_percentage) || 0;
            return discountB - discountA;
        } else if (sortValue === 'rating') {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            return ratingB - ratingA;
        } else if (sortValue === 'confidence') {
            const confA = a.confidence_score || 0;
            const confB = b.confidence_score || 0;
            return confB - confA;
        }
        return 0;
    });

    renderProducts(filtered);
}

function parsePrice(priceStr) {
    if (!priceStr) return Infinity;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || Infinity;
}

// Product comparison
function toggleProductComparison(index) {
    const productIndex = selectedProducts.indexOf(index);
    if (productIndex > -1) {
        selectedProducts.splice(productIndex, 1);
    } else {
        if (selectedProducts.length < 3) {
            selectedProducts.push(index);
        } else {
            alert('You can compare up to 3 products at a time');
            return;
        }
    }
    
    // Update UI
    applySortAndFilter();
    updateComparisonSection();
}

function updateComparisonSection() {
    if (selectedProducts.length === 0) {
        comparisonSection.style.display = 'none';
        return;
    }

    comparisonSection.style.display = 'block';
    const selected = selectedProducts.map(idx => currentProducts[idx]);
    
    comparisonGrid.innerHTML = selected.map(product => `
        <div class="product-card">
            ${product.image_url ? `<img src="${product.image_url}" alt="${product.title}" class="product-image">` : ''}
            <h4 class="product-title">${escapeHtml(product.title)}</h4>
            <div class="product-price">${product.currency || '$'}${escapeHtml(product.price)}</div>
            <div class="product-seller">${escapeHtml(product.seller)}</div>
            <div class="product-meta">
                <div class="meta-item"><strong>Availability:</strong> ${escapeHtml(product.availability || 'Unknown')}</div>
                ${product.rating ? `<div class="meta-item"><strong>Rating:</strong> ⭐ ${product.rating}</div>` : ''}
                ${product.shipping_cost ? `<div class="meta-item"><strong>Shipping:</strong> ${escapeHtml(product.shipping_cost)}</div>` : ''}
                ${product.estimated_delivery ? `<div class="meta-item"><strong>Delivery:</strong> ${escapeHtml(product.estimated_delivery)}</div>` : ''}
            </div>
            ${product.product_url ? `<a href="${product.product_url}" target="_blank" rel="noopener noreferrer" class="product-link">View on Seller Site →</a>` : ''}
        </div>
    `).join('');
}

function clearComparison() {
    selectedProducts = [];
    updateComparisonSection();
    applySortAndFilter();
}

// UI State Management
function showLoading() {
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';
    errorState.style.display = 'none';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.style.display = 'block';
    resultsSection.style.display = 'none';
    loadingState.style.display = 'none';
}

function hideAllStates() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultsSection.style.display = 'none';
}

// AI Agent Window Functions
function showAgentWindow() {
    if (aiAgentWindow) {
        if (aiAgentBackdrop) aiAgentBackdrop.style.display = 'block';
        aiAgentWindow.style.display = 'block';
        // Allow scrolling - don't block body scroll
        // Users can scroll the page even with agent window open
    }
}

function closeAgentWindow() {
    if (aiAgentWindow) {
        if (aiAgentBackdrop) aiAgentBackdrop.style.display = 'none';
        aiAgentWindow.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close agent window when clicking backdrop
if (aiAgentBackdrop) {
    aiAgentBackdrop.addEventListener('click', closeAgentWindow);
}

function resetAgentProgress() {
    if (retailersList) retailersList.innerHTML = '';
    if (agentStatus) agentStatus.innerHTML = '<div class="status-message">Initializing search...</div>';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
}

function updateAgentStatus(message) {
    if (agentStatus) {
        agentStatus.innerHTML = `<div class="status-message">${escapeHtml(message)}</div>`;
    }
}

function addRetailerProgress(retailer, url, progress) {
    if (!retailersList) return;
    
    const item = document.createElement('div');
    item.className = 'retailer-item';
    item.id = `retailer-${retailer.toLowerCase().replace(/\s+/g, '-')}`;
    item.innerHTML = `
        <div class="retailer-icon">🛍️</div>
        <div class="retailer-info">
            <div class="retailer-name">${escapeHtml(retailer)}</div>
            <div class="retailer-url">${escapeHtml(url)}</div>
        </div>
        <div class="retailer-status">
            <div class="status-spinner"></div>
            <span class="status-text">Searching...</span>
        </div>
    `;
    retailersList.appendChild(item);
    
    // Update progress
    const [current, total] = progress.split('/');
    const percent = Math.round((parseInt(current) / parseInt(total)) * 100);
    updateAgentProgress(percent);
}

function updateRetailerStatus(retailer, status, count) {
    const retailerId = `retailer-${retailer.toLowerCase().replace(/\s+/g, '-')}`;
    const item = document.getElementById(retailerId);
    if (!item) return;
    
    const statusDiv = item.querySelector('.retailer-status');
    if (!statusDiv) return;
    
    let statusText = '';
    let statusClass = '';
    
    switch (status) {
        case 'success':
            statusText = `✓ Found ${count} product${count !== 1 ? 's' : ''}`;
            statusClass = 'success';
            item.classList.add('completed');
            break;
        case 'no-results':
            statusText = 'No results';
            statusClass = 'no-results';
            item.classList.add('completed');
            break;
        case 'error':
            statusText = 'Error';
            statusClass = 'error';
            item.classList.add('completed', 'error');
            break;
    }
    
    statusDiv.innerHTML = `<span class="status-text ${statusClass}">${statusText}</span>`;
}

function updateAgentProgress(percent) {
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
    if (progressText) {
        progressText.textContent = `${percent}%`;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

