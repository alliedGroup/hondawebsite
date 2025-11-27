// ============================================================
// 🚀 CONNECT YOUR GOOGLE SHEET
// Paste your "Web App URL" inside the quotes below.
// ============================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFbN2h_5feZzq-LHUNZMdUIWb4eGRhS18qQWjEBlkobHBpVS3tq9xOKu21gVMfJAk_/exec";

// ============================================================
// HELPER: FIX GOOGLE DRIVE LINKS
// Automatically converts "view" links to "direct" links
// ============================================================
function getDirectLink(url, isBrochure = false) {
    if (!url || url === "#") return isBrochure ? "#" : "https://placehold.co/400x300?text=No+Image";
    
    // Check if it's a Google Drive View Link
    if (url.includes("drive.google.com") && url.includes("/view")) {
        // Extract the ID
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            // If brochure (PDF), use 'view' export to open in browser, or 'download' to force download
            const exportType = isBrochure ? "view" : "view"; 
            return `https://drive.google.com/uc?export=${exportType}&id=${idMatch[1]}`;
        }
    }
    return url;
}

// ============================================================
// STATE (Starts Empty - Populates ONLY from Sheet)
// ============================================================
let appData = {
    config: {
        whatsapp_number: "919854092624",
        facebook_url: "https://www.facebook.com", 
        instagram_url: "https://www.instagram.com"
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
    // 1. Show Loading State for content areas
    showLoadingState();

    // 2. Fetch from Google Sheet
    if (!GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const remoteData = await response.json();
            
            if (remoteData) {
                console.log("Connected to Google Sheet");
                
                // Merge "Wide" Specs into Products
                if (remoteData.specs && remoteData.products) {
                    remoteData.products = mergeSpecsIntoProducts(remoteData.products, remoteData.specs);
                }
                
                // Clean Config Keys
                if(remoteData.config) {
                    const cleanConfig = {};
                    for(let key in remoteData.config) {
                        cleanConfig[key.trim()] = remoteData.config[key];
                    }
                    remoteData.config = cleanConfig;
                }

                // Update App Data & Render
                appData = { ...appData, ...remoteData };
                
                renderAllSections();
            }
        } catch (e) {
            console.error("Error fetching data:", e);
            showErrorState();
        }
    } else {
        console.warn("Google Script URL is missing.");
    }
}

function showLoadingState() {
    const loadingHTML = `
        <div class="col-span-full text-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-honda-red mx-auto mb-3"></div>
            <p class="text-gray-400 text-sm">Loading details...</p>
        </div>`;
    
    const ids = ['motorcycle-grid', 'scooter-grid', 'offers-grid', 'dealers-grid'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = loadingHTML;
    });
}

function showErrorState() {
    const errorHTML = `<p class="col-span-full text-center py-10 text-red-500">Unable to load content. Please refresh.</p>`;
    const ids = ['motorcycle-grid', 'scooter-grid'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = errorHTML;
    });
}

// --- HELPER: PARSE SHEET SPECS ---
function mergeSpecsIntoProducts(products, rawSpecs) {
    return products.map(p => {
        // Find the row in 'Specs' tab where product_id matches
        // Using loose equality (==) to handle string/number mismatch
        const pSpecs = rawSpecs.find(s => s.product_id == p.id); 
        
        if (!pSpecs) return p;

        const processedSpecs = {};
        const categories = {
            "Body": "Body Dimensions",
            "Engine": "Engine",
            "Transmission": "Transmission",
            "Tyres": "Tyres & Brakes",
            "Frame": "Frame & Suspension",
            "Electricals": "Electricals"
        };

        for (const [sheetKey, displayKey] of Object.entries(categories)) {
            if (pSpecs[sheetKey]) {
                const lines = pSpecs[sheetKey].toString().split('\n');
                processedSpecs[displayKey] = lines.map(line => {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
                    }
                    return null;
                }).filter(item => item !== null);
            }
        }
        
        return { ...p, specs: processedSpecs };
    });
}

function renderAllSections() {
    // Note: renderHero() removed so it doesn't touch the HTML video
    renderSocials();
    renderProducts();
    renderOffers();
    renderDealers();
    renderServiceImages();
    populateModelDropdown();
}

// --- RENDERERS ---

function renderSocials() {
    const waLink = document.getElementById('wa-link');
    if(waLink && appData.config && appData.config.whatsapp_number) {
        waLink.href = `https://wa.me/${appData.config.whatsapp_number}`;
    }

    const socialMap = {
        'facebook_url': 'fa-facebook-f',
        'instagram_url': 'fa-instagram',
        'youtube_url': 'fa-youtube',
        'linkedin_url': 'fa-linkedin-in',
        'twitter_url': 'fa-x-twitter'
    };

    const container = document.getElementById('social-links-container');
    if(container && appData.config) {
        let html = '';
        for (const [key, icon] of Object.entries(socialMap)) {
            if(appData.config[key]) {
                html += `<a href="${appData.config[key]}" target="_blank" class="text-gray-400 hover:text-white transition"><i class="fab ${icon} text-lg"></i></a>`;
            }
        }
        if(html) container.innerHTML = html;
    }
}

function renderServiceImages() {
    if (!appData.services) return;
    appData.services.forEach(s => {
        const img = document.getElementById(`img-service-${s.service_id || s.id}`);
        if(img && s.image_url) img.src = getDirectLink(s.image_url);
    });
}

function renderOffers() {
    const container = document.getElementById('offers-grid');
    if (!container) return;
    
    if (!appData.offers || appData.offers.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 col-span-full">No offers available at the moment.</p>';
        return;
    }

    container.innerHTML = appData.offers.map(offer => `
        <div onclick="openEnquiryModal('${offer.type || 'Offer'}: ${offer.title}')" class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer h-full">
            <div class="relative h-56 overflow-hidden">
                <img src="${getDirectLink(offer.image_url)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${offer.title}">
                <div class="absolute top-4 left-4 bg-honda-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Limited Time</div>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <h3 class="text-2xl font-bold text-gray-900 mb-3">${offer.title}</h3>
                <p class="text-gray-600 mb-6 text-sm leading-relaxed">${offer.description}</p>
                <div class="mt-auto pt-4 border-t border-gray-100">
                    <span class="text-honda-red font-bold uppercase tracking-wide text-sm group-hover:underline">Enquire Now &rarr;</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDealers() {
    const container = document.getElementById('dealers-grid');
    if (!container) return;
    
    if (!appData.dealers || appData.dealers.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 col-span-full">Network details loading...</p>';
        return;
    }

    container.innerHTML = appData.dealers.map(dealer => `
        <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition flex flex-col sm:flex-row gap-6 group">
            <div class="w-full sm:w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                <img src="${getDirectLink(dealer.image_url)}" class="w-full h-full object-cover" alt="${dealer.name}">
            </div>
            <div class="flex-grow">
                <h3 class="text-xl font-bold text-gray-900 mb-1">${dealer.name}</h3>
                <p class="text-sm text-gray-500 mb-4"><i class="fas fa-map-marker-alt text-honda-red mr-1"></i> ${dealer.location}</p>
                <div class="space-y-1 text-sm text-gray-600">
                    ${dealer.sales_contact ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide w-16 inline-block">SALES:</span> <a href="tel:${dealer.sales_contact}" class="text-gray-800 hover:text-honda-red font-medium">${dealer.sales_contact}</a></p>` : ''}
                    ${dealer.service_contact ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide w-16 inline-block">SERVICE:</span> <a href="tel:${dealer.service_contact}" class="text-gray-800 hover:text-honda-red font-medium">${dealer.service_contact}</a></p>` : ''}
                    ${dealer.email ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide w-16 inline-block">EMAIL:</span> <a href="mailto:${dealer.email}" class="text-honda-red hover:underline truncate ml-2">${dealer.email}</a></p>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    const motoContainer = document.getElementById('motorcycle-grid');
    const scooterContainer = document.getElementById('scooter-grid');

    if (motoContainer) motoContainer.innerHTML = '';
    if (scooterContainer) scooterContainer.innerHTML = '';
    
    if (!appData.products || appData.products.length === 0) return;

    const motorcycles = appData.products.filter(p => p.type.toLowerCase().includes('motorcycle'));
    motorcycles.forEach(p => { if (motoContainer) motoContainer.innerHTML += createCardHTML(p); });

    const scooters = appData.products.filter(p => p.type.toLowerCase().includes('scooter'));
    scooters.forEach(p => { if (scooterContainer) scooterContainer.innerHTML += createCardHTML(p); });
}

function createCardHTML(p) {
    // Use the fixer for product images too
    const imgUrl = getDirectLink(p.image_url);
    const displayPrice = p.price ? `₹ ${p.price}` : "Check Price";

    return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-2xl transition duration-300 group flex flex-col h-full" onclick="openModal('${p.id}')">
        <div class="h-52 bg-gray-50 flex items-center justify-center p-6 overflow-hidden relative">
            <img src="${imgUrl}" alt="${p.name}" class="h-full object-contain group-hover:scale-110 group-hover:-rotate-2 transition duration-500">
            <div class="absolute top-3 right-3 bg-white rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition duration-300">
                <i class="fas fa-arrow-right text-honda-red"></i>
            </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
            <span class="text-xs font-bold text-honda-red uppercase tracking-wider">${p.type}</span>
            <h3 class="font-display font-bold text-xl text-gray-900 mt-1">${p.name}</h3>
            <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                <span class="text-xs text-gray-500 uppercase font-semibold">Ex-Showroom</span>
                <p class="text-honda-red font-bold text-lg">${displayPrice}</p>
            </div>
        </div>
    </div>`;
}

// --- INTERACTION LOGIC ---

function switchPage(pageId) {
    window.scrollTo({top:0, behavior:'smooth'});
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('view-'+pageId);
    if(target) target.classList.remove('hidden');
    document.getElementById('mobile-menu').classList.add('hidden');
}

function openEnquiryModal(type, modelName = null) {
    const modal = document.getElementById('enquiry-modal');
    const title = document.getElementById('enquiry-title');
    const select = document.getElementById('modal-enquiry-type');
    const modelSelect = document.getElementById('modal-model');
    
    if(title) title.innerText = type.includes(':') ? 'Enquiry: ' + type.split(':')[0] : type;
    
    if(select) {
        if(type.includes("Exchange")) select.value = "Exchange";
        else if(type.includes("Service")) select.value = "Service Booking";
        else if(type.includes("Insurance")) select.value = "Insurance Renewal";
        else if(type === 'New Model') select.value = "New Model";
        else select.value = "General Enquiry";
        toggleModelDropdown(select.value);
    }

    if (modelName && modelSelect) {
        document.getElementById('model-select-container').classList.remove('hidden');
        select.value = "New Model";
        modelSelect.value = modelName;
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEnquiryModal() {
    document.getElementById('enquiry-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function toggleModelDropdown(type) {
    const container = document.getElementById('model-select-container');
    const field = document.getElementById('modal-model');
    if (type === 'New Model' || type === 'Exchange') {
        container.classList.remove('hidden');
        field.required = true;
    } else {
        container.classList.add('hidden');
        field.required = false;
    }
}

function populateModelDropdown() {
    const modelSelect = document.getElementById('modal-model');
    if (!modelSelect) return;
    modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
    if(appData.products) {
        appData.products.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            option.innerText = p.name;
            modelSelect.appendChild(option);
        });
    }
}

function openModal(id) {
    const p = appData.products.find(x => x.id == id);
    if(!p) return;
    
    document.getElementById('modal-title').innerText = p.name;
    
    let basePrice = p.price;
    let baseBrochure = p.brochure;
    if(p.variants && p.variants.length > 0) {
        basePrice = p.variants[0].price;
        baseBrochure = p.variants[0].brochure;
    }
    document.getElementById('modal-price').innerText = 'Ex-Showroom: ₹ ' + basePrice.replace('*','');
    
    const brochureLink = document.getElementById('modal-brochure');
    if(brochureLink) {
        // Use the fixer for brochure links too
        const fixedBrochureUrl = getDirectLink(baseBrochure, true);
        
        if(fixedBrochureUrl && fixedBrochureUrl !== "#") {
            brochureLink.href = fixedBrochureUrl;
            brochureLink.classList.remove('hidden');
        } else { brochureLink.classList.add('hidden'); }
    }
    
    const modalImg = document.getElementById('modal-img');
    modalImg.src = getDirectLink(p.image_url); 
    modalImg.onclick = function() { openLightbox(this.src); };
    
    // Variants
    const variantsList = document.getElementById('modal-variants');
    if(variantsList) {
        if (p.variants && p.variants.length > 0) {
            variantsList.innerHTML = p.variants.map((v, index) => 
                `<button onclick="selectVariant(this, '${v.price}', '${v.brochure}')" class="variant-btn px-3 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200 hover:border-honda-red hover:text-honda-red transition ${index === 0 ? 'active bg-honda-red text-white border-honda-red' : ''}">${v.name}</button>`
            ).join('');
        } else { variantsList.innerHTML = '<span class="text-xs text-gray-400">Standard Variant</span>'; }
    }

    // Colors
    const colorsList = document.getElementById('modal-colors');
    if(colorsList) {
        if (p.colors && p.colors.length > 0) {
            colorsList.innerHTML = p.colors.map(c => `
                <div onclick="changeModalImage(this, '${c.img}')" class="cursor-pointer group relative rounded-full">
                    <span class="block w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition ring-1 ring-gray-200 color-btn" style="background-color:${getColorHex(c.name)}" title="${c.name}"></span>
                </div>`).join('');
        } else { colorsList.innerHTML = '<span class="text-xs text-gray-400">Standard Colors</span>'; }
    }

    // Specs (Tabs)
    const tabsContainer = document.getElementById('specs-tabs');
    const contentContainer = document.getElementById('specs-content');
    
    if (tabsContainer && contentContainer) {
        if (p.specs && Object.keys(p.specs).length > 0) {
            tabsContainer.innerHTML = '';
            const categories = Object.keys(p.specs);
            categories.forEach((cat, index) => {
                const btn = document.createElement('button');
                btn.className = `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${index === 0 ? 'text-honda-red border-honda-red bg-red-50' : 'text-gray-500 border-transparent hover:text-gray-700'}`;
                btn.innerText = cat;
                btn.onclick = () => {
                    Array.from(tabsContainer.children).forEach(b => b.className = 'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors');
                    btn.className = 'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 border-honda-red text-honda-red bg-red-50 transition-colors';
                    renderSpecContent(p.specs[cat]);
                };
                tabsContainer.appendChild(btn);
            });
            renderSpecContent(p.specs[categories[0]]);
        } else {
            tabsContainer.innerHTML = '';
            contentContainer.innerHTML = '<p class="text-gray-400 text-center py-10 text-sm">Detailed specifications coming soon.</p>';
        }
    }
    
    const bookBtn = document.getElementById('product-book-btn');
    if(bookBtn) bookBtn.onclick = function() { openEnquiryModal('New Model', p.name); };

    document.getElementById('product-modal').classList.remove('hidden');
}

function renderSpecContent(specsArray) {
    const container = document.getElementById('specs-content');
    let html = '<table class="w-full text-sm text-left text-gray-600"><tbody>';
    specsArray.forEach((item, index) => {
        const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        html += `<tr class="${bgClass} border-b border-gray-100 last:border-0"><td class="py-2 px-4 font-medium text-gray-900 w-1/2">${item.label}</td><td class="py-2 px-4 text-gray-600">${item.value}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function closeModal() { document.getElementById('product-modal').classList.add('hidden'); }

function changeModalImage(element, imgUrl) {
    document.querySelectorAll('.color-btn').forEach(el => el.classList.remove('ring-offset-2', 'ring-2', 'ring-honda-red'));
    if(element) {
        const btn = element.querySelector('.color-btn') || element;
        btn.classList.add('ring-offset-2', 'ring-2', 'ring-honda-red');
    }
    // Use fixer here too
    const fixedUrl = getDirectLink(imgUrl);
    if(fixedUrl && fixedUrl.startsWith('http')) {
        const img = document.getElementById('modal-img');
        img.style.opacity = '0.5';
        img.src = fixedUrl;
        setTimeout(() => img.style.opacity = '1', 200);
    }
}

function selectVariant(element, price, brochure) {
    document.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active', 'bg-honda-red', 'text-white', 'border-honda-red'));
    element.classList.add('active', 'bg-honda-red', 'text-white', 'border-honda-red');
    if(price) document.getElementById('modal-price').innerText = 'Ex-Showroom: ₹ ' + price.replace('*','');
    
    // UPDATE BROCHURE ON VARIANT CLICK
    const link = document.getElementById('modal-brochure');
    const fixedBrochureUrl = getDirectLink(brochure, true);
    if(fixedBrochureUrl) {
        link.href = fixedBrochureUrl;
        link.classList.remove('hidden');
    } else {
        link.classList.add('hidden');
    }
}

function getColorHex(colorName) {
    const c = colorName.toLowerCase();
    if(c.includes('red')) return '#D91F26';
    if(c.includes('blue')) return '#1C3F94';
    if(c.includes('black')) return '#111111';
    if(c.includes('white')) return '#F0F0F0';
    if(c.includes('grey') || c.includes('gray')) return '#666666';
    if(c.includes('yellow')) return '#FFD700';
    if(c.includes('silver')) return '#C0C0C0';
    return '#CCCCCC';
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lightbox.classList.remove('hidden');
}
function closeLightbox() { document.getElementById('lightbox-modal').classList.add('hidden'); }

function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(finalizeSubmit)
        .catch(error => finalizeSubmit());
    } else {
        setTimeout(finalizeSubmit, 1000);
    }

    function finalizeSubmit() {
        const msg = document.getElementById('toast');
        document.getElementById('toast-msg').innerText = "Request Sent Successfully!";
        msg.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => msg.classList.add('translate-y-20', 'opacity-0'), 3000);
        e.target.reset();
        btn.innerText = originalText;
        btn.disabled = false;
        closeEnquiryModal();
    }
}

init();