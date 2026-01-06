const destinations = [
  {
    id: 'jay_fai',
    nameEn: 'Jay Fai · Crab Omelette',
    nameTh: 'เจ๊ไฝ',
    description: '抵達先抽號碼牌，等待可步行去附近咖啡。招牌蟹肉蛋包必點。',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
    category: '米其林',
    tone: 'green',
    area: 'BTS Chong Nonsi',
    lat: 13.7245,
    lng: 100.5146
  },
  {
    id: 'volcano_pork',
    nameEn: 'Volcano Pork · Ratchada',
    nameTh: 'ซี่โครงหมูภูเขาไฟ',
    description: '點餐時指定小辣，避免超辣。現金與行動支付皆可。',
    image:
      'https://images.unsplash.com/photo-1604908177225-055f99402ea3?auto=format&fit=crop&w=800&q=80',
    category: '在地',
    tone: 'orange',
    area: 'Ratchada Night Market',
    lat: 13.7766,
    lng: 100.5739
  },
  {
    id: 'iconsiam',
    nameEn: 'ICONSIAM Riverside',
    nameTh: 'ไอคอนสยาม',
    description: '河岸百貨＋水上市場造景，適合購物與吹冷氣。',
    image:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    category: '購物',
    tone: 'blue',
    area: 'BTS Krung Thonburi',
    lat: 13.7264,
    lng: 100.5107
  },
  {
    id: 'wat_arun',
    nameEn: 'Wat Arun · Temple of Dawn',
    nameTh: 'วัดอรุณราชวราราม',
    description: '建議黃昏前抵達，河岸夕陽最美。船班約 20-30 泰銖。',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    category: '文化',
    tone: 'purple',
    area: 'Chao Phraya Pier',
    lat: 13.7436,
    lng: 100.4889
  }
];

const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const visitedKey = (id) => `visited_${id}`;
const loadVisited = (id) => localStorage.getItem(visitedKey(id)) === 'true';
const saveVisited = (id, state) => localStorage.setItem(visitedKey(id), state.toString());

function renderDestinations() {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;

  const badgeClassMap = {
    green: 'badge-green',
    orange: 'badge-orange',
    blue: 'badge-blue',
    purple: 'badge-purple'
  };

  grid.innerHTML = destinations
    .map((dest) => {
      const badgeTone = dest.tone ? ` ${badgeClassMap[dest.tone] || ''}` : '';
      const visited = loadVisited(dest.id);
      return `
        <article class="card destination-card" data-id="${dest.id}">
          <div class="card-head destination-head">
            <span class="badge${badgeTone}">${dest.category}</span>
            <span class="chip">${dest.area}</span>
            <label class="visited-toggle">
              <input type="checkbox" data-visited="${dest.id}" ${visited ? 'checked' : ''} />
              <span>Visited</span>
            </label>
          </div>
          <div class="destination-media">
            <img src="${dest.image}" alt="${dest.nameEn}" loading="lazy" />
          </div>
          <h3>${dest.nameEn}</h3>
          <p>${dest.description}</p>
          <div class="actions gap">
            <button class="ghost" data-ride data-lat="${dest.lat}" data-lng="${dest.lng}">Ride with Grab</button>
            <button class="primary" data-open-driver data-title="${dest.nameEn}" data-thai="${dest.nameTh}" data-lat="${dest.lat}" data-lng="${dest.lng}">司機卡</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function switchView(target, views, tabs) {
  const activeView = tabs.find((btn) => btn.classList.contains('tab--active'))?.dataset.nav || 'home';
  if (target === activeView) return;

  const current = views.find((v) => v.dataset.view === activeView);
  const next = views.find((v) => v.dataset.view === target);
  if (!next || !current) return;

  current.classList.remove('view--active');
  current.classList.add(preferReduced ? 'view--hidden' : 'view--slide-out');
  next.classList.add(preferReduced ? 'view--active' : 'view--slide-in');

  tabs.forEach((btn) => btn.classList.toggle('tab--active', btn.dataset.nav === target));

  setTimeout(() => {
    views.forEach((v) => {
      v.classList.remove('view--slide-out', 'view--slide-in', 'view--hidden');
      v.classList.toggle('view--active', v.dataset.view === target);
    });
  }, preferReduced ? 0 : 350);
}

function setupRouter() {
  const views = Array.from(document.querySelectorAll('.view'));
  const tabs = Array.from(document.querySelectorAll('.tab[data-nav]'));

  document.addEventListener('click', (event) => {
    const navBtn = event.target.closest('[data-nav]');
    if (navBtn) {
      switchView(navBtn.dataset.nav, views, tabs);
    }
  });
}

function openGrab(lat, lng) {
  const grabUrl = `grab://open?destination.latitude=${lat}&destination.longitude=${lng}`;
  const webFallback = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const timeout = setTimeout(() => window.open(webFallback, '_blank'), 800);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = grabUrl;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    clearTimeout(timeout);
  }, 900);
}

function openAppleOrGoogle(lat, lng) {
  if (isIOS) {
    window.location.href = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
}

function setupDriverModal() {
  const modal = document.getElementById('driver-modal');
  const driverTitle = document.getElementById('driver-title');
  const driverThai = document.getElementById('driver-thai');
  const btnRide = document.getElementById('btn-ride');
  const btnNavigate = document.getElementById('btn-navigate');
  let selected = { lat: null, lng: null, title: '', thai: '' };

  function openModal({ title, thai, lat, lng }) {
    selected = { lat, lng, title, thai };
    driverTitle.textContent = title;
    driverThai.textContent = thai;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('modal--open');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('modal--open');
  }

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.classList.contains('modal')) {
      closeModal();
    }
  });

  document.addEventListener('click', (event) => {
    const driverBtn = event.target.closest('[data-open-driver]');
    const rideBtn = event.target.closest('[data-ride]');

    if (driverBtn) {
      const title = driverBtn.dataset.title || 'Bangkok';
      const thai = driverBtn.dataset.thai || 'กรุงเทพฯ';
      const lat = parseFloat(driverBtn.dataset.lat);
      const lng = parseFloat(driverBtn.dataset.lng);
      openModal({ title, thai, lat, lng });
    }

    if (rideBtn) {
      const lat = parseFloat(rideBtn.dataset.lat);
      const lng = parseFloat(rideBtn.dataset.lng);
      openGrab(lat, lng);
    }
  });

  btnRide.addEventListener('click', () => {
    if (selected.lat && selected.lng) {
      openGrab(selected.lat, selected.lng);
    }
  });

  btnNavigate.addEventListener('click', () => {
    if (selected.lat && selected.lng) {
      openAppleOrGoogle(selected.lat, selected.lng);
    }
  });
}

function setupVisitedState() {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;
  grid.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[data-visited]');
    if (!checkbox) return;
    const id = checkbox.dataset.visited;
    saveVisited(id, checkbox.checked);
  });
}

function setupConverter() {
  const toggle = document.getElementById('converter-toggle');
  const panel = document.getElementById('converter-panel');
  const closeBtn = document.getElementById('converter-close');
  const thbInput = document.getElementById('thb-input');
  const rateInput = document.getElementById('rate-input');
  const output = document.getElementById('twd-output');

  if (!toggle || !panel) return;

  const update = () => {
    const rate = parseFloat(rateInput.value) || 0.9;
    const thb = parseFloat(thbInput.value) || 0;
    const twd = Math.round(thb * rate * 100) / 100;
    output.textContent = twd.toLocaleString('en-US');
  };

  const openPanel = () => {
    panel.hidden = false;
    panel.classList.add('converter-panel--open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closePanel = () => {
    panel.classList.remove('converter-panel--open');
    toggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      panel.hidden = true;
    }, 180);
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closePanel();
    } else {
      openPanel();
      thbInput.focus();
    }
  });

  closeBtn?.addEventListener('click', closePanel);

  [thbInput, rateInput].forEach((input) => {
    input?.addEventListener('input', update);
  });

  update();
}

function setupAddToHomeCTA() {
  const addButton = document.getElementById('cta-add');
  addButton?.addEventListener('click', () => {
    alert('在 Safari 點擊分享 → 加入主畫面，體驗全螢幕。');
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js');
    });
  }
}

renderDestinations();
setupRouter();
setupDriverModal();
setupVisitedState();
setupConverter();
setupAddToHomeCTA();
registerServiceWorker();
