let currentUrl = '';
const DEVICE_KEY = 'gpt_checkout_device_id';

function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
        id = `dev_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`;
        localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
}

function showError(msg) {
    const box = document.getElementById('error-box');
    const txt = document.getElementById('error-text');
    txt.textContent = msg;
    box.classList.add('show');
    document.getElementById('result-box').classList.remove('show');
}

function hideError() {
    const box = document.getElementById('error-box');
    if (box) box.classList.remove('show');
}

async function handleGenerate() {
    const session = document.getElementById('session').value.trim();
    if (!session) {
        showError('Harap tempel session JSON terlebih dahulu.');
        return;
    }
    doGenerate(session);
}

async function doGenerate(session) {
    hideError();
    const btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session, country: 'ID', device_id: getDeviceId() }),
        });

        let data;
        try {
            data = await res.json();
        } catch {
            showError('Response tidak valid dari server.');
            return;
        }

        if (!data.success || !data.url) {
            showError(data.error || 'Gagal membuat link checkout.');
            return;
        }

        currentUrl = data.url;
        document.getElementById('link-display').textContent = currentUrl;

        const promoTag = document.getElementById('promo-tag');
        if (promoTag) {
            promoTag.textContent = data.promoEligible ? '🎉 Promo IDR 0 berhasil!' : '⚠️ Promo tidak eligible — harga normal IDR 349.000';
            promoTag.className = 'promo-tag ' + (data.promoEligible ? 'promo-ok' : 'promo-no');
        }

        document.getElementById('result-box').classList.add('show');

    } catch (err) {
        showError(`Koneksi error: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Buat Link Checkout';
    }
}

function copyLink() {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).catch(() => {});
    const btn = document.getElementById('btn-copy');
    btn.textContent = 'Tersalin!';
    btn.style.background = '#bbf7d0';
    setTimeout(() => {
        btn.style.background = '#dcfce7';
        btn.textContent = 'Salin Link';
    }, 2000);
}

function openLink() {
    if (!currentUrl) return;
    window.open(currentUrl, '_blank');
}

window.handleGenerate = handleGenerate;
window.copyLink = copyLink;
window.openLink = openLink;
