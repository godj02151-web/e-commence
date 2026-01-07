// Données
let adminProducts = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Smartphone XYZ",
        price: 150000,
        description: "Smartphone haut de gamme avec écran 6.5 pouces et triple caméra",
        quality: 4,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        category: "nouveau"
    },
    {
        id: 2,
        name: "Casque Audio Bluetooth",
        price: 35000,
        description: "Casque sans fil avec réduction de bruit active",
        quality: 5,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        category: "promo"
    }
];

let orders = JSON.parse(localStorage.getItem('orders')) || [];

// DOM Elements
const productForm = document.getElementById('productForm');
const starRating = document.querySelectorAll('.star-rating i');
const productQuality = document.getElementById('productQuality');
const imagePreview = document.getElementById('imagePreview');
const productImage = document.getElementById('productImage');
const adminProductsContainer = document.getElementById('adminProducts');
const navLinks = document.querySelectorAll('.nav-link');
const adminSections = document.querySelectorAll('.admin-section');
const ordersTableBody = document.getElementById('ordersTableBody');
const orderDetailsModal = document.getElementById('orderDetailsModal');
const orderDetailsContent = document.getElementById('orderDetailsContent');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    displayAdminProducts();
    displayOrders();
    setupEventListeners();
});

// Gestion des produits
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        quality: parseInt(productQuality.value),
        image: imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        category: 'nouveau'
    };
    
    adminProducts.push(newProduct);
    saveProducts();
    displayAdminProducts();
    productForm.reset();
    imagePreview.innerHTML = '<i class="fas fa-image"></i><p>Aperçu de l\'image</p>';
    resetStars();
    
    showAdminNotification('Produit ajouté avec succès!');
});

// Gestion des étoiles
starRating.forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        productQuality.value = rating;
        
        starRating.forEach(s => {
            if (parseInt(s.getAttribute('data-rating')) <= rating) {
                s.classList.remove('far');
                s.classList.add('fas', 'active');
            } else {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            }
        });
    });
});

function resetStars() {
    starRating.forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
    productQuality.value = 3;
    
    // Activer 3 étoiles par défaut
    starRating.forEach(star => {
        if (parseInt(star.getAttribute('data-rating')) <= 3) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        }
    });
}

// Prévisualisation d'image
productImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        
        reader.readAsDataURL(file);
    }
});

// Afficher les produits dans l'admin
function displayAdminProducts() {
    adminProductsContainer.innerHTML = '';
    
    if (adminProducts.length === 0) {
        adminProductsContainer.innerHTML = '<p class="no-products">Aucun produit ajouté</p>';
        return;
    }
    
    adminProducts.forEach(product => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= product.quality) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="admin-product-info">
                <h4 class="admin-product-name">${product.name}</h4>
                <p class="admin-product-price">${product.price.toLocaleString()} FCFA</p>
                <p class="admin-product-description">${product.description.substring(0, 60)}...</p>
                <div class="star-rating small">
                    ${stars}
                </div>
                <div class="admin-product-actions">
                    <button class="btn-sm btn-warning edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn-sm btn-danger delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        
        adminProductsContainer.appendChild(productCard);
    });
    
    // Ajouter les événements pour les boutons
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            if (confirm('Voulez-vous vraiment supprimer ce produit?')) {
                adminProducts = adminProducts.filter(p => p.id !== productId);
                saveProducts();
                displayAdminProducts();
                showAdminNotification('Produit supprimé avec succès!');
            }
        });
    });
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(adminProducts));
}

// Navigation admin
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        
        // Mettre à jour la navigation active
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Afficher la section correspondante
        adminSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
        
        // Rafraîchir les commandes si on accède à cette section
        if (targetId === 'orders') {
            displayOrders();
        }
    });
});

// Commandes
function displayOrders() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    ordersTableBody.innerHTML = '';
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr class="no-orders">
                <td colspan="8">Aucune commande pour le moment</td>
            </tr>
        `;
        return;
    }
    
    // Trier les commandes par date (les plus récentes en premier)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const date = new Date(order.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const statusClass = `status-${order.status}`;
        const statusText = order.status === 'paid' ? 'Payée' : 
                          order.status === 'pending' ? 'En attente' : 'Livrée';
        
        // Compter les produits
        const productCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id.toString().substring(8)}</td>
            <td>${formattedDate}</td>
            <td>${order.client.name}</td>
            <td>${order.client.phone}</td>
            <td>${productCount} produit(s)</td>
            <td>${order.total.toLocaleString()} FCFA</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-sm view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
        `;
        
        ordersTableBody.appendChild(row);
    });
    
    // Ajouter les événements pour les boutons "Voir"
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            showOrderDetails(orderId);
        });
    });
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const date = new Date(order.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `
            <div class="order-item">
                <p><strong>${item.name}</strong> - ${item.quantity} × ${item.price.toLocaleString()} FCFA</p>
            </div>
        `;
    });
    
    orderDetailsContent.innerHTML = `
        <div class="order-details">
            <h4>Commande #${order.id.toString().substring(8)}</h4>
            <p><strong>Date:</strong> ${formattedDate}</p>
            
            <div class="order-section">
                <h5>Informations client</h5>
                <p><strong>Nom:</strong> ${order.client.name}</p>
                <p><strong>Téléphone:</strong> ${order.client.phone}</p>
                <p><strong>Adresse:</strong> ${order.client.address}</p>
                <p><strong>Méthode de paiement:</strong> ${order.client.paymentMethod}</p>
            </div>
            
            <div class="order-section">
                <h5>Produits commandés</h5>
                ${itemsHtml}
            </div>
            
            <div class="order-section">
                <h5>Total: ${order.total.toLocaleString()} FCFA</h5>
            </div>
        </div>
    `;
    
    orderDetailsModal.style.display = 'flex';
}

// Gestion des événements
function setupEventListeners() {
    // Fermer le modal des détails de commande
    const closeModal = orderDetailsModal.querySelector('.close');
    closeModal.addEventListener('click', function() {
        orderDetailsModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === orderDetailsModal) {
            orderDetailsModal.style.display = 'none';
        }
    });
    
    // Recherche de commandes
    const orderSearch = document.getElementById('orderSearch');
    orderSearch.addEventListener('input', function() {
        filterOrders();
    });
    
    // Filtre par statut
    const orderStatus = document.getElementById('orderStatus');
    orderStatus.addEventListener('change', function() {
        filterOrders();
    });
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('orderStatus').value;
    
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.client.name.toLowerCase().includes(searchTerm) || 
                            order.id.toString().includes(searchTerm) ||
                            order.client.phone.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    // Mettre à jour l'affichage
    displayFilteredOrders(filteredOrders);
}

function displayFilteredOrders(filteredOrders) {
    ordersTableBody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr class="no-orders">
                <td colspan="8">Aucune commande correspondante</td>
            </tr>
        `;
        return;
    }
    
    filteredOrders.forEach(order => {
        const date = new Date(order.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const statusClass = `status-${order.status}`;
        const statusText = order.status === 'paid' ? 'Payée' : 
                          order.status === 'pending' ? 'En attente' : 'Livrée';
        
        const productCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id.toString().substring(8)}</td>
            <td>${formattedDate}</td>
            <td>${order.client.name}</td>
            <td>${order.client.phone}</td>
            <td>${productCount} produit(s)</td>
            <td>${order.total.toLocaleString()} FCFA</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-sm view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
        `;
        
        ordersTableBody.appendChild(row);
    });
    
    // Réattacher les événements pour les boutons "Voir"
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            showOrderDetails(orderId);
        });
    });
}

// Notification admin
function showAdminNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: #4CAF50;
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}