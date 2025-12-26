// ============================================================
// 🚀 CONFIGURATION
// UPDATED WITH YOUR SPECIFIC DEPLOYMENT LINK
// ============================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuq4x96EW4iBsQEFxYc0k6QYORJUSKptqTwpLd3FE31pvwT-SR8m-yWIfv7T5ObRPe/exec";

// ============================================================
// HELPER: DIRECT LINKS (Fixes "No Google Drive" UI)
// ============================================================
function getDirectLink(url, isBrochure = false) {
    if (!url || typeof url !== 'string' || url.trim() === "" || url === "#") {
        return isBrochure ? "#" : "https://placehold.co/600x400?text=No+Image";
    }
    
    url = url.trim();

    // 1. Google Drive Links
    if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
        let id = null;
        // Supports: /file/d/ID, ?id=ID, &id=ID
        const parts = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (parts && parts[1]) {
            id = parts[1];
            if (isBrochure) {
                // FORCE DOWNLOAD for Brochures
                return `https://drive.google.com/uc?export=download&id=${id}`;
            }
            // USE THUMBNAIL API (Faster & More Reliable for PNGs)
            // sz=w1000 requests a high-quality 1000px wide image
            return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
        }
    }
    
    // 2. YouTube Links
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
// APP STATE
// ============================================================
let appData = {
    config: { hero_video_url: "videos/play1home.mp4", whatsapp_number: "919854092624" },
    services: [],
    offers: [],
    dealers: [],
    products: []   
};
// ============================================================
// INIT
// ============================================================
async function init() {
    renderHero(); 
    showLoadingState();

    try {
        // Add timestamp to prevent caching old data
        const fetchUrl = `${GOOGLE_SCRIPT_URL}?v=${Date.now()}`;
        console.log("Fetching fresh data from:", fetchUrl);

        const response = await fetch(fetchUrl);
        const raw = await response.json();

        console.log("Data Received:", raw);

        if (raw) {
            // ==============================
            // MERGE LOGIC: PRODUCTS
            // ==============================
            appData.products = (raw.products || []).map(p => {
                const pId = standardizeId(p.product_id || p.id || p.code);
                const pName = standardizeId(p.name);

                // Variants
                const variants = (raw.variants || [])
                    .filter(v => {
                        const vId = standardizeId(v.product_id || v.id || v.product);
                        return vId === pId || vId === pName;
                    })
                    .map(v => ({
                        name: v.variant_name || v.name || v.variant,
                        price: v.variant_price || v.price,
                        brochure: v.brochure_url || v.brochure
                    }));

                // Colors
                const colors = (raw.colors || [])
                    .filter(c => {
                        const cId = standardizeId(c.product_id || c.id || c.product);
                        return cId === pId || cId === pName;
                    })
                    .map(c => ({
                        name: c.color_name || c.name || c.color,
                        img: c.image_url || c.url || c.image || c.link || c.img
                    }));

                // Specs
                const pSpecs = (raw.specs || []).find(s => {
                    const sId = standardizeId(s.product_id || s.id || s.model || s.product);
                    return sId === pId || sId === pName;
                });

                let type = p.type || p.category || p.vehicle_type || "";
                let img = p.image_url || p.image || p.img || p.url || p.photo || p.link || "";
                if (img && typeof img === "string") img = img.trim();

                if ((!img || img === "") && colors.length > 0) {
                    img = colors[0].img;
                }

                return {
                    ...p,
                    type,
                    variants,
                    colors,
                    specs: processSpecs(pSpecs),
                    image_url: img,
                    brochure_url: p.brochure_url || p.brochure
                };
            });

            // ==============================
            // OTHER DATA (SAFE)
            // ==============================
            appData.services = raw.services || [];
            appData.dealers  = raw.dealers  || [];

            // ==============================
            // 🔐 OFFERS (CAROUSEL FIX)
            // ==============================
            if (Array.isArray(raw.offers) && raw.offers.length > 0) {
                appData.offers = raw.offers;
            } else {
                console.warn("Offers missing – using fallback");
                appData.offers = [
                    {
                        title: "Festival Finance Offer",
                        type: "Finance",
                        image_url: "https://placehold.co/1200x600?text=Festival+Offer"
                    }
                ];
            }

            // ==============================
            // CONFIG
            // ==============================
            if (raw.config) {
                appData.config = {};
                raw.config.forEach(c => {
                    if (c.key) appData.config[c.key] = c.value;
                });
            }

            // ==============================
            // RENDER UI
            // ==============================
            renderAllSections();
        }
    } catch (e) {
        console.error("Data Load Error:", e);
        showErrorState();
    }
}

// --- DATA HELPERS ---

function standardizeId(str) {
    if (!str) return "";
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, ""); 
}

function processSpecs(specRow) {
    if (!specRow) return {};
    const processed = {};
    const map = [
        { labels: ["Body Dimensions", "Dimensions"], keys: ["body_dimensions", "body", "dimensions"] },
        { labels: ["Engine"], keys: ["engine", "engine_spec"] },
        { labels: ["Transmission"], keys: ["transmission", "gearbox", "clutch"] },
        { labels: ["Tyres & Brakes"], keys: ["tyres_&_brakes", "tyres", "brakes", "wheels"] },
        { labels: ["Frame & Suspension"], keys: ["frame_&_suspension", "frame", "suspension"] },
        { labels: ["Electricals"], keys: ["electricals", "electrical", "battery", "lights"] }
    ];

    map.forEach(group => {
        const validKey = group.keys.find(k => specRow[k]);
        if (validKey) {
            const lines = String(specRow[validKey]).split('\n');
            processed[group.labels[0]] = lines.map(line => {
                const parts = line.split(':');
                if (parts.length >= 2) return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
                if (line.trim()) return { label: "Feature", value: line.trim() };
                return null;
            }).filter(x => x);
        }
    });
    return processed;
}

// ============================================================
// UI RENDERING
// ============================================================

function showLoadingState() {
    const loadingHTML = `<div class="col-span-full text-center py-20"><div class="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-honda-red mx-auto mb-3"></div><p class="text-gray-400">Loading live data...</p></div>`;
    ['motorcycle-grid', 'scooter-grid', 'offers-grid', 'dealers-grid'].forEach(id => {
        const el = document.getElementById(id); if(el) el.innerHTML = loadingHTML;
    });
}

function showErrorState() {
    const errorHTML = `<div class="col-span-full text-center py-10 text-red-500 font-medium">Failed to load data. Please check your internet connection.</div>`;
    ['motorcycle-grid', 'scooter-grid', 'offers-grid', 'dealers-grid'].forEach(id => {
        const el = document.getElementById(id); if(el) el.innerHTML = errorHTML;
    });
}

function renderAllSections() {
    renderHero();
    renderSocials();
    renderHeroCarousel();
    renderProducts();
    renderOffers();
    renderDealers();
    renderServiceImages();         
    populateModelDropdown();
}


function renderHero() {
    const container = document.getElementById('hero-media-container');
    if (!container) return;
    let videoUrl = appData.config.hero_video_url;
    const youtubeId = getYouTubeId(videoUrl);

    if (youtubeId) {
        container.innerHTML = `<iframe class="w-full h-full object-cover pointer-events-none scale-125" src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        if (videoUrl && videoUrl.includes('drive.google.com')) {
            const idMatch = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if(idMatch) videoUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
        if(videoUrl) {
            container.innerHTML = `<video autoplay muted loop playsinline class="w-full h-full object-cover opacity-60"><source src="${videoUrl}" type="video/mp4"></video>`;
        }
    }
}

// --- CAROUSEL LOGIC ---
let carouselIndex = 0;
let carouselInterval;

function renderHeroCarousel() {
    const track = document.getElementById('hero-carousel-track');
    const section = document.getElementById('hero-carousel-section');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');

    if (!track || !section) return;

    // Use appData.offers directly
    const offers = appData.offers.slice(0, 5); // Take top 5 for slider

    if (offers.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    
    // Clear existing
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Create Slides
    track.innerHTML = offers.map(o => `
        <div class="carousel-slide min-w-full w-full shrink-0 p-2 cursor-pointer transition-transform duration-500 hover:scale-[1.02]" onclick="openEnquiryModal('${o.type}', '${o.title}')">
            <div class="rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video relative group bg-white">
                <img src="${getDirectLink(o.image_url)}" class="w-full h-full object-fill bg-gray-50 transition-transform duration-700 group-hover:scale-105">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
        </div>
    `).join('');

    // Create Dots (Mobile & Desktop)
    dotsContainer.innerHTML = offers.map((_, i) => `
        <button onclick="goToSlide(${i})" class="w-3 h-3 rounded-full transition-all duration-300 border border-gray-300 ${i===0 ? 'bg-honda-red w-8 border-honda-red' : 'bg-white hover:bg-gray-100'}"></button>
    `).join('');

    // Event Listeners
    if(prevBtn) prevBtn.onclick = () => moveCarousel(-1);
    if(nextBtn) nextBtn.onclick = () => moveCarousel(1);

    // Auto Play
    startCarouselAutoPlay();
    section.onmouseenter = stopCarouselAutoPlay;
    section.onmouseleave = startCarouselAutoPlay;

    // Initial Update
    updateCarouselPosition();
    window.addEventListener('resize', updateCarouselPosition);
}

function moveCarousel(direction) {
    const offers = appData.offers.slice(0, 5);
    const itemsPerView = 1; // Always 1 full slide
    const maxIndex = Math.max(0, offers.length - itemsPerView);

    carouselIndex += direction;

    if (carouselIndex < 0) carouselIndex = maxIndex;
    if (carouselIndex > maxIndex) carouselIndex = 0;

    updateCarouselPosition();
}

function goToSlide(index) {
    carouselIndex = index;
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const track = document.getElementById('hero-carousel-track');
    const dots = document.getElementById('carousel-dots');
    if(!track) return;

    const slideWidth = 100; // Always 100%
    
    track.style.transform = `translateX(-${carouselIndex * slideWidth}%)`;

    // Update Dots
    if(dots) {
        Array.from(dots.children).forEach((dot, i) => {
            if(i === carouselIndex) {
                dot.className = 'w-8 h-3 rounded-full transition-all duration-300 border border-honda-red bg-honda-red';
            } else {
                dot.className = 'w-3 h-3 rounded-full transition-all duration-300 border border-gray-300 bg-white hover:bg-gray-100';
            }
        });
    }
}

function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    carouselInterval = setInterval(() => moveCarousel(1), 6000); // 6 seconds for better viewing
}

function stopCarouselAutoPlay() {
    clearInterval(carouselInterval);
}


function renderProducts() {
    const mContainer = document.getElementById('motorcycle-grid');
    const sContainer = document.getElementById('scooter-grid');
    
    if(mContainer) mContainer.innerHTML = '';
    if(sContainer) sContainer.innerHTML = '';

    let motoCount = 0;
    let scooterCount = 0;

    appData.products.forEach(p => {
        const html = createProductCard(p);
        const type = (p.type || "").toLowerCase().trim();
        
        // Flexible matching for type
        if (type.includes('motorcycle') || type.includes('bike')) {
            if(mContainer) { mContainer.innerHTML += html; motoCount++; }
        }
        else if (type.includes('scooter') || type.includes('scooty')) {
            if(sContainer) { sContainer.innerHTML += html; scooterCount++; }
        }
    });

    // Empty States
    if(mContainer && motoCount === 0) {
        mContainer.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">No motorcycles found. Please check 'Type' column in Sheet.</div>`;
    }
    if(sContainer && scooterCount === 0) {
        sContainer.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">No scooters found. Please check 'Type' column in Sheet.</div>`;
    }
}

function createProductCard(p) {
    const priceDisplay = p.price ? `₹ ${p.price}` : "View Details";
    const variantCount = p.variants ? p.variants.length : 0;
    
    let colorSwatchesHtml = '';
    if (p.colors && p.colors.length > 0) {
        colorSwatchesHtml = `<div class="flex gap-1.5 mt-3 h-4 overflow-hidden">`;
        p.colors.slice(0, 5).forEach(c => {
            colorSwatchesHtml += `<span class="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm ring-1 ring-gray-50" style="background-color: ${getColorHex(c.name)}" title="${c.name}"></span>`;
        });
        if(p.colors.length > 5) colorSwatchesHtml += `<span class="text-[9px] text-gray-400 font-medium self-center ml-1">+${p.colors.length - 5}</span>`;
        colorSwatchesHtml += `</div>`;
    }

    let variantBadge = variantCount > 0 ? `<span class="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-100/50">${variantCount} Variants</span>` : '';
    
    let displayImage = getDirectLink(p.image_url);

    // --- CASUAL STYLIST DESIGN (Two-Tone) ---
    return `<div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full" onclick="openProductModal('${p.product_id || p.id}')">
        <!-- Two-Tone: Light Gray Top for Image -->
        <div class="h-64 bg-gray-100/50 flex items-center justify-center  relative overflow-hidden group-hover:bg-gray-100 transition-colors duration-500">
            <!-- Note: Removed mix-blend-multiply to keep PNGs clean on gray -->
            <img src="${displayImage}" alt="${p.name}" loading="lazy" class="h-auto w-auto object-cover mix-blend-multiply transition duration-500 group-hover:scale-110" onerror="this.src='https://placehold.co/600x400?text=${p.name}'">
            ${variantBadge}
        </div>
        
        <!-- White Bottom for Content -->
        <div class="p-6 flex flex-col flex-grow bg-white">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">${p.type || "Honda"}</span>
                    <h3 class="font-display font-bold text-xl text-gray-900 leading-tight group-hover:text-honda-red transition-colors">
                        ${toTitleCase(p.name)}
                        </h3>

                </div>
            </div>
            
            ${colorSwatchesHtml}
            
            <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-[10px] text-gray-400 uppercase font-semibold">Ex-Showroom</span>
                    <p class="text-gray-900 font-bold text-lg leading-none group-hover:text-honda-red transition-colors">${priceDisplay}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-honda-red group-hover:text-white transition-all">
                    <i class="fas fa-arrow-right text-xs"></i>
                </div>
            </div>
        </div>
    </div>`;
}

// --- MODAL & INTERACTIONS ---

function openProductModal(productId) {
    const cleanId = standardizeId(productId);
    const p = appData.products.find(x => standardizeId(x.product_id || x.id) === cleanId);
    if(!p) return;

    const modal = document.getElementById('product-modal');
    document.getElementById('modal-title').innerText = toTitleCase(p.name);
    document.getElementById('modal-price').innerText = `Ex-Showroom: ₹ ${p.price || 'N/A'}`;
    
    const img = document.getElementById('modal-img');
    img.src = getDirectLink(p.image_url);
    img.style.cursor = 'zoom-in'; // UX Hint
    img.onclick = () => openLightbox(img.src);

    const broLink = document.getElementById('modal-brochure');
    
    // FALLBACK LOGIC: Use product brochure, OR first variant's brochure, OR hide if none.
    let brochureUrl = p.brochure_url || p.brochure;
    if ((!brochureUrl || brochureUrl === "#") && p.variants && p.variants.length > 0) {
        brochureUrl = p.variants[0].brochure;
    }

    const broUrl = getDirectLink(brochureUrl, true);
    broLink.href = broUrl;
    broLink.classList.toggle('hidden', broUrl === '#');

    // Variants
    const varContainer = document.getElementById('modal-variants');
    if(varContainer) {
        if(p.variants && p.variants.length > 0) {
            varContainer.innerHTML = p.variants.map((v, idx) => {
                const activeClass = idx === 0 ? 'bg-honda-red text-white border-honda-red' : 'bg-white text-gray-700 border-gray-200 hover:border-honda-red';
                return `<button onclick="updateVariant(this, '${v.price}', '${v.brochure}')" 
                    class="variant-btn px-4 py-2 m-1 rounded text-xs font-bold border transition duration-200 uppercase tracking-wide ${activeClass}">
                    ${toTitleCase(v.name)}
                </button>`;
            }).join('');
            if(p.variants[0].price) document.getElementById('modal-price').innerText = `Ex-Showroom: ₹ ${p.variants[0].price}`;
        } else {
            varContainer.innerHTML = '<span class="text-xs text-gray-400 border px-3 py-1 rounded">Standard</span>';
        }
    }

    // Colors
    const colContainer = document.getElementById('modal-colors');
    if(colContainer) {
        if(p.colors && p.colors.length > 0) {
            colContainer.innerHTML = p.colors.map(c => `
                <div onclick="updateColor(this, '${c.img}')" class="color-swatch w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm inline-block mr-2 hover:scale-110 transition" 
                     style="background-color: ${getColorHex(c.name)}" title="${c.name}">
                </div>`).join('');
        } else {
            colContainer.innerHTML = '<span class="text-xs text-gray-400">Standard</span>';
        }
    }

    renderSpecsUI(p.specs);
    document.getElementById('product-book-btn').onclick = () => openEnquiryModal('New Model', p.name);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateVariant(btn, price, brochure) {
    document.querySelectorAll('.variant-btn').forEach(b => {
        b.classList.remove('bg-honda-red', 'text-white', 'border-honda-red');
        b.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
    });
    btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
    btn.classList.add('bg-honda-red', 'text-white', 'border-honda-red');
    document.getElementById('modal-price').innerText = `Ex-Showroom: ₹ ${price}`;
    
    const broLink = document.getElementById('modal-brochure');
    const broUrl = getDirectLink(brochure, true);
    broLink.href = broUrl;
    broLink.classList.toggle('hidden', broUrl === '#');
}

function updateColor(btn, imgUrl) {
    document.querySelectorAll('.color-swatch').forEach(b => {
        b.style.transform = 'scale(1)';
        b.style.boxShadow = 'none';
    });
    btn.style.transform = 'scale(1.2)';
    btn.style.boxShadow = '0 0 0 2px white, 0 0 0 4px #CC0000';
    
    const fixedUrl = getDirectLink(imgUrl);
    if(fixedUrl && !fixedUrl.includes('placehold')) {
        const img = document.getElementById('modal-img');
        img.style.opacity = '0.5';
        setTimeout(() => { img.src = fixedUrl; img.style.opacity = '1'; }, 200);
    }
}

function renderSpecsUI(specs) {
    const tabs = document.getElementById('specs-tabs');
    const content = document.getElementById('specs-content');
    
    if (!specs || Object.keys(specs).length === 0) {
        tabs.innerHTML = '';
        content.innerHTML = '<p class="text-center text-gray-400 py-8">Specifications updating...</p>';
        return;
    }

    const categories = Object.keys(specs);
    tabs.innerHTML = categories.map((cat, idx) => `
        <button onclick="switchSpecTab(this, '${cat}')" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${idx === 0 ? 'border-honda-red text-honda-red bg-red-50/50' : 'border-transparent text-gray-500 hover:text-gray-800'}">
            ${cat}
        </button>`).join('');

    // Store specs globally for tab switching
    window.currentProductSpecs = specs;
    switchSpecTab(tabs.children[0], categories[0]);
}

window.switchSpecTab = function(btn, category) {
    const tabs = document.getElementById('specs-tabs');
    Array.from(tabs.children).forEach(b => b.className = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition whitespace-nowrap');
    if(btn) btn.className = 'px-4 py-2 text-sm font-medium border-b-2 border-honda-red text-honda-red bg-red-50/50 transition whitespace-nowrap';

    const specs = window.currentProductSpecs ? window.currentProductSpecs[category] : [];
    
    const content = document.getElementById('specs-content');
    content.innerHTML = `<table class="w-full text-sm">${specs.map((row, i) => `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100">
            <td class="py-2 px-3 font-semibold text-gray-700 w-1/2">${row.label}</td>
            <td class="py-2 px-3 text-gray-600">${row.value}</td>
        </tr>`).join('')}</table>`;
}

// --- GENERAL UI ---
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

    if (type === 'New Model' || type === 'Exchange') {
        typeSelect.value = type;
        modelContainer.classList.remove('hidden');
        if(modelName) modelSelect.value = modelName;
    } else {
        typeSelect.value = type.includes('Service') ? 'Service Booking' : (type.includes('Insurance') ? 'Insurance Renewal' : 'General Enquiry');
        modelContainer.classList.add('hidden');
    }
    modal.classList.remove('hidden');
}

function renderOffers() {
    const box = document.getElementById('offers-grid');
    if(!box) return;
    if(appData.offers.length === 0) { box.innerHTML = '<div class="col-span-full text-center text-gray-400">No active offers.</div>'; return; }
    box.innerHTML = appData.offers.map(o => {
        const isFin = (o.type||'').toLowerCase().includes('finance');
        return `<div onclick="openEnquiryModal('${o.type}', '${o.title}')" class="bg-white rounded-xl shadow-lg cursor-pointer border-t-4 ${isFin?'border-honda-red':'border-blue-600'} flex flex-col group overflow-hidden">
            <div class="h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
                <img src="${getDirectLink(o.image_url)}" class="w-full h-full object-contain p-2 group-hover:scale-105 transition cursor-zoom-in" 
                      onclick="event.stopPropagation(); openLightbox(this.src)">
            </div>
            <div class="p-6 text-center flex-grow flex flex-col"><h3 class="font-bold text-xl mb-2">${toTitleCase(o.title)}</h3>
            <p class="text-sm text-gray-600 mb-4">${o.description}</p><span class="mt-auto font-bold text-xs uppercase ${isFin?'text-honda-red':'text-blue-600'}">Enquire Now &rarr;</span></div>
        </div>`;
    }).join('');
}

function renderDealers() {
    const box = document.getElementById('dealers-grid');
    if(!box) return;
    box.innerHTML = appData.dealers.map(d => `
        <div class="bg-white border rounded-xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-md transition">
            <div class="w-full sm:w-28 h-28 bg-gray-50 rounded shrink-0 overflow-hidden">
                <img src="${getDirectLink(d.image_url)}" class="w-full h-full object-cover cursor-zoom-in" onclick="openLightbox(this.src)">
            </div>
            <div><h3 class="font-bold text-lg">${toTitleCase(d.name)}</h3><p class="text-sm text-gray-500 mb-2"><i class="fas fa-map-marker-alt text-honda-red mr-1"></i> ${d.location}</p>
            ${d.sales_contact?`<div class="text-sm"><span class="font-bold text-xs text-gray-400">SALES:</span> <a href="tel:${d.sales_contact}">${d.sales_contact}</a></div>`:''}
            ${d.service_contact?`<div class="text-sm"><span class="font-bold text-xs text-gray-400">SERVICE:</span> <a href="tel:${d.service_contact}">${d.service_contact}</a></div>`:''}
            </div>
        </div>`).join('');
}

function renderServiceImages() {
    appData.services.forEach(s => {
        const id = s.id || s.service_id;
        if(id) { 
            const el = document.getElementById(`img-service-${id.toLowerCase()}`); 
            if(el) {
                el.src = getDirectLink(s.image_url);
                el.style.cursor = 'zoom-in';
                el.onclick = () => openLightbox(el.src);
            }
        }
    });
}

function renderSocials() {
    const div = document.getElementById('social-links-container');
    if(!div) return;
    const map = { facebook_url: 'fa-facebook-f', instagram_url: 'fa-instagram', youtube_url: 'fa-youtube', twitter_url: 'fa-x-twitter' };
    div.innerHTML = Object.keys(map).map(k => appData.config[k] ? `<a href="${appData.config[k]}" target="_blank" class="text-gray-400 hover:text-white transition"><i class="fab ${map[k]}"></i></a>` : '').join('');
    const wa = document.getElementById('wa-link'); if(wa && appData.config.whatsapp_number) wa.href = `https://wa.me/${appData.config.whatsapp_number}`;
}

// Make globally available for inline onclicks
window.openLightbox = function(src) { 
    document.getElementById('lightbox-img').src = src; 
    document.getElementById('lightbox-modal').classList.remove('hidden'); 
};

function scrollToModels() {
    document.getElementById('explore-models').scrollIntoView({behavior: 'smooth'});
}
// ============================================================
// TEXT FORMATTER: Title Case (Auto Capitalization)
// ============================================================
function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}
function initShowroomCarousel() {
    const slides = document.querySelectorAll('.carousel-img');
    let index = 0;

    if (!slides || slides.length === 0) return;

    setInterval(() => {
        slides[index].classList.remove('opacity-100');
        slides[index].classList.add('opacity-0');

        index = (index + 1) % slides.length;

        slides[index].classList.remove('opacity-0');
        slides[index].classList.add('opacity-100');
    }, 2000); // change image every 2 seconds
}


function closeEnquiryModal() { document.getElementById('enquiry-modal').classList.add('hidden'); }
function closeModal() { document.getElementById('product-modal').classList.add('hidden'); document.body.style.overflow = 'auto'; }
function openLightbox(src) { document.getElementById('lightbox-img').src = src; document.getElementById('lightbox-modal').classList.remove('hidden'); }
function closeLightbox() { document.getElementById('lightbox-modal').classList.add('hidden'); }
function toggleModelDropdown(val) { document.getElementById('model-select-container').classList.toggle('hidden', !(val === 'New Model' || val === 'Exchange')); }
function populateModelDropdown() { const s = document.getElementById('modal-model'); s.innerHTML = '<option value="" disabled selected>Select Model</option>'; appData.products.forEach(p => { const o = document.createElement('option'); o.value = p.name; o.innerText = toTitleCase(p.name); s.appendChild(o); }); }
function getColorHex(n) { n=n.toLowerCase(); if(n.includes('red')) return '#DC2626'; if(n.includes('blue')) return '#2563EB'; if(n.includes('black')) return '#1F2937'; if(n.includes('white')) return '#F3F4F6'; if(n.includes('grey')) return '#6B7280'; if(n.includes('yellow')) return '#EAB308'; if(n.includes('matte')) return '#374151'; return '#9CA3AF'; }
window.handleFormSubmit = function(e) { e.preventDefault(); const btn = document.getElementById('submitBtn'); const form = e.target; const txt = btn.innerText; btn.innerText = "Sending..."; btn.disabled = true; const d = {}; new FormData(form).forEach((v, k) => d[k] = v); fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(d) }).then(() => { const t = document.getElementById('toast'); t.classList.remove('translate-y-20', 'opacity-0'); setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000); form.reset(); closeEnquiryModal(); }).catch(e => console.error(e)).finally(() => { btn.innerText = txt; btn.disabled = false; }); }


document.addEventListener('DOMContentLoaded', () => {
    init();
    initShowroomCarousel();
});

