// ============================================================
// 🚀 CONFIGURATION
// REPLACE THIS URL WITH YOUR NEW DEPLOYMENT URL FROM STEP 1
// ============================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIZLKNlc630LlOGEfSybsFqpXKIXdCrAcst6XkOyNmB7mcLWAlDKQG611H_sFbbCtY/exec";

// ============================================================
// HELPER: ROBUST GOOGLE DRIVE LINK FIXER
// ============================================================
function getDirectLink(url, isBrochure = false) {
    if (!url || typeof url !== 'string' || url.trim() === "" || url === "#") {
        return isBrochure ? "#" : "https://placehold.co/600x400?text=No+Image";
    }
    
    // Clean whitespace
    url = url.trim();

    // 1. Handle Google Drive Links
    if (url.includes("drive.google.com")) {
        // Extract ID
        let id = null;
        const parts = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (parts && parts[1]) {
            id = parts[1];
            // If it's a PDF/Brochure, use 'export=view', otherwise use 'uc?export=view' for images
            if (isBrochure) return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(`https://drive.google.com/uc?id=${id}&export=download`)}`;
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
    }
    
    // 2. Handle YouTube Links (get Thumbnail)
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = getYouTubeId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : url;
    }

    return url;
}

function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ============================================================
// STATE MANAGEMENT
// ============================================================
let appData = {
    config: {
        hero_video_url: "videos/play1home.mp4", 
        whatsapp_number: "919854092624"
    },
    services: [],
    offers: [],
    dealers: [],
    products: []
};

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
    renderHero(); // Render default hero immediately
    showLoadingState();

    try {
        console.log("Fetching data from:", GOOGLE_SCRIPT_URL);
        
        const response = await fetch(GOOGLE_SCRIPT_URL);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const remoteData = await response.json();
        console.log("Data received:", remoteData);

        if (remoteData) {
            // Merge Data
            if (remoteData.products && remoteData.specs) {
                remoteData.products = mergeSpecsIntoProducts(remoteData.products, remoteData.specs);
            }
            
            // Update State
            appData.config = { ...appData.config, ...remoteData.config };
            appData.products = remoteData.products || [];
            appData.offers = remoteData.offers || [];
            appData.dealers = remoteData.dealers || [];
            appData.services = remoteData.services || [];

            // Re-render everything with new data
            renderAllSections();
        }
    } catch (e) {
        console.error("CRITICAL ERROR FETCHING DATA:", e);
        showErrorState();
    }
}

function showLoadingState() {
    const loadingHTML = `
        <div class="col-span-full text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-honda-red mx-auto mb-4"></div>
            <p class="text-gray-500 font-medium">Loading showroom data...</p>
        </div>`;
    
    ['motorcycle-grid', 'scooter-grid', 'offers-grid', 'dealers-grid'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = loadingHTML;
    });
}

function showErrorState() {
    const errorHTML = `
        <div class="col-span-full text-center py-10 bg-red-50 rounded-lg border border-red-100 p-8">
            <i class="fas fa-wifi text-red-400 text-3xl mb-3"></i>
            <p class="text-gray-800 font-bold">Connection Issue</p>
            <p class="text-gray-500 text-sm">We couldn't load the latest data. Please refresh the page.</p>
            <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">Retry</button>
        </div>`;
    
    ['motorcycle-grid', 'scooter-grid', 'offers-grid', 'dealers-grid'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = errorHTML;
    });
}

// --- DATA PROCESSING ---
function mergeSpecsIntoProducts(products, rawSpecs) {
    if(!rawSpecs) return products;
    return products.map(p => {
        // Find all specs rows for this product ID
        const pSpecs = rawSpecs.find(s => String(s.product_id) === String(p.id));
        if (!pSpecs) return p;

        const processedSpecs = {};
        // Map Google Sheet columns to Display Categories
        const categories = {
            "body": "Body Dimensions", 
            "engine": "Engine", 
            "transmission": "Transmission",
            "tyres": "Tyres & Brakes", 
            "frame": "Frame & Suspension", 
            "electricals": "Electricals"
        };

        for (const [key, label] of Object.entries(categories)) {
            if (pSpecs[key]) {
                // Split new lines into array items
                const lines = String(pSpecs[key]).split('\n');
                processedSpecs[label] = lines.map(line => {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
                    }
                    return null;
                }).filter(i => i);
            }
        }
        return { ...p, specs: processedSpecs };
    });
}

function renderAllSections() {
    renderHero();
    renderSocials();
    renderProducts();
    renderOffers();
    renderDealers();
    renderServiceImages();
    populateModelDropdown();
}

// --- RENDERERS ---

function renderHero() {
    const container = document.getElementById('hero-media-container');
    if (!container) return;

    let videoUrl = appData.config.hero_video_url;
    
    // Check if it's a YouTube video
    const youtubeId = getYouTubeId(videoUrl);

    if (youtubeId) {
        // Embed YouTube
        container.innerHTML = `<iframe class="w-full h-full object-cover pointer-events-none scale-125" 
            src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" 
            frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        // HTML5 Video (Local or Direct Drive Link)
        if (videoUrl.includes('drive.google.com')) {
            // Convert view link to download link for HTML5 video tag
            const idMatch = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if(idMatch) videoUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
        
        container.innerHTML = `
            <video autoplay muted loop playsinline class="w-full h-full object-cover opacity-60">
                <source src="${videoUrl}" type="video/mp4">
            </video>`;
    }
}

function renderSocials() {
    const waLink = document.getElementById('wa-link');
    if(waLink && appData.config.whatsapp_number) {
        waLink.href = `https://wa.me/${appData.config.whatsapp_number}`;
    }

    const container = document.getElementById('social-links-container');
    if(container && appData.config) {
        const mapping = [
            { key: 'facebook_url', icon: 'fa-facebook-f' },
            { key: 'instagram_url', icon: 'fa-instagram' },
            { key: 'youtube_url', icon: 'fa-youtube' },
            { key: 'linkedin_url', icon: 'fa-linkedin-in' },
            { key: 'twitter_url', icon: 'fa-x-twitter' }
        ];

        let html = mapping.map(m => {
            if(appData.config[m.key]) {
                return `<a href="${appData.config[m.key]}" target="_blank" class="text-gray-400 hover:text-white transition transform hover:scale-110"><i class="fab ${m.icon} text-lg"></i></a>`;
            }
            return '';
        }).join('');
        
        if(html) container.innerHTML = html;
    }
}

function renderServiceImages() {
    appData.services.forEach(s => {
        const id = s.id || s.service_id; // Handle loosely typed headers
        if(!id) return;
        const imgEl = document.getElementById(`img-service-${id.toLowerCase()}`);
        if(imgEl && s.image_url) {
            imgEl.src = getDirectLink(s.image_url);
        }
    });
}

function renderOffers() {
    const container = document.getElementById('offers-grid');
    if (!container) return;

    if (appData.offers.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">No active offers currently.</div>';
        return;
    }

    container.innerHTML = appData.offers.map(offer => {
        const isFinance = (offer.type || '').toLowerCase().includes('finance');
        const borderColor = isFinance ? 'border-honda-red' : 'border-blue-600';
        const textColor = isFinance ? 'text-honda-red' : 'text-blue-600';
        
        return `
        <div onclick="openEnquiryModal('${offer.type || 'Offer'}', '${offer.title}')" class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer border-t-4 ${borderColor}">
            <div class="relative h-56 overflow-hidden bg-gray-50">
                <img src="${getDirectLink(offer.image_url)}" class="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-500">
            </div>
            <div class="p-6 flex-grow flex flex-col text-center">
                <h3 class="text-xl font-display font-bold text-gray-900 mb-2">${offer.title}</h3>
                <p class="text-gray-600 mb-4 text-sm">${offer.description}</p>
                <span class="${textColor} font-bold uppercase text-xs mt-auto">Enquire Now &rarr;</span>
            </div>
        </div>`;
    }).join('');
}

function renderDealers() {
    const container = document.getElementById('dealers-grid');
    if (!container) return;

    if (appData.dealers.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">Dealer network updating...</div>';
        return;
    }

    container.innerHTML = appData.dealers.map(d => `
        <div class="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition flex flex-col sm:flex-row gap-5">
            <div class="w-full sm:w-28 h-28 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                <img src="${getDirectLink(d.image_url)}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow">
                <h3 class="text-lg font-bold text-gray-900">${d.name}</h3>
                <p class="text-sm text-gray-500 mb-3"><i class="fas fa-map-marker-alt text-honda-red mr-1"></i> ${d.location}</p>
                <div class="space-y-1 text-sm text-gray-700">
                    ${d.sales_contact ? `<div class="flex"><span class="w-16 font-semibold text-xs text-gray-400 mt-1">SALES</span> <a href="tel:${d.sales_contact}">${d.sales_contact}</a></div>` : ''}
                    ${d.service_contact ? `<div class="flex"><span class="w-16 font-semibold text-xs text-gray-400 mt-1">SERVICE</span> <a href="tel:${d.service_contact}">${d.service_contact}</a></div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    const mContainer = document.getElementById('motorcycle-grid');
    const sContainer = document.getElementById('scooter-grid');
    
    if(mContainer) mContainer.innerHTML = '';
    if(sContainer) sContainer.innerHTML = '';

    appData.products.forEach(p => {
        const html = createProductCard(p);
        const type = (p.type || '').toLowerCase();
        
        if (type.includes('motorcycle') && mContainer) mContainer.innerHTML += html;
        else if (type.includes('scooter') && sContainer) sContainer.innerHTML += html;
    });

    // Handle empty states
    if (mContainer && mContainer.innerHTML === '') mContainer.innerHTML = '<p class="col-span-full text-center text-gray-400">No motorcycles found.</p>';
    if (sContainer && sContainer.innerHTML === '') sContainer.innerHTML = '<p class="col-span-full text-center text-gray-400">No scooters found.</p>';
}

function createProductCard(p) {
    const priceDisplay = p.price ? `₹ ${p.price}` : "View Details";
    // Check if variants exist to show "Starts @"
    const pricePrefix = (p.variants && p.variants.length > 1) ? 'Starts @ ' : '';

    return `
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full" onclick="openProductModal('${p.id}')">
        <div class="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            <img src="${getDirectLink(p.image_url)}" alt="${p.name}" class="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500">
            <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition">
                <span class="bg-white rounded-full h-8 w-8 flex items-center justify-center shadow text-honda-red"><i class="fas fa-chevron-right"></i></span>
            </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.type}</span>
            <h3 class="font-display font-bold text-xl text-gray-900 mt-1 leading-tight">${p.name}</h3>
            
            <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                <div>
                    <span class="text-[10px] text-gray-400 uppercase font-semibold">Ex-Showroom</span>
                    <p class="text-honda-red font-bold text-lg leading-none">${pricePrefix}${priceDisplay}</p>
                </div>
            </div>
        </div>
    </div>`;
}

// --- MODAL FUNCTIONS ---

function openProductModal(productId) {
    // Note: productId from Sheet usually comes as string/number, ensure type matching
    const p = appData.products.find(x => String(x.id) === String(productId));
    if(!p) { console.error("Product not found:", productId); return; }

    const modal = document.getElementById('product-modal');
    
    // 1. Basic Info
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-price').innerText = `Ex-Showroom: ₹ ${p.price || 'N/A'}`;
    
    // Image
    const img = document.getElementById('modal-img');
    img.src = getDirectLink(p.image_url);
    img.onclick = () => openLightbox(img.src);

    // Brochure
    const broLink = document.getElementById('modal-brochure');
    const broUrl = getDirectLink(p.brochure, true);
    if(broUrl && broUrl !== '#') {
        broLink.href = broUrl;
        broLink.classList.remove('hidden');
    } else {
        broLink.classList.add('hidden');
    }

    // 2. Variants Button Generation
    const varContainer = document.getElementById('modal-variants');
    if(varContainer) {
        if(p.variants && p.variants.length > 0) {
            varContainer.innerHTML = p.variants.map((v, idx) => {
                // Ensure properties exist even if sheet data is messy
                const vPrice = v.price || p.price;
                const vBroc = v.brochure || p.brochure;
                const vName = v.name || "Standard";
                const activeClass = idx === 0 ? 'bg-honda-red text-white border-honda-red' : 'bg-white text-gray-700 border-gray-200 hover:border-honda-red';
                
                return `<button onclick="updateVariant(this, '${vPrice}', '${vBroc}')" 
                    class="variant-btn px-4 py-2 rounded text-sm font-medium border transition ${activeClass}">
                    ${vName}
                </button>`;
            }).join('');
        } else {
            varContainer.innerHTML = '<span class="text-xs text-gray-400 border px-3 py-1 rounded">Standard</span>';
        }
    }

    // 3. Colors Generation
    const colContainer = document.getElementById('modal-colors');
    if(colContainer) {
        if(p.colors && p.colors.length > 0) {
            colContainer.innerHTML = p.colors.map(c => `
                <button onclick="updateColor(this, '${c.img}')" class="group relative focus:outline-none" title="${c.name}">
                    <div class="w-8 h-8 rounded-full border border-gray-200 shadow-sm transition transform hover:scale-110 ring-2 ring-transparent group-hover:ring-gray-300" 
                         style="background-color: ${getColorHex(c.name)}"></div>
                </button>
            `).join('');
        } else {
            colContainer.innerHTML = '<span class="text-xs text-gray-400">Standard</span>';
        }
    }

    // 4. Specs
    renderSpecs(p);

    // 5. Booking Button
    document.getElementById('product-book-btn').onclick = () => openEnquiryModal('New Model', p.name);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateVariant(btn, price, brochure) {
    // Update UI Classes
    document.querySelectorAll('.variant-btn').forEach(b => {
        b.classList.remove('bg-honda-red', 'text-white', 'border-honda-red');
        b.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
    });
    btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
    btn.classList.add('bg-honda-red', 'text-white', 'border-honda-red');

    // Update Data
    document.getElementById('modal-price').innerText = `Ex-Showroom: ₹ ${price}`;
    
    const broLink = document.getElementById('modal-brochure');
    const broUrl = getDirectLink(brochure, true);
    if(broUrl && broUrl !== '#') {
        broLink.href = broUrl;
        broLink.classList.remove('hidden');
    } else {
        broLink.classList.add('hidden');
    }
}

function updateColor(btn, imgUrl) {
    const fixedUrl = getDirectLink(imgUrl);
    // If specific color image exists, swap it
    if(fixedUrl && fixedUrl !== "https://placehold.co/600x400?text=No+Image") {
        const img = document.getElementById('modal-img');
        img.style.opacity = '0.5';
        setTimeout(() => {
            img.src = fixedUrl;
            img.style.opacity = '1';
        }, 200);
    }
}

function renderSpecs(p) {
    const tabs = document.getElementById('specs-tabs');
    const content = document.getElementById('specs-content');
    
    if(!p.specs || Object.keys(p.specs).length === 0) {
        tabs.innerHTML = '';
        content.innerHTML = '<p class="text-center text-gray-400 py-8">Specifications updating...</p>';
        return;
    }

    const categories = Object.keys(p.specs);
    
    // Generate Tabs
    tabs.innerHTML = categories.map((cat, idx) => `
        <button onclick="switchSpecTab(this, '${cat}')" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${idx === 0 ? 'border-honda-red text-honda-red bg-red-50/50' : 'border-transparent text-gray-500 hover:text-gray-800'}">
            ${cat}
        </button>
    `).join('');

    // Generate Initial Content
    switchSpecTab(tabs.children[0], categories[0]);
    
    // Helper to store data on DOM isn't ideal, but for simple app:
    // We'll just look up data again in switchSpecTab
}

// Make this global so onclick works
window.switchSpecTab = function(btn, category) {
    // UI Updates
    const tabs = document.getElementById('specs-tabs');
    Array.from(tabs.children).forEach(b => b.className = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition whitespace-nowrap');
    btn.className = 'px-4 py-2 text-sm font-medium border-b-2 border-honda-red text-honda-red bg-red-50/50 transition whitespace-nowrap';

    // Content Updates
    const pName = document.getElementById('modal-title').innerText;
    const p = appData.products.find(x => x.name === pName);
    const specs = p?.specs[category] || [];
    
    const content = document.getElementById('specs-content');
    content.innerHTML = `
        <table class="w-full text-sm">
            ${specs.map((row, i) => `
                <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100">
                    <td class="py-2 px-3 font-semibold text-gray-700 w-1/2">${row.label}</td>
                    <td class="py-2 px-3 text-gray-600">${row.value}</td>
                </tr>
            `).join('')}
        </table>`;
}

// --- GENERAL UI FUNCTIONS ---

function switchPage(pageId) {
    window.scrollTo({top:0, behavior:'smooth'});
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    const target = document.getElementById('view-'+pageId);
    if(target) target.classList.remove('hidden');
    
    document.getElementById('mobile-menu').classList.add('hidden');
}

function openEnquiryModal(type, modelName) {
    const modal = document.getElementById('enquiry-modal');
    document.getElementById('enquiry-title').innerText = type;
    
    const typeSelect = document.getElementById('modal-enquiry-type');
    const modelContainer = document.getElementById('model-select-container');
    const modelSelect = document.getElementById('modal-model');

    // Reset logic
    if (type === 'New Model' || type === 'Exchange') {
        typeSelect.value = type;
        modelContainer.classList.remove('hidden');
        if(modelName) modelSelect.value = modelName;
    } else {
        // Map other strings to select values if needed
        typeSelect.value = type.includes('Service') ? 'Service Booking' : (type.includes('Insurance') ? 'Insurance Renewal' : 'General Enquiry');
        modelContainer.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function closeEnquiryModal() {
    document.getElementById('enquiry-modal').classList.add('hidden');
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-modal').classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.add('hidden');
}

function toggleModelDropdown(val) {
    const el = document.getElementById('model-select-container');
    if(val === 'New Model' || val === 'Exchange') el.classList.remove('hidden');
    else el.classList.add('hidden');
}

function populateModelDropdown() {
    const sel = document.getElementById('modal-model');
    sel.innerHTML = '<option value="" disabled selected>Select Model</option>';
    appData.products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.innerText = p.name;
        sel.appendChild(opt);
    });
}

function getColorHex(name) {
    name = name.toLowerCase();
    if(name.includes('red')) return '#DC2626';
    if(name.includes('blue')) return '#2563EB';
    if(name.includes('black')) return '#1F2937';
    if(name.includes('white')) return '#F3F4F6';
    if(name.includes('grey') || name.includes('gray')) return '#6B7280';
    if(name.includes('matte')) return '#374151';
    if(name.includes('yellow')) return '#EAB308';
    return '#9CA3AF'; // Default gray
}

// Form Handler
window.handleFormSubmit = function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const form = e.target;
    
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    // Convert form data to object
    const data = {};
    new FormData(form).forEach((value, key) => data[key] = value);

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Script POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        // Show Success
        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
        
        form.reset();
        closeEnquiryModal();
    })
    .catch(err => {
        alert("There was an error sending your message. Please call us directly.");
        console.error(err);
    })
    .finally(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// Start App
document.addEventListener('DOMContentLoaded', init);