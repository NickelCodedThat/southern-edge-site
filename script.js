const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const heroVideo = document.querySelector('[data-hero-video]');
const videoToggle = document.querySelector('[data-video-toggle]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 40);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const closeNavigation = () => {
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
  document.body.classList.remove('nav-open');
};

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav?.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('nav-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavigation();
});

const updateVideoToggle = (paused) => {
  if (!videoToggle) return;
  videoToggle.classList.toggle('is-paused', paused);
  videoToggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
  const label = videoToggle.querySelector('span');
  if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
};

if (heroVideo && reduceMotion.matches) {
  heroVideo.pause();
  updateVideoToggle(true);
}

videoToggle?.addEventListener('click', () => {
  if (!heroVideo) return;
  if (heroVideo.paused) {
    heroVideo.play().then(() => updateVideoToggle(false)).catch(() => updateVideoToggle(true));
  } else {
    heroVideo.pause();
    updateVideoToggle(true);
  }
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const lazyVideos = document.querySelectorAll('[data-lazy-video]');
const loadVideo = (video) => {
  video.querySelectorAll('source[data-src]').forEach((source) => {
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
  });
  video.load();
};

if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (!video.dataset.loaded) {
          loadVideo(video);
          video.dataset.loaded = 'true';
        }
        if (!reduceMotion.matches) video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '250px 0px', threshold: 0.15 });
  lazyVideos.forEach((video) => videoObserver.observe(video));
} else {
  lazyVideos.forEach(loadVideo);
}

const estimateForm = document.querySelector('[data-estimate-form]');
const formStatus = document.querySelector('[data-form-status]');

estimateForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!estimateForm.checkValidity()) {
    estimateForm.reportValidity();
    return;
  }

  /* Replace this empty value with Southern Edge's email to enable email submission. */
  const businessEmail = '';
  const data = new FormData(estimateForm);
  if (businessEmail) {
    const subject = encodeURIComponent(`Estimate request: ${data.get('service')}`);
    const body = encodeURIComponent(
      `Name: ${data.get('firstName')} ${data.get('lastName')}\n` +
      `Email: ${data.get('email')}\nPhone: ${data.get('phone')}\n` +
      `Service: ${data.get('service')}\n\nProject details:\n${data.get('message')}`
    );
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
    if (formStatus) formStatus.textContent = 'Your email app is opening with the request details.';
  } else if (formStatus) {
    formStatus.textContent = 'Form is ready—add the Southern Edge business email in script.js to enable delivery.';
  }
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
