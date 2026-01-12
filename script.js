// Données de test pour les produits
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Smartphone XYZ",
        price: 150000,
        description: "Smartphone haut de gamme avec écran 6.5 pouces et triple caméra",
        quality: 4,
        images: [
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        ],
        video: "https://assets.mixkit.co/videos/preview/mixkit-smartphone-in-hand-1176-large.mp4",
        category: "nouveau"
    },
    {
        id: 2,
        name: "Casque Audio Bluetooth",
        price: 35000,
        description: "Casque sans fil avec réduction de bruit active",
        quality: 5,
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        ],
        video: "",
        category: "promo"
    },
    {
        id: 3,
        name: "Montre Connectée",
        price: 75000,
        description: "Montre intelligente avec suivi d'activité et notifications",
        quality: 3,
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
        ],
        video: "",
        category: "nouveau"
    }
];

// Panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.querySelector('.close');
const checkoutBtn = document.getElementById('checkoutBtn');
const paymentModal = document.getElementById('paymentModal');
const closePayment = document.querySelectorAll('.close-payment');
const paymentForm = document.getElementById('paymentForm');
const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chatWidget');
const closeChat = document.getElementById('closeChat');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal de détail produit
const productDetailModal = document.createElement('div');
productDetailModal.id = 'productDetailModal';
productDetailModal.className = 'modal product-detail-modal';
productDetailModal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>Détails du produit</h2>
            <span class="close-detail">&times;</span>
        </div>
        <div class="modal-body" id="productDetailContent">
            <!-- Contenu du détail produit -->
        </div>
    </div>
`;
document.body.appendChild(productDetailModal);

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger les produits depuis le localStorage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    
    displayProducts();
    updateCartCount();
    setupEventListeners();
    initializeChat();
});

// Afficher les produits
function displayProducts(filter = 'all') {
    productsContainer.innerHTML = '';
    
    let filteredProducts = products;
    if (filter !== 'all') {
        filteredProducts = products.filter(product => product.category === filter);
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Générer les étoiles
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= product.quality) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        const imageCount = product.images && product.images.length > 1 ? `<span class="image-count-badge">+${product.images.length - 1}</span>` : '';
        const videoIcon = product.video ? '<i class="fas fa-video video-indicator"></i>' : '';
        const categoryBadge = `<span class="category-badge ${product.category}">${product.category === 'promo' ? 'PROMO' : 'NOUVEAU'}</span>`;
        
        productCard.innerHTML = `
            <div class="product-image-container" data-id="${product.id}">
                <img src="${mainImage}" alt="${product.name}" class="product-image">
                ${imageCount}
                ${videoIcon}
                ${categoryBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString()} FCFA</p>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="star-rating">
                    ${stars}
                </div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Ajouter les événements aux boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    // Ajouter les événements pour cliquer sur l'image du produit
    document.querySelectorAll('.product-image-container').forEach(container => {
        container.addEventListener('click', function(e) {
            if (!e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductDetail(productId);
            }
        });
    });
}

// Fonction pour afficher les détails du produit
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= product.quality) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    // Générer les miniatures d'images
    let thumbnails = '';
    const productImages = product.images || [];
    productImages.forEach((image, index) => {
        thumbnails += `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${image}" alt="Miniature ${index + 1}">
            </div>
        `;
    });
    
    const detailContent = document.getElementById('productDetailContent');
    detailContent.innerHTML = `
        <div class="product-detail-gallery">
            <div class="main-product-image">
                <img id="mainProductImage" src="${productImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" alt="${product.name}">
                <div class="product-thumbnails">
                    ${thumbnails}
                </div>
            </div>
            
            ${product.video ? `
            <div class="product-video-container">
                <video controls>
                    <source src="${product.video}" type="video/mp4">
                    Votre navigateur ne supporte pas les vidéos.
                </video>
            </div>
            ` : '<div class="product-video-container"></div>'}
            
            <div class="product-details">
                <h3>${product.name}</h3>
                <div class="star-rating">
                    ${stars}
                </div>
                <div class="product-price">${product.price.toLocaleString()} FCFA</div>
                <span class="product-category ${product.category}">
                    ${product.category === 'promo' ? 'PROMOTION' : 'NOUVEAUTÉ'}
                </span>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-detail btn btn-primary" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        </div>
    `;
    
    productDetailModal.style.display = 'flex';
    
    // Ajouter les événements pour les miniatures
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            document.getElementById('mainProductImage').src = productImages[index];
            
            // Mettre à jour la miniature active
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Ajouter au panier depuis le détail
    document.querySelector('.add-to-cart-detail').addEventListener('click', function() {
        addToCart(productId);
        productDetailModal.style.display = 'none';
        showNotification(`${product.name} ajouté au panier`);
    });
}

// Gestion du panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} ajouté au panier`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
    }
    
    updateCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Mettre à jour l'affichage du panier si ouvert
    if (cartModal.style.display === 'flex') {
        displayCartItems();
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

function displayCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} FCFA × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-price">${itemTotal.toLocaleString()} FCFA</div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toLocaleString();
    
    // Ajouter les événements
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

// Commandes
function createOrder(clientData) {
    const orderId = Date.now();
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        client: clientData,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'paid'
    };
    
    // Charger les commandes existantes
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Vider le panier après commande
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    return orderId;
}

// Chat
function initializeChat() {
    // Réponses automatiques
    sendMessage.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Ajouter le message de bienvenue
    addMessage("Bonjour! Comment pouvons-nous vous aider aujourd'hui?", 'bot');
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Ajouter le message de l'utilisateur
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Réponse automatique après un délai
    setTimeout(() => {
        const responses = [
            "Merci pour votre message. Nous vous répondrons bientôt.",
            "Je note votre demande. Un conseiller vous contactera si nécessaire.",
            "Pouvez-vous nous en dire plus sur votre demande?",
            "Nous avons bien reçu votre message. Merci de nous contacter!",
            "Pour toute question sur nos produits, n'hésitez pas à consulter notre catalogue.",
            "Nous sommes disponibles du lundi au vendredi de 9h à 18h."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
    }, 1000);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gestion des événements
function setupEventListeners() {
    // Panier
    cartBtn.addEventListener('click', function() {
        cartModal.style.display = 'flex';
        displayCartItems();
    });
    
    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        if (e.target === productDetailModal) {
            productDetailModal.style.display = 'none';
        }
    });
    
    // Paiement
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification("Votre panier est vide");
            return;
        }
        
        cartModal.style.display = 'none';
        paymentModal.style.display = 'flex';
        document.getElementById('paymentTotal').textContent = 
            cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString();
    });
    
    closePayment.forEach(btn => {
        btn.addEventListener('click', function() {
            paymentModal.style.display = 'none';
        });
    });
    
    // Formulaire de paiement
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clientData = {
            name: document.getElementById('clientName').value,
            phone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value,
            paymentMethod: document.getElementById('paymentMethod').value
        };
        
        // Simuler le paiement
        const orderId = createOrder(clientData);
        
        // Afficher confirmation
        showNotification(`Commande #${orderId} confirmée! Merci pour votre achat.`, 'success');
        
        // Réinitialiser le formulaire
        paymentForm.reset();
        paymentModal.style.display = 'none';
    });
    
    // Localisation
    document.getElementById('locationBtn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const mapPreview = document.getElementById('mapPreview');
                mapPreview.innerHTML = `
                    <p><i class="fas fa-check-circle"></i> Localisation obtenue</p>
                    <p class="small">Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}</p>
                `;
                mapPreview.style.backgroundColor = '#d4edda';
                mapPreview.style.color = '#155724';
            }, function() {
                showNotification("Impossible d'obtenir votre localisation", 'error');
            });
        } else {
            showNotification("La géolocalisation n'est pas supportée par votre navigateur", 'error');
        }
    });
    
    // Chat
    chatToggle.addEventListener('click', function() {
        chatWidget.classList.toggle('active');
    });
    
    closeChat.addEventListener('click', function() {
        chatWidget.classList.remove('active');
    });
    
    // Filtres produits
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            displayProducts(filter);
        });
    });
    
    // Gestion du modal de détail produit
    const closeDetail = productDetailModal.querySelector('.close-detail');
    closeDetail.addEventListener('click', function() {
        productDetailModal.style.display = 'none';
    });
}

// Notification
function showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#d4edda' : 
                   type === 'error' ? '#f8d7da' : 
                   type === 'info' ? '#d1ecf1' : '#d4edda';
    
    const textColor = type === 'success' ? '#155724' : 
                     type === 'error' ? '#721c24' : 
                     type === 'info' ? '#0c5460' : '#155724';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${bgColor};
        color: ${textColor};
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Styles pour les animations de notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .small {
        font-size: 0.8rem;
        margin-top: 0.5rem;
    }
`;
document.head.appendChild(style);
