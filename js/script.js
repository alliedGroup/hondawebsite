const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE";

// ============================================================
// DEFAULT DATA (Fallback)
// ============================================================
let appData = {
    config: {
        hero_video_url: "https://assets.mixkit.co/videos/preview/mixkit-motorcycle-racer-riding-fast-on-a-highway-33952-large.mp4",
        whatsapp_number: "919854092624",
        facebook_url: "https://facebook.com",
        instagram_url: "https://instagram.com",
        youtube_url: "https://youtube.com",
        twitter_url: "https://twitter.com",
        linkedin_url: "https://linkedin.com"
    },
    services: [
        { id: "shield", image_url: "https://placehold.co/600x400/f8f9fa/cc0000?text=Honda+Shield+Graphic" },
        { id: "oil", image_url: "https://placehold.co/600x400/f8f9fa/cc0000?text=Genuine+Oil" },
        { id: "parts", image_url: "https://placehold.co/600x400/f8f9fa/cc0000?text=Genuine+Parts" }
    ],
    offers: [
        {
            title: "Low Down Payment",
            description: "Bring home your dream Honda with minimum down payment starting from just ₹3,999*. Easy documentation and quick approval.",
            image_url: "https://placehold.co/800x400/CC0000/FFFFFF?text=Zero+Down+Payment",
            type: "Finance"
        },
        {
            title: "Student Special Offer",
            description: "Exclusive cashback of up to ₹5,000* for students. Valid on showing a valid College/University ID card.",
            image_url: "https://placehold.co/800x400/0000CC/FFFFFF?text=Student+Special",
            type: "Special"
        }
    ],
    dealers: [
        {
            name: "Ashangbam Honda",
            location: "Chingya Leikai, Fulertal, Dist.- Cachar",
            image_url: "https://placehold.co/150x150/png?text=Ashangbam",
            sales_contact: "9435627287",
            service_contact: "6000732287",
            email: "arautomobileft@gmail.com"
        },
        {
            name: "Lovnish Honda",
            location: "Patharkandi Road, Kanisail, Karimganj",
            image_url: "https://placehold.co/150x150/png?text=Lovnish",
            sales_contact: "9716169455",
            service_contact: "9401393100",
            email: "barakhonda.kmj@gmail.com"
        },
        {
            name: "B K Motors",
            location: "Madhumala, Patharkandi",
            image_url: "https://placehold.co/150x150/png?text=BK+Motors",
            sales_contact: "", 
            service_contact: "9101992269",
            email: "bkmotors69@gmail.com"
        },
        {
            name: "HKD Honda",
            location: "College Road, Hailakandi",
            image_url: "https://placehold.co/150x150/png?text=HKD+Honda",
            sales_contact: "8011206913",
            service_contact: "",
            email: "hkdhonda2023@gmail.com"
        }
    ],
    products: [
        // MOTORCYCLES
        {
            id: "hornet20",
            name: "Hornet 2.0",
            type: "Motorcycle",
            price: "1,39,000*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Hornet2.0/Hornet2.0-home-banner-m.png",
            variants: [
                { name: "Standard (OBD-2B)", price: "1,39,000*" },
                { name: "Repsol Edition (OBD-2B)", price: "1,40,000*" }
            ],
            colors: [
                { name: "Matte Sangria Red", img: "https://placehold.co/400x300/red/white?text=Hornet+Red" },
                { name: "Matte Marvel Blue", img: "https://placehold.co/400x300/blue/white?text=Hornet+Blue" },
                { name: "Matte Axis Grey", img: "https://placehold.co/400x300/grey/white?text=Hornet+Grey" },
                { name: "Pearl Igneous Black", img: "https://placehold.co/400x300/black/white?text=Hornet+Black" }
            ]
        },
        {
            id: "sp125",
            name: "SP 125",
            type: "Motorcycle",
            price: "86,017*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/SP125/sp125-home-banner-m.png",
            variants: [
                { name: "Drum (OBD-2B)", price: "86,017*" },
                { name: "Disc (OBD-2B)", price: "90,017*" },
                { name: "Sports Edition", price: "90,567*" }
            ],
            colors: [
                { name: "Black", img: "" }, { name: "Matte Axis Grey", img: "" }, 
                { name: "Imperial Red", img: "" }, { name: "Pearl Siren Blue", img: "" }, 
                { name: "Decent Blue", img: "" }
            ]
        },
        {
            id: "shine125",
            name: "Shine 125",
            type: "Motorcycle",
            price: "79,800*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Shine/shine-home-banner-m.png",
            variants: [
                { name: "Drum", price: "79,800*" }, { name: "Disc", price: "83,800*" }, { name: "Celebration", price: "84,500*" }
            ],
            colors: [
                { name: "Black", img: "" }, { name: "Geny Grey", img: "" }, 
                { name: "Rebel Red", img: "" }, { name: "Matte Axis Grey", img: "" }
            ]
        },
        {
            id: "unicorn",
            name: "Unicorn",
            type: "Motorcycle",
            price: "1,09,800*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Unicorn/unicorn-home-banner-m.png",
            variants: [{ name: "Standard", price: "1,09,800*" }],
            colors: [
                { name: "Pearl Igneous Black", img: "" }, { name: "Imperial Red Metallic", img: "" }, { name: "Matte Axis Gray", img: "" }
            ]
        },
        {
            id: "sp160",
            name: "SP 160",
            type: "Motorcycle",
            price: "1,17,500*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/SP160/sp160-home-banner-m.png",
            variants: [
                { name: "Single Disc", price: "1,17,500*" }, { name: "Double Disc", price: "1,21,900*" }
            ],
            colors: [
                { name: "Matte Marvel Blue", img: "" }, { name: "Matte Dark Blue", img: "" }, { name: "Pearl Spartan Red", img: "" }
            ]
        },
        {
            id: "cd110",
            name: "CD 110 Dream",
            type: "Motorcycle",
            price: "73,400*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/CD110/CD110-home-banner-m.png",
            variants: [{ name: "Standard", price: "73,400*" }],
            colors: [
                { name: "Black with Gold", img: "" }, { name: "Black with Blue", img: "" }, { name: "Black with Red", img: "" }
            ]
        },
        {
            id: "livo",
            name: "Livo",
            type: "Motorcycle",
            price: "78,500*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Livo/Livo-home-banner-m.png",
            variants: [
                { name: "Drum", price: "78,500*" }, { name: "Disc", price: "82,500*" }
            ],
            colors: [
                { name: "Athletic Blue", img: "" }, { name: "Matte Crust", img: "" }, { name: "Black", img: "" }
            ]
        },
        {
            id: "xblade",
            name: "X-Blade",
            type: "Motorcycle",
            price: "1,21,313*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/XBlade/XBlade-home-banner-m.png",
            variants: [
                { name: "Single Disc", price: "1,21,313*" }, { name: "Double Disc", price: "1,25,703*" }
            ],
            colors: [
                { name: "Spartan Red", img: "" }, { name: "Matte Marvel Blue", img: "" }, { name: "Matte Steel Black", img: "" }
            ]
        },

        // SCOOTERS
        {
            id: "activa6g",
            name: "Activa 6G",
            type: "Scooter",
            price: "76,234*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Activa/Activa-home-banner-m.png",
            variants: [
                { name: "Standard", price: "76,234*" }, { name: "Deluxe", price: "78,734*" }, { name: "H-Smart", price: "82,234*" }
            ],
            colors: [
                { name: "Pearl Precious White", img: "" }, { name: "Decent Blue", img: "" }, { name: "Rebel Red", img: "" }, { name: "Matte Axis Grey", img: "" }, { name: "Black", img: "" }
            ]
        },
        {
            id: "activa125",
            name: "Activa 125",
            type: "Scooter",
            price: "79,806*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Activa125/Activa125-home-banner-m.png",
            variants: [
                { name: "Drum", price: "79,806*" }, { name: "Drum Alloy", price: "83,474*" }, { name: "Disc", price: "86,979*" }, { name: "H-Smart", price: "88,979*" }
            ],
            colors: [
                { name: "Pearl Night Star Black", img: "" }, { name: "Heavy Grey", img: "" }, { name: "Rebel Red", img: "" }, { name: "Pearl White", img: "" }
            ]
        },
        {
            id: "dio",
            name: "Dio",
            type: "Scooter",
            price: "70,211*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Dio/Dio-home-banner-m.png",
            variants: [
                { name: "Standard", price: "70,211*" }, { name: "Deluxe", price: "74,212*" }, { name: "H-Smart", price: "77,712*" }
            ],
            colors: [
                { name: "Sports Red", img: "" }, { name: "Jazzy Blue", img: "" }, { name: "Matte Axis Grey", img: "" }, { name: "Dazzle Yellow", img: "" }
            ]
        },
        {
            id: "dio125",
            name: "Dio 125",
            type: "Scooter",
            price: "83,400*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Dio125/dio125-home-banner-m.png",
            variants: [
                { name: "Standard", price: "83,400*" }, { name: "Smart", price: "91,300*" }
            ],
            colors: [
                { name: "Pearl Siren Blue", img: "" }, { name: "Pearl Deep Ground Grey", img: "" }, { name: "Pearl Night Star Black", img: "" }, { name: "Matte Marvel Blue", img: "" }
            ]
        },
        {
            id: "grazia125",
            name: "Grazia 125",
            type: "Scooter",
            price: "82,520*",
            image_url: "https://www.honda2wheelersindia.com/assets/images/Grazia/Grazia-home-banner-m.png",
            variants: [
                { name: "Drum", price: "82,520*" }, { name: "Disc", price: "89,845*" }, { name: "Sports Edition", price: "90,845*" }
            ],
            colors: [
                { name: "Matte Axis Grey", img: "" }, { name: "Matte Marvel Blue", img: "" }, { name: "Pearl Night Star Black", img: "" }, { name: "Sports Red", img: "" }
            ]
        }
    ]
};

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
    // 1. RENDER IMMEDIATELY with defaults
    renderAllSections();

    // 2. FETCH FROM GOOGLE SHEET (Silent Update)
    if (!GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const remoteData = await response.json();
            
            if (remoteData && remoteData.products && remoteData.products.length > 0) {
                console.log("Updated from Sheet");
                appData = remoteData;
                renderAllSections();
            }
        } catch (e) {
            console.log("Using default local data");
        }
    }
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
    const videoParent = document.getElementById('hero-video');
    if (videoParent && appData.config.hero_video_url) {
        const currentSrc = videoParent.querySelector('source') ? videoParent.querySelector('source').src : '';
        if (currentSrc !== appData.config.hero_video_url) {
             videoParent.innerHTML = `<source src="${appData.config.hero_video_url}" type="video/mp4">`;
             videoParent.load();
        }
    }
}

function renderSocials() {
    const waLink = document.getElementById('wa-link');
    if(waLink && appData.config.whatsapp_number) {
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
    if(container) {
        let html = '';
        for (const [key, icon] of Object.entries(socialMap)) {
            if(appData.config[key]) {
                html += `<a href="${appData.config[key]}" target="_blank" class="text-gray-400 hover:text-white transition"><i class="fab ${icon} text-lg"></i></a>`;
            }
        }
        container.innerHTML = html;
    }
}

function renderServiceImages() {
    if (!appData.services) return;
    appData.services.forEach(s => {
        const img = document.getElementById(`img-service-${s.id}`);
        if(img && s.image_url) img.src = s.image_url;
    });
}

function renderOffers() {
    const container = document.getElementById('offers-grid');
    if (!container) return;
    
    container.innerHTML = appData.offers.map(offer => `
        <div onclick="openEnquiryModal('${offer.type || 'Offer'}: ${offer.title}')" class="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 flex flex-col cursor-pointer h-full">
            <div class="relative h-56 overflow-hidden">
                <img src="${offer.image_url || 'https://placehold.co/800x400?text=Offer'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${offer.title}">
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

    container.innerHTML = appData.dealers.map(dealer => `
        <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition flex flex-col sm:flex-row gap-6 group">
            <div class="w-full sm:w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                <img src="${dealer.image_url || 'https://placehold.co/150x150?text=Dealer'}" class="w-full h-full object-cover" alt="${dealer.name}">
            </div>
            <div class="flex-grow">
                <h3 class="text-xl font-bold text-gray-900 mb-1">${dealer.name}</h3>
                <p class="text-sm text-gray-500 mb-4"><i class="fas fa-map-marker-alt text-honda-red mr-1"></i> ${dealer.location}</p>
                <div class="space-y-1 text-sm text-gray-600">
                    ${dealer.sales_contact ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide">SALES:</span> <a href="tel:${dealer.sales_contact}" class="text-gray-800 hover:text-honda-red font-medium">${dealer.sales_contact}</a></p>` : ''}
                    ${dealer.service_contact ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide">SERVICE:</span> <a href="tel:${dealer.service_contact}" class="text-gray-800 hover:text-honda-red font-medium">${dealer.service_contact}</a></p>` : ''}
                    ${dealer.email ? `<p class="flex justify-between"><span class="font-bold text-xs text-gray-400 tracking-wide">EMAIL:</span> <a href="mailto:${dealer.email}" class="text-honda-red hover:underline truncate ml-2">${dealer.email}</a></p>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderProducts() {
    const motoContainer = document.getElementById('motorcycle-grid');
    const scooterContainer = document.getElementById('scooter-grid');
    const featuredContainer = document.getElementById('featured-grid');

    if (motoContainer) motoContainer.innerHTML = '';
    if (scooterContainer) scooterContainer.innerHTML = '';
    if (featuredContainer) featuredContainer.innerHTML = '';

    const motorcycles = appData.products.filter(p => p.type.toLowerCase().includes('motorcycle'));
    motorcycles.forEach(p => { if (motoContainer) motoContainer.innerHTML += createCardHTML(p); });

    const scooters = appData.products.filter(p => p.type.toLowerCase().includes('scooter'));
    scooters.forEach(p => { if (scooterContainer) scooterContainer.innerHTML += createCardHTML(p); });

    if (featuredContainer && appData.products.length > 0) {
        featuredContainer.innerHTML = appData.products.slice(0, 4).map(p => createCardHTML(p)).join('');
    }
}

function createCardHTML(p) {
    const imgUrl = (p.image_url && p.image_url !== "") ? p.image_url : `https://placehold.co/400x300?text=${p.name}`;
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
    appData.products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.innerText = p.name;
        modelSelect.appendChild(option);
    });
}

function openModal(id) {
    const p = appData.products.find(x => x.id == id);
    if(!p) return;
    
    document.getElementById('modal-title').innerText = p.name;
    let basePrice = p.price;
    if(p.variants && p.variants.length > 0) basePrice = p.variants[0].price;
    document.getElementById('modal-price').innerText = 'Ex-Showroom: ₹ ' + basePrice.replace('*','');
    
    const modalImg = document.getElementById('modal-img');
    modalImg.src = p.image_url || `https://placehold.co/400x300?text=${p.name}`;
    modalImg.onclick = function() { openLightbox(this.src); };
    
    const variantsList = document.getElementById('modal-variants');
    if(variantsList) {
        if (p.variants && p.variants.length > 0) {
            variantsList.innerHTML = p.variants.map((v, index) => 
                `<button onclick="selectVariant(this, '${v.price}')" class="variant-btn px-3 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200 hover:border-honda-red hover:text-honda-red transition ${index === 0 ? 'active bg-honda-red text-white border-honda-red' : ''}">${v.name}</button>`
            ).join('');
        } else { variantsList.innerHTML = '<span class="text-xs text-gray-400">Standard</span>'; }
    }

    const colorsList = document.getElementById('modal-colors');
    if(colorsList) {
        if (p.colors && p.colors.length > 0) {
            colorsList.innerHTML = p.colors.map(c => `
                <div onclick="changeModalImage('${c.img}')" class="cursor-pointer group relative">
                    <span class="block w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition ring-1 ring-gray-200" 
                          style="background-color:${getColorHex(c.name)}" 
                          title="${c.name}">
                </span>
            </div>
        `).join('');
        } else { colorsList.innerHTML = '<span class="text-xs text-gray-400">Standard</span>'; }
    }
    
    const bookBtn = document.getElementById('product-book-btn');
    if(bookBtn) bookBtn.onclick = function() { openEnquiryModal('New Model', p.name); };

    document.getElementById('product-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('product-modal').classList.add('hidden'); }

function changeModalImage(imgUrl) {
    if(imgUrl && imgUrl.startsWith('http')) {
        const img = document.getElementById('modal-img');
        img.style.opacity = '0.5';
        img.src = imgUrl;
        setTimeout(() => img.style.opacity = '1', 200);
    }
}

function selectVariant(element, price) {
    document.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active', 'bg-honda-red', 'text-white', 'border-honda-red'));
    element.classList.add('active', 'bg-honda-red', 'text-white', 'border-honda-red');
    if(price) document.getElementById('modal-price').innerText = 'Ex-Showroom: ₹ ' + price;
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
