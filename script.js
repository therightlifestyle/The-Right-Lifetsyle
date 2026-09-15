/**
 * TRL Service Engine V2 — The Right Lifestyle
 * Currency, Orders, Modal, Access Form, Mobile Menu, Scroll Effects
 */

'use strict';

// ====================== CONFIG ======================
const EXCHANGE_RATE = 280; // USD -> PKR (fallback; card data-pkr wins)

// ====================== STATE ======================
let currentCurrency = 'USD';
let currentOrder = null;

// ====================== HELPERS ======================
const $ = (id) => document.getElementById(id);

function getTierPKR(tierName) {
    const cards = document.querySelectorAll('.tier-card');
    for (const c of cards) {
        const h3 = c.querySelector('h3');
        if (h3 && h3.textContent.trim() === tierName && c.dataset.pkr) {
            return parseInt(c.dataset.pkr, 10);
        }
    }
    return null;
}

function formatPrice(usdAmount, tierName) {
    if (currentCurrency === 'PKR') {
        const pkr = (tierName && getTierPKR(tierName)) || Math.round(usdAmount * EXCHANGE_RATE);
        return '₨' + pkr.toLocaleString('en-US');
    }
    return '$' + Number(usdAmount).toLocaleString('en-US');
}

// ====================== CURRENCY TOGGLE ======================
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

    // Update modal prices if open (both the price line and the total)
    if (currentOrder) {
        const sumPrice = $('sumPrice');
        const sumTotal = $('sumTotal');
        if (sumPrice) sumPrice.textContent = formatPrice(currentOrder.price, currentOrder.tier);
        if (sumTotal) {
            sumTotal.textContent = formatPrice(currentOrder.price, currentOrder.tier);
            sumTotal.dataset.basePrice = currentOrder.price;
        }
    }
}

function setCurrency(currency) {
    if (currency !== 'USD' && currency !== 'PKR') return;
    currentCurrency = currency;

    const toggle = $('currencyToggle');
    if (toggle) {
        toggle.querySelectorAll('.currency-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.currency === currency));
    }

    try { localStorage.setItem('trl_currency', currency); } catch (e) {}
    updateAllPrices();
}

function initCurrencyToggle() {
    const toggle = $('currencyToggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.currency-btn');
        if (btn) setCurrency(btn.dataset.currency);
    });

    // Restore saved preference
    try {
        const saved = localStorage.getItem('trl_currency');
        if (saved && (saved === 'USD' || saved === 'PKR')) {
            currentCurrency = saved;
            toggle.querySelectorAll('.currency-btn').forEach(b =>
                b.classList.toggle('active', b.dataset.currency === saved));
        }
    } catch (e) {}

    // Initial render
    setTimeout(updateAllPrices, 50);
}

// ====================== FADE-IN REVEAL ======================
function initFadeIn() {
    const els = Array.from(document.querySelectorAll('.fade-in'));
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('visible'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
}

// ====================== MOBILE MENU ======================
const menuBtn = $('menuBtn');
const mobileMenu = $('mobileMenu');

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
function openOrderModal(tierName, usdPrice, eta) {
    const modal = $('orderModal');
    if (!modal) return;

    currentOrder = { tier: tierName, price: usdPrice, eta: eta };

    // Fill modal header
    $('modalTier').textContent = `Order ${tierName}`;

    // Fill summary
    $('sumTier').textContent = tierName;
    $('sumEta').textContent = eta;

    const displayPrice = formatPrice(usdPrice, tierName);
    $('sumPrice').textContent = displayPrice;
    $('sumTotal').textContent = displayPrice;
    $('sumTotal').dataset.basePrice = usdPrice;

    // Prefill form if possible
    const nameInput = $('custName');
    const phoneInput = $('custPhone');
    const dateInput = $('custDate');

    try {
        if (nameInput && !nameInput.value) nameInput.value = localStorage.getItem('trl_last_name') || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = localStorage.getItem('trl_last_phone') || '';
        // Default the start date to tomorrow, never a hardcoded/past date
        if (dateInput && !dateInput.value) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            dateInput.value = d.toISOString().split('T')[0];
        }
    } catch (e) {}

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first field
    setTimeout(() => {
        if (nameInput) nameInput.focus();
    }, 150);
}

function closeOrderModal() {
    const modal = $('orderModal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    currentOrder = null;
}

// Validate the order form; highlight the first bad field and toast the reason.
function validateOrderForm() {
    const name = $('custName');
    const phone = $('custPhone');
    const email = $('custEmail');
    const details = $('custDetails');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let ok = true;
    let firstBad = null;

    [[name, v => v.trim().length >= 2],
     [phone, v => v.replace(/[^\d]/g, '').length >= 10],
     [email, v => emailRe.test(v.trim())],
     [details, v => v.trim().length >= 4]].forEach(([el, test]) => {
        if (!el) return;
        const valid = test(el.value);
        el.classList.toggle('input-error', !valid);
        if (!valid && !firstBad) firstBad = el;
        if (!valid) ok = false;
    });

    if (!ok) {
        showToast('Please fill in your name, a valid WhatsApp number, and email.');
        if (firstBad) firstBad.focus();
    }
    return ok;
}

// Clear field error styling as the user types
['custName', 'custPhone', 'custEmail', 'custDetails'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', () => el.classList.remove('input-error'));
});

// ESC closes modal
document.addEventListener('keydown', function (e) {
    const modal = $('orderModal');
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeOrderModal();
    }
});

// Close modal on backdrop click
document.addEventListener('click', function (e) {
    const modal = $('orderModal');
    if (modal && modal.classList.contains('open') && e.target === modal) {
        closeOrderModal();
    }
});

function buildOrderSummaryText() {
    const name = $('custName') ? $('custName').value.trim() : '';
    const phone = $('custPhone') ? $('custPhone').value.trim() : '';
    const email = $('custEmail') ? $('custEmail').value.trim() : '';
    const details = $('custDetails') ? $('custDetails').value.trim() : '';
    const date = $('custDate') ? $('custDate').value : '';
    const price = formatPrice(currentOrder.price, currentOrder.tier);

    return `TRL SERVICE ORDER — ${currentOrder.tier}
━━━━━━━━━━━━━━━━━━━
Customer: ${name}
WhatsApp: ${phone}
Email: ${email}
Details: ${details}
ETA: ${currentOrder.eta}
Total: ${price} (${currentCurrency})
Preferred start: ${date}
━━━━━━━━━━━━━━━━━━━
50% deposit required to start.
TRL Standard: Human-reviewed • On-time guarantee`;
}

function copyOrderSummary() {
    if (!currentOrder || !validateOrderForm()) return;

    const summaryText = buildOrderSummaryText();
    const btns = Array.from(document.querySelectorAll('.btn-copy'));

    const flashCopied = () => {
        btns.forEach(b => {
            const old = b.textContent;
            b.textContent = '✅ Copied!';
            setTimeout(() => { b.textContent = old; }, 1600);
        });
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText)
            .then(flashCopied)
            .catch(() => { legacyCopy(summaryText); flashCopied(); });
    } else {
        legacyCopy(summaryText);
        flashCopied();
    }
}

function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
}

function sendToWhatsApp() {
    if (!currentOrder || !validateOrderForm()) return;

    const name = encodeURIComponent($('custName').value.trim());
    const phone = $('custPhone').value.trim();
    const details = encodeURIComponent($('custDetails').value.trim());
    const email = encodeURIComponent($('custEmail').value.trim());
    const date = $('custDate') ? $('custDate').value : '';

    const priceDisplay = formatPrice(currentOrder.price, currentOrder.tier);
    const deposit = currentCurrency === 'USD'
        ? '$' + Math.round(currentOrder.price * 0.5).toLocaleString('en-US')
        : '₨' + Math.round((getTierPKR(currentOrder.tier) || currentOrder.price * EXCHANGE_RATE) * 0.5).toLocaleString('en-US');

    const message =
`Hi TRL! I want to place an order for the *${currentOrder.tier}* package.

Customer: ${decodeURIComponent(name)}
WhatsApp: ${phone}
Email: ${decodeURIComponent(email)}

Project details: ${decodeURIComponent(details)}

ETA: ${currentOrder.eta}
Total: ${priceDisplay} (${currentCurrency})
50% Deposit: ${deposit}

Preferred start date: ${date}

Please send me the payment link / invoice.`;

    // Save for later (customer's own device only)
    try {
        localStorage.setItem('trl_last_name', $('custName').value.trim());
        localStorage.setItem('trl_last_phone', phone);
    } catch (e) {}

    const waLink = `https://wa.me/923190091457?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank', 'noopener');

    // Close modal after a delay
    setTimeout(() => {
        closeOrderModal();
        showToast('Order sent to WhatsApp. Admin will follow up shortly.');
    }, 1200);
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'trl-toast';
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;padding:12px 22px;border-radius:999px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.4);z-index:99999;max-width:90vw;text-align:center;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'all .3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

// ====================== ACCESS FORM (AJAX) ======================
function initAccessForm() {
    const form = $('accessForm');
    if (!form) return;

    const btn = form.querySelector('.submit-btn');
    const btnText = $('btnText');
    const btnLoader = $('btnLoader');
    const success = $('formSuccess');
    const errorEl = $('formError');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (btn && btn.disabled) return;

        if (btn) btn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) {
            btnLoader.style.display = 'inline';
            btnLoader.textContent = 'Sending...';
        }
        if (success) success.classList.remove('show');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || data.error || 'Your request could not be sent. Please try again or email us directly.');
            }

            form.reset();
            if (success) success.classList.add('show');
            showToast("Request received! We'll be in touch soon.");
        } catch (err) {
            if (errorEl) {
                errorEl.textContent = err.message || 'Something went wrong. Please try again or email us directly.';
                errorEl.classList.add('show');
            }
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.style.display = '';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    });
}

// ====================== SCROLL EFFECTS ======================
function initScrollEffects() {
    // Class-based so the mobile CSS (narrower padding) is never overridden
    const navbar = $('navbar');
    if (!navbar) return;

    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ====================== INIT ======================
function initTRLServiceEngine() {
    // Footer year
    const yearEl = $('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Currency
    initCurrencyToggle();

    // Reveal on scroll
    initFadeIn();

    // Scroll effects
    initScrollEffects();

    // Access form
    initAccessForm();

    // Keyboard accessibility hint
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement && document.activeElement.tagName === 'BODY') {
            const target = document.querySelector('#services');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
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
        switchCurrency: setCurrency
    };

    console.log('%c[TRL V2] Service Engine initialized. Currency toggle, modal, ESC ready.', 'color:#10b981');
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTRLServiceEngine);
} else {
    initTRLServiceEngine();
}
