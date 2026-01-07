const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configuration de multer pour le téléchargement d'images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Données en mémoire (remplacer par une base de données en production)
let products = [];
let orders = [];

// Charger les données depuis le stockage local si disponibles
if (fs.existsSync('data/products.json')) {
    products = JSON.parse(fs.readFileSync('data/products.json'));
}

if (fs.existsSync('data/orders.json')) {
    orders = JSON.parse(fs.readFileSync('data/orders.json'));
}

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Routes pour les produits
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, description, quality } = req.body;
    
    const newProduct = {
        id: Date.now(),
        name,
        price: parseInt(price),
        description,
        quality: parseInt(quality),
        image: req.file ? `/uploads/${req.file.filename}` : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        category: 'nouveau'
    };
    
    products.push(newProduct);
    saveProducts();
    
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, description, quality } = req.body;
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    products[productIndex] = {
        ...products[productIndex],
        name,
        price: parseInt(price),
        description,
        quality: parseInt(quality)
    };
    
    saveProducts();
    res.json(products[productIndex]);
});

app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    products.splice(productIndex, 1);
    saveProducts();
    res.status(204).send();
});

// Routes pour les commandes
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const { client, items, total, paymentMethod } = req.body;
    
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        client,
        items,
        total: parseInt(total),
        paymentMethod,
        status: 'paid'
    };
    
    orders.push(newOrder);
    saveOrders();
    
    res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    orders[orderIndex].status = status;
    saveOrders();
    res.json(orders[orderIndex]);
});

// Simuler un paiement mobile
app.post('/api/payment', (req, res) => {
    const { amount, phone, provider } = req.body;
    
    // Simulation d'un paiement réussi
    setTimeout(() => {
        res.json({
            success: true,
            transactionId: 'TX' + Date.now(),
            message: 'Paiement effectué avec succès'
        });
    }, 2000);
});

// Fonctions de sauvegarde
function saveProducts() {
    fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));
}

function saveOrders() {
    fs.writeFileSync('data/orders.json', JSON.stringify(orders, null, 2));
}

// Route pour servir l'application frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});