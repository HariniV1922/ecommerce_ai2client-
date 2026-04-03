import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, cartAPI, storage, userAPI } from "../services/api";
import { ROUTES } from "../App.js";
import "./LandingPage.css";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports"];

const BANNERS = [
  { title: "Summer Sale", subtitle: "Up to 70% off on premium fashion & accessories", cta: "Shop Now", color: "#c9a96e", bg: "from-amber" },
  { title: "Tech Week", subtitle: "Latest gadgets at unbeatable prices — Limited time only", cta: "Explore Deals", color: "#5e9cf5", bg: "from-blue" },
  { title: "Beauty Edit", subtitle: "Curated skincare from top global brands, delivered fast", cta: "Discover", color: "#e879a0", bg: "from-pink" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = storage.getUser();
  const userName = user?.name || "Guest";

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchWishlist();
  }, []);

  // Fetch products when category or search changes
  useEffect(() => {
    fetchProducts();
  }, [activeCategory, search]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (search) params.search = search;
      
      const data = await productAPI.getAll(params);
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartAPI.getCart();
      // Transform cart data to match frontend format
      const formattedCart = data.cart.map(item => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        emoji: item.productId.emoji,
        qty: item.quantity
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await userAPI.getWishlist();
      setWishlist(data.wishlist.map(item => item._id));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  // Banner auto-rotate
  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const addToCart = async (product) => {
    try {
      await cartAPI.addToCart(product._id, 1);
      await fetchCart();
      showToast(`🛍 ${product.name} added to cart`);
    } catch (error) {
      showToast('Failed to add to cart');
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await userAPI.removeFromWishlist(productId);
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await userAPI.addToWishlist(productId);
        setWishlist(prev => [...prev, productId]);
      }
    } catch (error) {
      showToast('Failed to update wishlist');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
    } catch (error) {
      showToast('Failed to remove from cart');
    }
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const cartCount = cart.reduce((sum, p) => sum + p.qty, 0);

  const filteredProducts = products;

  const banner = BANNERS[bannerIdx];

  const handleLogout = () => {
    storage.clear();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="lp-root">
      {/* TOAST */}
      {toast && <div className="lp-toast">{toast}</div>}

      {/* NAVBAR */}
      <nav className="lp-nav">
        <div className="nav-left">
          <span className="nav-brand">⬡ LUXEMART</span>
        </div>
        <div className="nav-center">
          <div className="nav-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="nav-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="nav-right">
          <span className="nav-greeting">Hi, {userName.split(" ")[0]}</span>
          <button className="nav-icon-btn" onClick={() => setCartOpen(true)}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* HERO BANNER */}
      <section className="hero-section">
        <div className={`hero-bg hero-${bannerIdx}`} />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">✦ Limited Time Offer</div>
            <h1 className="hero-title" key={bannerIdx}>{banner.title}</h1>
            <p className="hero-subtitle" key={`sub-${bannerIdx}`}>{banner.subtitle}</p>
            <button className="hero-cta" style={{ background: banner.color }}>{banner.cta} →</button>
          </div>
          <div className="hero-visual">
            <div className="hero-badge-float">🎁 Free Delivery over ₹999</div>
            <div className="hero-card-float">
              <span style={{ fontSize: 48 }}>🛍</span>
              <div>
                <div style={{ color: "#c9a96e", fontSize: 13, fontWeight: 600 }}>Today's Deal</div>
                <div style={{ color: "#f0ead6", fontSize: 15 }}>Up to 70% OFF</div>
              </div>
            </div>
          </div>
        </div>
        <div className="banner-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`dot ${i === bannerIdx ? "active" : ""}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        {[
          { icon: "🚚", label: "Free Shipping", sub: "On orders above ₹999" },
          { icon: "🔄", label: "Easy Returns", sub: "7-day hassle-free" },
          { icon: "🔒", label: "Secure Pay", sub: "100% safe checkout" },
          { icon: "⭐", label: "Top Rated", sub: "4.9 by 50k+ users" },
        ].map((t) => (
          <div className="trust-item" key={t.label}>
            <span className="trust-icon">{t.icon}</span>
            <div>
              <div className="trust-label">{t.label}</div>
              <div className="trust-sub">{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="category-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="section products-section">
        <div className="section-header">
          <h2 className="section-title">
            {activeCategory === "All" ? "Featured Products" : activeCategory}
            <span className="count-badge">{filteredProducts.length}</span>
          </h2>
        </div>

        {loading ? (
          <div className="loading-products" style={{textAlign: 'center', padding: '40px'}}>
            <span style={{fontSize: '32px'}}>⏳</span>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <span>😔</span>
            <p>No products found for "{search}"</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="product-img">
                  <span className="product-emoji">{product.emoji}</span>
                  <div className="product-tag">{product.tag}</div>
                  <button
                    className={`wish-btn ${wishlist.includes(product._id) ? "wished" : ""}`}
                    onClick={() => toggleWishlist(product._id)}
                  >
                    {wishlist.includes(product._id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    <span className="stars">{"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}</span>
                    <span className="rating-val">{product.rating}</span>
                    <span className="review-count">({product.reviews.toLocaleString()})</span>
                  </div>
                  <div className="product-pricing">
                    <span className="price">₹{product.price.toLocaleString()}</span>
                    <span className="original">₹{product.originalPrice?.toLocaleString()}</span>
                    <span className="discount">
                      {product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0}% off
                    </span>
                  </div>
                  <button className="add-cart-btn" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROMO BANNER */}
      <section className="promo-strip">
        <div className="promo-content">
          <h2 className="promo-title">Refer & Earn ₹500</h2>
          <p className="promo-sub">Invite friends to LuxeMart and earn store credits on every successful signup.</p>
          <button className="promo-btn">Share your link →</button>
        </div>
        <div className="promo-emoji">🎉</div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-brand">⬡ LUXEMART</div>
        <p className="footer-copy">© 2025 LuxeMart. Premium shopping, redefined.</p>
      </footer>

      {/* CART DRAWER */}
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>Your Cart ({cartCount})</h3>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span className="cart-item-emoji">{item.emoji}</span>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{(item.price * item.qty).toLocaleString()} × {item.qty}</div>
                  </div>
                  <button className="cart-remove" onClick={() => removeFromCart(item.id)}>🗑</button>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <button className="checkout-btn">Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}