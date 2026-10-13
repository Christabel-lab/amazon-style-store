// Product Array (Inventory Database)
const products = [
  { id: 1, name: "Wireless Bluetooth Headphones", price: 350.00, category: "Electronics", rating: 4.5, stock: 15, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", tag: "Best Seller" },
  { id: 2, name: "Smart Fitness Watch", price: 580.00, category: "Electronics", rating: 4.7, stock: 8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", tag: "Deal" },
  { id: 3, name: "Running Sport Sneakers", price: 420.00, category: "Fashion", rating: 4.3, stock: 20, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", tag: "Popular" },
  { id: 4, name: "Minimalist Leather Backpack", price: 650.00, category: "Fashion", rating: 4.6, stock: 12, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", tag: "New" },
  { id: 5, name: "Ergonomic Office Desk Chair", price: 1200.00, category: "Home", rating: 4.8, stock: 5, image: "https://images.unsplash.com/photo-1580481077494-e3299ac25e94?w=500&q=80", tag: "Top Rated" },
  { id: 6, name: "Stainless Steel Coffee Tumbler", price: 180.00, category: "Home", rating: 4.4, stock: 30, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca13?w=500&q=80", tag: "Essential" },
  { id: 7, name: "Bestselling Fiction Novel", price: 95.00, category: "Books", rating: 4.9, stock: 25, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80", tag: "Bestseller" },
  { id: 8, name: "Coding & Web Dev Guide", price: 150.00, category: "Books", rating: 4.7, stock: 18, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80", tag: "Educational" }
];

// State Management synced with localStorage
let cart = JSON.parse(localStorage.getItem("shopzone_cart")) || [];
let orders = JSON.parse(localStorage.getItem("shopzone_orders")) || [];
let currentCategory = "All";
let searchQuery = "";

// DOM Elements
const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartButton = document.getElementById("cartButton");
const closeCartButton = document.getElementById("closeCartButton");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutButton = document.getElementById("checkoutButton");
const continueShopping = document.getElementById("continueShopping");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutButton = document.getElementById("closeCheckoutButton");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutTotal = document.getElementById("checkoutTotal");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchCategory = document.getElementById("searchCategory");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const resetFilters = document.getElementById("resetFilters");
const toast = document.getElementById("toast");
const ordersButton = document.getElementById("ordersButton");
const ordersSection = document.getElementById("ordersSection");
const closeOrdersButton = document.getElementById("closeOrdersButton");
const ordersList = document.getElementById("ordersList");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  renderProducts();
  updateCartUI();

  // Event Listeners
  cartButton.addEventListener("click", toggleCart);
  closeCartButton.addEventListener("click", toggleCart);
  overlay.addEventListener("click", toggleCart);
  continueShopping.addEventListener("click", toggleCart);

  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }
    toggleCart();
    openCheckout();
  });

  closeCheckoutButton.addEventListener("click", closeCheckout);
  
  // Fixed Search Submission & Real-time Typing Search
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    executeSearch();
  });

  searchInput.addEventListener("input", () => {
    executeSearch();
  });

  searchCategory.addEventListener("change", () => {
    executeSearch();
  });

  sortSelect.addEventListener("change", renderProducts);
  resetFilters.addEventListener("click", resetAllFilters);

  document.querySelectorAll(".nav-category, .chip").forEach(button => {
    button.addEventListener("click", (e) => {
      currentCategory = e.target.getAttribute("data-category");
      document.querySelectorAll(".nav-category, .chip").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(`[data-category="${currentCategory}"]`).forEach(btn => btn.classList.add("active"));
      renderProducts();
    });
  });

  document.getElementById("shopNowButton").addEventListener("click", () => {
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  });

  ordersButton.addEventListener("click", openOrders);
  closeOrdersButton.addEventListener("click", closeOrders);
  checkoutForm.addEventListener("submit", handleCheckoutSubmit);
});

function executeSearch() {
  searchQuery = searchInput.value.trim();
  currentCategory = searchCategory.value;
  
  // Sync category chips visuals if needed
  document.querySelectorAll(".nav-category, .chip").forEach(btn => {
    if (btn.getAttribute("data-category") === currentCategory) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderProducts();
}

// Filter, Search, and Sort using Array methods
function renderProducts() {
  let filtered = products.filter(product => {
    const matchesCategory = currentCategory === "All" || product.category === currentCategory || (currentCategory === "Deals" && product.tag === "Deal");
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortValue = sortSelect.value;
  if (sortValue === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (filtered.length === 0) {
    productGrid.innerHTML = "";
    emptyState.hidden = false;
    document.getElementById("resultsCount").textContent = "0 products found";
    return;
  }

  emptyState.hidden = true;
  document.getElementById("resultsCount").textContent = `${filtered.length} products available`;

  // Added a click event to product images so clicking them triggers a quick view/add action
  productGrid.innerHTML = filtered.map(product => `
    <div class="product-card">
      <div class="product-image-wrap" style="cursor: pointer;" onclick="handleImageClick(${product.id})" title="Click to view product details">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.tag ? `<span class="product-tag">\${product.tag}</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 style="cursor: pointer;" onclick="handleImageClick(${product.id})">${product.name}</h3>
        <div class="product-rating">⭐ ${product.rating}</div>
        <div class="product-price">GH₵${product.price.toFixed(2)}</div>
        <p class="product-stock">In Stock (${product.stock} left)</p>
        <button class="add-button" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

// Handle clicking on product image or title
function handleImageClick(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    showToast(`Viewing: ${product.name} - GH₵${product.price.toFixed(2)}`);
  }
}

// Cart Array Operations
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
    } else {
      showToast("Maximum available stock reached.");
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${product.name} to cart!`);
}

function updateQuantity(productId, change) {
  const cartItem = cart.find(item => item.id === productId);
  if (!cartItem) return;

  cartItem.quantity += change;
  if (cartItem.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  showToast("Item removed from cart.");
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="muted" style="text-align: center; margin-top: 40px;">Your cart is empty.</p>`;
    cartSubtotal.textContent = "GH₵0.00";
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <div class="cart-item-price">GH₵${item.price.toFixed(2)}</div>
        <div class="quantity-control">
          <button onclick="updateQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="remove-button" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartSubtotal.textContent = `GH₵${subtotal.toFixed(2)}`;
}

function saveCart() {
  localStorage.setItem("shopzone_cart", JSON.stringify(cart));
}

function toggleCart() {
  const isOpen = cartDrawer.classList.toggle("open");
  overlay.hidden = !isOpen;
}

function openCheckout() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  checkoutTotal.textContent = `GH₵${subtotal.toFixed(2)}`;
  checkoutModal.hidden = false;
}

function closeCheckout() {
  checkoutModal.hidden = true;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const formData = new FormData(checkoutForm);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newOrder = {
    id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString(),
    name: formData.get("fullName"),
    address: formData.get("address"),
    city: formData.get("city"),
    total: subtotal,
    items: [...cart]
  };

  orders.push(newOrder);
  localStorage.setItem("shopzone_orders", JSON.stringify(orders));

  cart = [];
  saveCart();
  updateCartUI();

  closeCheckout();
  checkoutForm.reset();
  showToast("Demo order placed successfully! Check Returns & Orders.");
}

function openOrders() {
  if (orders.length === 0) {
    ordersList.innerHTML = `<p class="muted" style="text-align: center; padding: 20px;">No demo orders placed yet.</p>`;
  } else {
    ordersList.innerHTML = orders.map(order => `
      <div class="order-record">
        <strong>Order ID: ${order.id}</strong>
        <p class="muted">Placed on: ${order.date} | Total: GH₵${order.total.toFixed(2)}</p>
        <p><strong>Deliver to:</strong> ${order.name}, ${order.address}, ${order.city}</p>
        <p class="muted">Items: ${order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}</p>
      </div>
    `).join("");
  }
  ordersSection.hidden = false;
}

function closeOrders() {
  ordersSection.hidden = true;
}

function resetAllFilters() {
  currentCategory = "All";
  searchQuery = "";
  searchInput.value = "";
  searchCategory.value = "All";
  sortSelect.value = "featured";
  document.querySelectorAll(".nav-category, .chip").forEach(btn => btn.classList.remove("active"));
  document.querySelector('[data-category="All"]').classList.add("active");
  renderProducts();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
