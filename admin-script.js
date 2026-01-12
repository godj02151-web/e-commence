// Données
let adminProducts = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Smartphone XYZ",
        price: 150000,
        description: "Smartphone haut de gamme avec écran 6.5 pouces et triple caméra",
        quality: 4,
        images: [
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
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
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        ],
        video: "",
        category: "promo"
    }
];

// Charger les commandes depuis le localStorage
function loadOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

// DOM Elements
const productForm = document.getElementById('productForm');
const starRating = document.querySelectorAll('.star-rating i');
const productQuality = document.getElementById('productQuality');
const imagesPreview = document.getElementById('imagesPreview');
const productImages = document.getElementById('productImages');
const productVideo = document.getElementById('productVideo');
const videoPreview = document.getElementById('videoPreview');
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
    resetStars();
    
    // Initialiser les paramètres
    initSettings();
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
        images: [],
        video: '',
        category: document.getElementById('productCategory').value
    };
    
    // Récupérer les images
    const imagePreviews = imagesPreview.querySelectorAll('img');
    imagePreviews.forEach(img => {
        newProduct.images.push(img.src);
    });
    
    // Récupérer la vidéo
    const videoElement = videoPreview.querySelector('video');
    if (videoElement) {
        newProduct.video = videoElement.src;
    }
    
    adminProducts.push(newProduct);
    saveProducts();
    displayAdminProducts();
    productForm.reset();
    imagesPreview.innerHTML = '<p class="no-images">Aucune image sélectionnée</p>';
    videoPreview.innerHTML = '<p class="no-video">Aucune vidéo sélectionnée</p>';
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
    
    starRating.forEach(star => {
        if (parseInt(star.getAttribute('data-rating')) <= 3) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        }
    });
}

// Gestion des images multiples
productImages.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Vider le preview si c'est le premier upload
    if (imagesPreview.innerHTML.includes('Aucune image')) {
        imagesPreview.innerHTML = '';
    }
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'preview-image-container';
                imageContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image">×</button>
                `;
                imagesPreview.appendChild(imageContainer);
                
                // Ajouter l'événement pour supprimer l'image
                imageContainer.querySelector('.remove-image').addEventListener('click', function() {
                    imageContainer.remove();
                    if (imagesPreview.children.length === 0) {
                        imagesPreview.innerHTML = '<p class="no-images">Aucune image sélectionnée</p>';
                    }
                });
            }
            
            reader.readAsDataURL(file);
        }
    });
});

// Gestion de la vidéo
productVideo.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            videoPreview.innerHTML = `
                <video controls>
                    <source src="${e.target.result}" type="${file.type}">
                    Votre navigateur ne supporte pas les vidéos.
                </video>
                <button type="button" class="remove-video">× Supprimer la vidéo</button>
            `;
            
            // Ajouter l'événement pour supprimer la vidéo
            videoPreview.querySelector('.remove-video').addEventListener('click', function() {
                videoPreview.innerHTML = '<p class="no-video">Aucune vidéo sélectionnée</p>';
                productVideo.value = '';
            });
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
        
        const mainImage = product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        const imageCount = product.images.length;
        const hasVideo = product.video ? '<i class="fas fa-video" title="Contient une vidéo"></i>' : '';
        
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${mainImage}" alt="${product.name}">
                ${imageCount > 1 ? `<span class="image-count">+${imageCount - 1}</span>` : ''}
                ${hasVideo}
                <span class="product-category-badge ${product.category}">${product.category === 'promo' ? 'PROMO' : 'NOUVEAU'}</span>
            </div>
            <div class="admin-product-info">
                <h4 class="admin-product-name">${product.name}</h4>
                <p class="admin-product-price">${product.price.toLocaleString()} FCFA</p>
                <p class="admin-product-description">${product.description.substring(0, 60)}...</p>
                <div class="star-rating small">
                    ${stars}
                </div>
                <div class="product-media-info">
                    <span><i class="fas fa-images"></i> ${product.images.length} images</span>
                    ${product.video ? '<span><i class="fas fa-video"></i> Vidéo</span>' : ''}
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
        
        // Rafraîchir les paramètres si on accède à cette section
        if (targetId === 'settings') {
            loadSettings();
        }
    });
});

// COMMANDES - Section fonctionnelle
function displayOrders() {
    const orders = loadOrders();
    ordersTableBody.innerHTML = '';
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr class="no-orders">
                <td colspan="9">Aucune commande pour le moment</td>
            </tr>
        `;
        return;
    }
    
    // Trier les commandes par date (les plus récentes en premier)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const date = new Date(order.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        const statusClass = `status-${order.status}`;
        const statusText = getStatusText(order.status);
        
        // Compter les produits
        const productCount = order.items ? order.items.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
        const totalAmount = order.total || (order.items ? order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) : 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id ? order.id.toString().substring(order.id.toString().length - 6) : 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${order.client ? order.client.name : 'N/A'}</td>
            <td>${order.client ? order.client.phone : 'N/A'}</td>
            <td>${productCount} produit(s)</td>
            <td>${totalAmount.toLocaleString()} FCFA</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-sm view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
            <td>
                <button class="btn-sm btn-print" data-id="${order.id}" title="Imprimer cette commande">
                    <i class="fas fa-print"></i>
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
    
    // Ajouter les événements pour les boutons "Imprimer"
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            printOrder(orderId);
        });
    });
}

function getStatusText(status) {
    switch(status) {
        case 'paid': return 'Payée';
        case 'pending': return 'En attente';
        case 'delivered': return 'Livrée';
        case 'cancelled': return 'Annulée';
        default: return 'Inconnu';
    }
}

function showOrderDetails(orderId) {
    const orders = loadOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        orderDetailsContent.innerHTML = '<p class="error">Commande non trouvée</p>';
        orderDetailsModal.style.display = 'flex';
        return;
    }
    
    const date = new Date(order.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item">
                    <p><strong>${item.name}</strong> - ${item.quantity || 1} × ${item.price ? item.price.toLocaleString() : '0'} FCFA</p>
                    <p class="item-total">Sous-total: ${((item.price || 0) * (item.quantity || 1)).toLocaleString()} FCFA</p>
                </div>
            `;
        });
    } else {
        itemsHtml = '<p>Aucun produit dans cette commande</p>';
    }
    
    orderDetailsContent.innerHTML = `
        <div class="order-details">
            <h4>Commande #${order.id ? order.id.toString().substring(order.id.toString().length - 6) : 'N/A'}</h4>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Statut:</strong> <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></p>
            
            <div class="order-section">
                <h5>Informations client</h5>
                <p><strong>Nom:</strong> ${order.client ? order.client.name : 'N/A'}</p>
                <p><strong>Téléphone:</strong> ${order.client ? order.client.phone : 'N/A'}</p>
                <p><strong>Adresse:</strong> ${order.client ? order.client.address : 'N/A'}</p>
                <p><strong>Méthode de paiement:</strong> ${order.client ? order.client.paymentMethod : 'N/A'}</p>
            </div>
            
            <div class="order-section">
                <h5>Produits commandés</h5>
                ${itemsHtml}
            </div>
            
            <div class="order-section">
                <h5>Total: ${order.total ? order.total.toLocaleString() : '0'} FCFA</h5>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-primary update-status" data-id="${order.id}" data-status="paid">
                    Marquer comme payée
                </button>
                <button class="btn btn-success update-status" data-id="${order.id}" data-status="delivered">
                    Marquer comme livrée
                </button>
                <button class="btn btn-danger update-status" data-id="${order.id}" data-status="cancelled">
                    Annuler la commande
                </button>
                <button class="btn btn-info print-order-detail" data-id="${order.id}">
                    <i class="fas fa-print"></i> Imprimer
                </button>
            </div>
        </div>
    `;
    
    orderDetailsModal.style.display = 'flex';
    
    // Ajouter les événements pour les boutons de mise à jour de statut
    document.querySelectorAll('.update-status').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            const newStatus = this.getAttribute('data-status');
            updateOrderStatus(orderId, newStatus);
        });
    });
    
    // Ajouter l'événement pour le bouton d'impression dans le détail
    const printDetailBtn = document.querySelector('.print-order-detail');
    if (printDetailBtn) {
        printDetailBtn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            printOrder(orderId);
        });
    }
}

function updateOrderStatus(orderId, newStatus) {
    let orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        
        showAdminNotification(`Statut de la commande mis à jour: ${getStatusText(newStatus)}`);
        displayOrders();
        showOrderDetails(orderId);
    }
}

// FONCTION D'IMPRESSION
function printOrder(orderId) {
    const orders = loadOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showAdminNotification('Commande non trouvée pour l\'impression', 'error');
        return;
    }
    
    // Créer une nouvelle fenêtre/onglet pour l'impression
    const printWindow = window.open('', '_blank');
    
    const date = new Date(order.date);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            itemsHtml += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 1}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price ? item.price.toLocaleString() : '0'} FCFA</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${itemTotal.toLocaleString()} FCFA</td>
                </tr>
            `;
        });
    }
    
    const totalAmount = order.total || (order.items ? order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) : 0);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Facture Commande #${order.id ? order.id.toString().substring(order.id.toString().length - 6) : ''}</title>
            <style>
                @media print {
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    
                    .invoice-title {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0;
                    }
                    
                    .invoice-subtitle {
                        font-size: 18px;
                        margin: 5px 0 20px 0;
                    }
                    
                    .company-info {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                    }
                    
                    .section-title {
                        background-color: #f5f5f5;
                        padding: 10px;
                        font-weight: bold;
                        margin: 20px 0 10px 0;
                        border-left: 4px solid #3498db;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .info-item {
                        margin-bottom: 8px;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #555;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    
                    th {
                        background-color: #f8f9fa;
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                        font-weight: bold;
                    }
                    
                    .total-section {
                        margin-top: 30px;
                        text-align: right;
                    }
                    
                    .total-amount {
                        font-size: 20px;
                        font-weight: bold;
                        color: #e74c3c;
                    }
                    
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        color: #777;
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    
                    .print-date {
                        text-align: right;
                        font-size: 12px;
                        color: #777;
                        margin-bottom: 20px;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    
                    .status-paid { background-color: #d4edda; color: #155724; }
                    .status-pending { background-color: #fff3cd; color: #856404; }
                    .status-delivered { background-color: #d1ecf1; color: #0c5460; }
                    .status-cancelled { background-color: #f8d7da; color: #721c24; }
                    
                    .no-print {
                        display: none;
                    }
                }
                
                @media screen {
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    .print-controls {
                        text-align: center;
                        margin: 20px 0;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 5px;
                    }
                    
                    .print-btn {
                        background-color: #3498db;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    
                    .print-btn:hover {
                        background-color: #2980b9;
                    }
                    
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    
                    .invoice-title {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0;
                    }
                    
                    .invoice-subtitle {
                        font-size: 18px;
                        margin: 5px 0 20px 0;
                    }
                    
                    .company-info {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                    }
                    
                    .section-title {
                        background-color: #f5f5f5;
                        padding: 10px;
                        font-weight: bold;
                        margin: 20px 0 10px 0;
                        border-left: 4px solid #3498db;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .info-item {
                        margin-bottom: 8px;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #555;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    
                    th, td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }
                    
                    th {
                        background-color: #f8f9fa;
                        font-weight: bold;
                    }
                    
                    .total-section {
                        margin-top: 30px;
                        text-align: right;
                    }
                    
                    .total-amount {
                        font-size: 20px;
                        font-weight: bold;
                        color: #e74c3c;
                    }
                    
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        color: #777;
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    
                    .print-date {
                        text-align: right;
                        font-size: 12px;
                        color: #777;
                        margin-bottom: 20px;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    
                    .status-paid { background-color: #d4edda; color: #155724; }
                    .status-pending { background-color: #fff3cd; color: #856404; }
                    .status-delivered { background-color: #d1ecf1; color: #0c5460; }
                    .status-cancelled { background-color: #f8d7da; color: #721c24; }
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="print-controls no-print">
                <button class="print-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimer cette facture
                </button>
                <button class="print-btn" onclick="window.close()" style="background-color: #95a5a6; margin-left: 10px;">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
            
            <div class="print-date">
                Document généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </div>
            
            <div class="invoice-header">
                <h1 class="invoice-title">FACTURE</h1>
                <h2 class="invoice-subtitle">Commande #${order.id ? order.id.toString().substring(order.id.toString().length - 6) : ''}</h2>
            </div>
            
            <div class="company-info">
                <h3>MaBoutique</h3>
                <p>Adresse: 123 Rue du Commerce, Ville</p>
                <p>Téléphone: +225 01 23 45 67 89 | Email: contact@maboutique.com</p>
            </div>
            
            <div class="info-grid">
                <div>
                    <h3 class="section-title">INFORMATIONS CLIENT</h3>
                    <div class="info-item">
                        <span class="info-label">Nom:</span> ${order.client ? order.client.name : 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Téléphone:</span> ${order.client ? order.client.phone : 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Adresse:</span> ${order.client ? order.client.address : 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Méthode de paiement:</span> ${order.client ? order.client.paymentMethod : 'N/A'}
                    </div>
                </div>
                
                <div>
                    <h3 class="section-title">INFORMATIONS COMMANDE</h3>
                    <div class="info-item">
                        <span class="info-label">Numéro:</span> #${order.id ? order.id.toString().substring(order.id.toString().length - 6) : 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span> ${formattedDate}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Statut:</span>
                        <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Nombre d'articles:</span> ${order.items ? order.items.length : 0}
                    </div>
                </div>
            </div>
            
            <h3 class="section-title">DÉTAIL DES ARTICLES</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total-section">
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 16px;">Sous-total: </span>
                    <span style="font-size: 18px;">${totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 16px;">Frais de livraison: </span>
                    <span style="font-size: 18px;">0 FCFA</span>
                </div>
                <div>
                    <span style="font-size: 18px; font-weight: bold;">TOTAL: </span>
                    <span class="total-amount">${totalAmount.toLocaleString()} FCFA</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Merci pour votre confiance !</p>
                <p>MaBoutique - Tous droits réservés &copy; ${new Date().getFullYear()}</p>
                <p>Pour toute question, contactez-nous au +225 01 23 45 67 89</p>
            </div>
            
            <script>
                // Auto-impression optionnelle
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
                
                // Fermer la fenêtre après impression
                window.onafterprint = function() {
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    showAdminNotification('Facture générée pour l\'impression');
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
    if (orderSearch) {
        orderSearch.addEventListener('input', function() {
            filterOrders();
        });
    }
    
    // Filtre par statut
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', function() {
            filterOrders();
        });
    }
    
    // Gestion des paramètres
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    const notificationEmail = document.getElementById('notificationEmail');
    
    if (emailNotifications) {
        emailNotifications.addEventListener('change', function() {
            if (notificationEmail) {
                notificationEmail.disabled = !this.checked;
            }
        });
    }
}

function filterOrders() {
    const orders = loadOrders();
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('orderStatus').value;
    
    const filteredOrders = orders.filter(order => {
        const clientName = order.client ? order.client.name.toLowerCase() : '';
        const clientPhone = order.client ? order.client.phone : '';
        const orderId = order.id ? order.id.toString() : '';
        
        const matchesSearch = clientName.includes(searchTerm) || 
                            orderId.includes(searchTerm) ||
                            clientPhone.includes(searchTerm);
        
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
                <td colspan="9">Aucune commande correspondante</td>
            </tr>
        `;
        return;
    }
    
    filteredOrders.forEach(order => {
        const date = new Date(order.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        const statusClass = `status-${order.status}`;
        const statusText = getStatusText(order.status);
        
        const productCount = order.items ? order.items.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
        const totalAmount = order.total || (order.items ? order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) : 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id ? order.id.toString().substring(order.id.toString().length - 6) : 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${order.client ? order.client.name : 'N/A'}</td>
            <td>${order.client ? order.client.phone : 'N/A'}</td>
            <td>${productCount} produit(s)</td>
            <td>${totalAmount.toLocaleString()} FCFA</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-sm view-order" data-id="${order.id}">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
            <td>
                <button class="btn-sm btn-print" data-id="${order.id}" title="Imprimer cette commande">
                    <i class="fas fa-print"></i>
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
    
    // Réattacher les événements pour les boutons "Imprimer"
    document.querySelectorAll('.btn-print').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-id'));
            printOrder(orderId);
        });
    });
}

// PARAMETRES - Section fonctionnelle
function initSettings() {
    loadSettings();
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {
        apiKey: '',
        paymentMode: 'test',
        emailNotifications: true,
        smsNotifications: false,
        notificationEmail: ''
    };
    
    const apiKey = document.getElementById('apiKey');
    const paymentMode = document.getElementById('paymentMode');
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    const notificationEmail = document.getElementById('notificationEmail');
    
    if (apiKey) apiKey.value = settings.apiKey || '';
    if (paymentMode) paymentMode.value = settings.paymentMode || 'test';
    if (emailNotifications) emailNotifications.checked = settings.emailNotifications || false;
    if (smsNotifications) smsNotifications.checked = settings.smsNotifications || false;
    if (notificationEmail) {
        notificationEmail.value = settings.notificationEmail || '';
        notificationEmail.disabled = !(settings.emailNotifications || false);
    }
}

function saveSettings() {
    const settings = {
        apiKey: document.getElementById('apiKey').value,
        paymentMode: document.getElementById('paymentMode').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        notificationEmail: document.getElementById('notificationEmail').value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showAdminNotification('Paramètres sauvegardés avec succès!');
}

// Notification admin
function showAdminNotification(message, type = 'success') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#4CAF50' : 
                   type === 'error' ? '#f44336' : 
                   type === 'info' ? '#2196F3' : '#4CAF50';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${bgColor};
        color: white;
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
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);
