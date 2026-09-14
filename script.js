/**
 * TRL Service Engine V2 — The Right Lifestyle
 * Full Service Machine: Currency, Orders, Modal, Admin, Mobile
 */

'use strict';

// ====================== CONFIG ======================
const EXCHANGE_RATE = 280; // USD to PKR (configurable)

// ====================== CURRENCY TOGGLE ======================
let currentCurrency = 'USD';

function updateAllPrices() {
    // Update tier prices
    document.querySelectorAll('.tier-card').forEach(card => {
        const usdEl = card.querySelector('.price-usd');
        const pkrEl = card.querySelector('.price-pkr');
        
        if (!usdEl || !pkrEl) return;
        
        if (currentCurrency === 'PKR') {
            usdEl.style.display = 'none';
            pkrEl.style.display = 'inline';
        } else {
            usdEl.style.display = 'inline';
            pkrEl.style.display = 'none';
        }
    });

    // Update modal price if open
    const modalTotal = document.getElementById('sumTotal');
    if (modalTotal && modalTotal.dataset.basePrice) {
        const base = parseFloat(modalTotal.dataset.basePrice);
        const displayPrice = currentCurrency === 'USD' 
            ? '$' + base 
            : '₨' + Math.round(base * EXCHANGE_RATE);
        modalTotal.textContent = displayPrice;
    }
}

function initCurrencyToggle() {
    const toggle = document.getElementById('currencyToggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.currency-btn');
        if (!btn) return;

        // Update active state
        toggle.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentCurrency = btn.dataset.currency;
        
        // Persist preference
        try { localStorage.setItem('trl_currency', currentCurrency); } catch(e){}
        
        updateAllPrices();
    });

    // Restore saved preference
    try {
        const saved = localStorage.getItem('trl_currency');
        if (saved && (saved === 'USD' || saved === 'PKR')) {
            currentCurrency = saved;
            const activeBtn = toggle.querySelector(`[data-currency="${saved}"]`);
            if (activeBtn) {
                toggle.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
                activeBtn.classList.add('active');
            }
        }
    } catch(e){}

    // Initial render
    setTimeout(updateAllPrices, 50);
}

// ====================== MOBILE MENU (enhanced) ======================
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    
    const spans = menuBtn.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        toggleMenu(!isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !menuBtn.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // ESC key for mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            toggleMenu(false);
            menuBtn.focus();
        }
    });
}

// ====================== ORDER MODAL ======================
let currentOrder = null;

function openOrderModal(tierName, usdPrice, eta) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;

    currentOrder = { tier: tierName, price: usdPrice, eta: eta };

    // Fill modal header
    document.getElementById('modalTier').textContent = `Order ${tierName}`;

    // Fill summary
    const sumTier = document.getElementById('sumTier');
    const sumPrice = document.getElementById('sumPrice');
    const sumEta = document.getElementById('sumEta');
    const sumTotal = document.getElementById('sumTotal');

    sumTier.textContent = tierName;
    sumEta.textContent = eta;

    const displayPrice = currentCurrency === 'USD' 
        ? '$' + usdPrice 
        : '₨' + Math.round(usdPrice * EXCHANGE_RATE);
    
    sumPrice.textContent = displayPrice;
    sumTotal.textContent = displayPrice;
    sumTotal.dataset.basePrice = usdPrice;

    // Prefill form if possible
    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const dateInput = document.getElementById('custDate');

    try {
        if (nameInput && !nameInput.value) nameInput.value = localStorage.getItem('trl_last_name') || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = localStorage.getItem('trl_last_phone') || '';
        // Default the start date to tomorrow, never a hardcoded/past date
        if (dateInput && !dateInput.value) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            dateInput.value = d.toISOString().split('T')[0];
        }
    } catch(e){}

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // Focus first field
    setTimeout(() => {
        if (nameInput) nameInput.focus();
    }, 150);
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
    currentOrder = null;
}

// ESC closes modal
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('orderModal');
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeOrderModal();
    }
});

// Close modal on backdrop click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('orderModal');
    if (modal && modal.classList.contains('open') && e.target === modal) {
        closeOrderModal();
    }
});

function copyOrderSummary() {
    if (!currentOrder) return;

    const name = document.getElementById('custName')?.value || 'Customer';
    const phone = document.getElementById('custPhone')?.value || '';
    const details = document.getElementById('custDetails')?.value || '—';
    const date = document.getElementById('custDate')?.value || '';

    const price = currentCurrency === 'USD' 
        ? '$' + currentOrder.price 
        : '₨' + Math.round(currentOrder.price * EXCHANGE_RATE);

    const summaryText = 
`TRL SERVICE ORDER — ${currentOrder.tier}
━━━━━━━━━━━━━━━━━━━
Customer: ${name}
WhatsApp: ${phone}
Email: ${document.getElementById('custEmail')?.value || ''}
Details: ${details}
ETA: ${currentOrder.eta}
Total: ${price} (${currentCurrency})
Preferred start: ${date}
━━━━━━━━━━━━━━━━━━━
50% deposit required to start.
TRL Standard: Human-reviewed • On-time guarantee`;

    navigator.clipboard.writeText(summaryText).then(() => {
        const origText = event.target ? event.target.textContent : '';
        const btns = document.querySelectorAll('.btn-copy');
        btns.forEach(b => {
            const old = b.textContent;
            b.textContent = '✅ Copied!';
            setTimeout(() => { b.textContent = old; }, 1600);
        });
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = summaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Summary copied to clipboard!');
    });
}

function sendToWhatsApp() {
    if (!currentOrder) return;

    const name = encodeURIComponent(document.getElementById('custName')?.value || 'Customer');
    const phone = document.getElementById('custPhone')?.value || '';
    const details = encodeURIComponent(document.getElementById('custDetails')?.value || '');
    const email = encodeURIComponent(document.getElementById('custEmail')?.value || '');
    const date = document.getElementById('custDate')?.value || '';

    const priceDisplay = currentCurrency === 'USD' 
        ? '$' + currentOrder.price 
        : '₨' + Math.round(currentOrder.price * EXCHANGE_RATE);

    const deposit = currentCurrency === 'USD' 
        ? '$' + Math.round(currentOrder.price * 0.5) 
        : '₨' + Math.round(currentOrder.price * EXCHANGE_RATE * 0.5);

    const message = 
`Hi TRL! I want to place an order for the *${currentOrder.tier}* package.

Customer: ${name}
WhatsApp: ${phone}
Email: ${email}

Project details: ${details}

ETA: ${currentOrder.eta}
Total: ${priceDisplay} (${currentCurrency})
50% Deposit: ${deposit}

Preferred start date: ${date}

Please send me the payment link / invoice.`;

    // Save for later (customer's own device only)
    try {
        localStorage.setItem('trl_last_name', document.getElementById('custName').value);
        localStorage.setItem('trl_last_phone', document.getElementById('custPhone').value);
    } catch(e){}

    const waLink = `https://wa.me/923190091457?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');

    // Close modal after a delay
    setTimeout(() => {
        closeOrderModal();
        // Show toast
        showToast('Order sent to WhatsApp. Admin will follow up shortly.');
    }, 1200);
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:12px 22px;border-radius:999px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.4);z-index:99999;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'all .3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

// ====================== OTHER ENHANCEMENTS ======================
function initScrollEffects() {
    // Navbar scroll already exists in original, keep simple
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                navbar.style.padding = '12px 48px';
                navbar.style.background = 'rgba(5, 5, 5, 0.95)';
            } else {
                navbar.style.padding = '16px 48px';
                navbar.style.background = 'rgba(5, 5, 5, 0.8)';
            }
        }, { passive: true });
    }
}

function initFormEnhancements() {
    // Keep original form handling + add little polish
    const accessForm = document.getElementById('accessForm');
    if (accessForm) {
        // already has handler from original — we can enhance slightly
        const originalHandler = accessForm.onsubmit;
        
        // Add subtle success already in original; keep as-is
    }

    // Debounced search hint (if future search added)
    console.log('%c[TRL] Service Engine V2 ready', 'color:#64748b');
}

// ====================== INIT ======================
function initTRLServiceEngine() {
    // Currency
    initCurrencyToggle();

    // Scroll effects
    initScrollEffects();

    // Forms
    initFormEnhancements();

    // Keyboard accessibility hint
    document.addEventListener('keydown', function(e) {
        if (e.key === '/' && document.activeElement.tagName === 'BODY') {
            const search = document.querySelector('#services');
            if (search) {
                e.preventDefault();
                search.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Make tier cards clickable for convenience
    document.querySelectorAll('.tier-card').forEach(card => {
        const btn = card.querySelector('.tier-btn');
        if (btn) {
            card.addEventListener('click', (ev) => {
                if (ev.target === btn || btn.contains(ev.target)) return;
                btn.click();
            });
        }
    });

    // Final price sync
    setTimeout(updateAllPrices, 80);

    // Expose for debugging / future plugin
    window.TRL = {
        openOrder: openOrderModal,
        switchCurrency: (c) => {
            currentCurrency = c;
            updateAllPrices();
        }
    };

    console.log('%c[TRL V2] Service Engine initialized. Currency toggle, modal, ESC ready.', 'color:#10b981');
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTRLServiceEngine);
} else {
    initTRLServiceEngine();
}