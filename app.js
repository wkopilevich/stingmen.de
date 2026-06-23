const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a')];

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function parseEntries(markdown) {
  return markdown
    .split(/\r?\n---\r?\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/);
      const data = {};
      let i = 0;
      for (; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line.includes(':')) {
          break;
        }
        const [key, ...rest] = line.split(':');
        data[key.trim().toLowerCase()] = rest.join(':').trim();
      }
      data.body = lines.slice(i).join('\n').trim();
      return data;
    });
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return isoDate;
  }
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function renderNews(entries) {
  const container = document.getElementById('news-list');
  if (!container) {
    return;
  }

  if (entries.length === 0) {
    container.innerHTML = '<p class="empty">Noch keine News vorhanden.</p>';
    return;
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  container.innerHTML = entries
    .map((entry) => {
      const title = escapeHtml(entry.title || 'Ohne Titel');
      const date = escapeHtml(formatDate(entry.date || '')); 
      const body = entry.body || '';

      // Check if this is an expandable story
      if (entry.expandable === 'true') {
        // Render as card with inline expandable content (like others)
        const teaser = escapeHtml(entry.teaser || body.substring(0, 150));
        const bodyHtml = body
          .split(/\n\n+/)
          .map(para => `<p>${escapeHtml(para.trim())}</p>`)
          .join('');
        
        return `
          <article class="card">
            <h3>${title}</h3>
            <p class="meta">${date}</p>
            <p>${teaser}</p>
            <details class="card-details">
              <summary class="btn btn-secondary">Mehr</summary>
              <div class="card-details-content">
                ${bodyHtml}
              </div>
            </details>
          </article>
        `;
      }

      // Regular card with optional link button
      const link = entry.link
        ? `<a class="btn btn-secondary" href="${escapeHtml(entry.link)}" target="_blank" rel="noopener noreferrer">Mehr</a>`
        : '';

      return `
        <article class="card">
          <h3>${title}</h3>
          <p class="meta">${date}</p>
          <p>${escapeHtml(body)}</p>
          ${link}
        </article>
      `;
    })
    .join('');
}

function renderTour(entries) {
  const upcomingEl = document.getElementById('tour-upcoming');
  const pastEl = document.getElementById('tour-past');
  if (!upcomingEl || !pastEl) {
    return;
  }

  const upcoming = entries
    .filter((entry) => (entry.status || '').toLowerCase() === 'upcoming')
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const past = entries
    .filter((entry) => (entry.status || '').toLowerCase() === 'past')
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const card = (entry) => {
    const title = escapeHtml(entry.title || 'Auftritt');
    const location = escapeHtml(entry.location || 'Ort folgt');
    const date = escapeHtml(formatDate(entry.date || '')); 
    const body = escapeHtml(entry.body || '');
    return `
      <article class="tour-item">
        <h4>${location}, ${title}</h4>
        <p class="meta">am ${date}</p>
        <p>${body}</p>
      </article>
    `;
  };

  upcomingEl.innerHTML = upcoming.length ? upcoming.map(card).join('') : '<p class="empty">Keine kommenden Termine.</p>';
  pastEl.innerHTML = past.length ? past.map(card).join('') : '<p class="empty">Noch keine vergangenen Termine.</p>';
}

const galleryState = {
  photos: [],
  startIndex: 0,
  activeIndex: 0,
  visibleCount: 3,
  isLightboxOpen: false,
  lastFocus: null
};

function getVisibleCount() {
  return 3;
}

function normalizePhotoEntry(entry) {
  const src = typeof entry?.src === 'string' ? entry.src.trim() : '';
  if (!src) {
    return null;
  }

  return {
    src,
    alt: typeof entry?.alt === 'string' && entry.alt.trim() ? entry.alt.trim() : 'Stingmen Foto'
  };
}

function renderGallery() {
  const track = document.getElementById('photo-track');
  const range = document.getElementById('photo-range');
  const prev = document.getElementById('photo-prev');
  const next = document.getElementById('photo-next');
  if (!track || !range || !prev || !next) {
    return;
  }

  const total = galleryState.photos.length;
  if (total === 0) {
    track.innerHTML = '';
    range.textContent = 'Keine Fotos gefunden.';
    prev.disabled = true;
    next.disabled = true;
    return;
  }

  const maxStart = Math.max(0, total - galleryState.visibleCount);
  galleryState.startIndex = Math.max(0, Math.min(galleryState.startIndex, maxStart));
  track.style.setProperty('--visible-count', String(galleryState.visibleCount));

  const end = Math.min(total, galleryState.startIndex + galleryState.visibleCount);
  const visible = galleryState.photos.slice(galleryState.startIndex, end);

  track.innerHTML = visible
    .map((photo, offset) => {
      const index = galleryState.startIndex + offset;
      const activeClass = index === galleryState.activeIndex ? ' is-active' : '';
      return `
        <button class="photo-thumb${activeClass}" type="button" data-photo-index="${index}" aria-label="Foto ${index + 1} von ${total}">
          <img src="${encodeURI(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async" />
        </button>
      `;
    })
    .join('');

  range.textContent = `${galleryState.startIndex + 1}-${end} von ${total}`;
  prev.disabled = galleryState.startIndex <= 0;
  next.disabled = end >= total;
}

function updateLightboxImage() {
  const image = document.getElementById('lightbox-image');
  const counter = document.getElementById('lightbox-counter');
  if (!image || !counter || galleryState.photos.length === 0) {
    return;
  }

  const photo = galleryState.photos[galleryState.activeIndex];
  image.src = encodeURI(photo.src);
  image.alt = photo.alt;
  counter.textContent = `${galleryState.activeIndex + 1} / ${galleryState.photos.length}`;
}

function openLightbox(index, triggerElement) {
  const lightbox = document.getElementById('photo-lightbox');
  if (!lightbox || galleryState.photos.length === 0) {
    return;
  }

  galleryState.activeIndex = index;
  galleryState.isLightboxOpen = true;
  galleryState.lastFocus = triggerElement || document.activeElement;

  updateLightboxImage();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');

  const closeButton = document.getElementById('lightbox-close');
  closeButton?.focus();
}

function closeLightbox() {
  const lightbox = document.getElementById('photo-lightbox');
  if (!lightbox) {
    return;
  }

  galleryState.isLightboxOpen = false;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  galleryState.lastFocus?.focus?.();
}

function gotoNextLightboxImage() {
  if (galleryState.photos.length === 0) {
    return;
  }

  galleryState.activeIndex = (galleryState.activeIndex + 1) % galleryState.photos.length;
  updateLightboxImage();
  renderGallery();
}

function gotoPrevLightboxImage() {
  if (galleryState.photos.length === 0) {
    return;
  }

  galleryState.activeIndex = (galleryState.activeIndex - 1 + galleryState.photos.length) % galleryState.photos.length;
  updateLightboxImage();
  renderGallery();
}

function onPhotoTrackClick(event) {
  const button = event.target.closest('.photo-thumb');
  if (!button) {
    return;
  }

  const index = Number.parseInt(button.dataset.photoIndex || '', 10);
  if (Number.isNaN(index)) {
    return;
  }

  galleryState.activeIndex = index;
  openLightbox(index, button);
  renderGallery();
}

function moveGallery(step) {
  const total = galleryState.photos.length;
  const maxStart = Math.max(0, total - galleryState.visibleCount);
  galleryState.startIndex = Math.max(0, Math.min(galleryState.startIndex + step, maxStart));
  renderGallery();
}

function setupSwipeGesture(element, onSwipeLeft, onSwipeRight) {
  if (!element) {
    return;
  }

  let startX = 0;
  let startY = 0;

  element.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) {
        return;
      }
      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: true }
  );

  element.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const minDistance = 40;

      // Trigger only on clear horizontal swipes and keep vertical scrolling natural.
      if (absX < minDistance || absX <= absY) {
        return;
      }

      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    },
    { passive: true }
  );
}

function handleLightboxKeydown(event) {
  if (!galleryState.isLightboxOpen) {
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    gotoNextLightboxImage();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    gotoPrevLightboxImage();
  }
}

async function setupPhotoGallery() {
  const track = document.getElementById('photo-track');
  const prev = document.getElementById('photo-prev');
  const next = document.getElementById('photo-next');
  const range = document.getElementById('photo-range');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImage = document.getElementById('lightbox-image');
  if (!track || !prev || !next || !range || !lightboxBackdrop || !lightboxClose || !lightboxPrev || !lightboxNext || !lightboxImage) {
    return;
  }

  try {
    const response = await fetch('content/photos.json');
    if (!response.ok) {
      throw new Error(`photos.json could not be loaded (${response.status})`);
    }

    const payload = await response.json();
    const photos = Array.isArray(payload) ? payload : payload.photos;
    galleryState.photos = (Array.isArray(photos) ? photos : []).map(normalizePhotoEntry).filter(Boolean);
    galleryState.visibleCount = getVisibleCount();
    galleryState.startIndex = 0;
    galleryState.activeIndex = 0;
    renderGallery();
  } catch (error) {
    range.textContent = 'Fotos konnten nicht geladen werden.';
    console.error(error);
  }

  track.addEventListener('click', onPhotoTrackClick);
  prev.addEventListener('click', () => moveGallery(-galleryState.visibleCount));
  next.addEventListener('click', () => moveGallery(galleryState.visibleCount));
  setupSwipeGesture(
    track,
    () => moveGallery(galleryState.visibleCount),
    () => moveGallery(-galleryState.visibleCount)
  );

  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', gotoPrevLightboxImage);
  lightboxNext.addEventListener('click', gotoNextLightboxImage);
  setupSwipeGesture(lightboxImage, gotoNextLightboxImage, gotoPrevLightboxImage);

  lightboxImage.addEventListener('error', () => {
    lightboxImage.alt = 'Bild konnte nicht geladen werden';
  });

  document.addEventListener('keydown', handleLightboxKeydown);
  window.addEventListener('resize', () => {
    const nextVisibleCount = getVisibleCount();
    if (nextVisibleCount !== galleryState.visibleCount) {
      galleryState.visibleCount = nextVisibleCount;
      renderGallery();
    }
  });
}

async function loadContent() {
  try {
    const [newsRes, tourRes] = await Promise.all([
      fetch('content/news.md'),
      fetch('content/tour.md')
    ]);

    const newsText = await newsRes.text();
    const tourText = await tourRes.text();

    renderNews(parseEntries(newsText));
    renderTour(parseEntries(tourText));
  } catch (error) {
    const newsContainer = document.getElementById('news-list');
    const upcomingEl = document.getElementById('tour-upcoming');
    const pastEl = document.getElementById('tour-past');
    const fallback = '<p class="empty">Inhalte konnten nicht geladen werden.</p>';
    if (newsContainer) {
      newsContainer.innerHTML = fallback;
    }
    if (upcomingEl) {
      upcomingEl.innerHTML = fallback;
    }
    if (pastEl) {
      pastEl.innerHTML = fallback;
    }
    console.error(error);
  }
}

function setupRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${index * 45}ms`;
    observer.observe(el);
  });
}

function setupActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  const linkMap = new Map(
    navLinks.map((link) => [link.getAttribute('href')?.replace('#', ''), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => link.classList.remove('active'));
        const id = entry.target.getAttribute('id');
        linkMap.get(id)?.classList.add('active');
      });
    },
    {
      rootMargin: '-40% 0px -45% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
}

loadContent();
setupRevealObserver();
setupActiveNav();
setupPhotoGallery();
