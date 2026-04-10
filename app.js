
  // ── LOADING ─────────────────────────────────────────────
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('done');
    }, 600);
  });

  // ── MENU ────────────────────────────────────────────────
  const menuTrigger = document.getElementById('menuTrigger');
  const mainMenu = document.getElementById('main-menu');
  const body = document.body;

  menuTrigger.addEventListener('click', () => {
    const isOpen = mainMenu.classList.toggle('is-open');
    menuTrigger.setAttribute('aria-expanded', isOpen);
    menuTrigger.parentElement.classList.toggle('menu-open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  mainMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainMenu.classList.remove('is-open');
      menuTrigger.setAttribute('aria-expanded', 'false');
      menuTrigger.parentElement.classList.remove('menu-open');
      body.style.overflow = '';
    });
  });

  // ── REVEAL ON SCROLL ────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-onscreen');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  // ── EYE TRACKING ────────────────────────────────────────
  const leftPupil  = document.getElementById('leftPupil');
  const rightPupil = document.getElementById('rightPupil');
  const avatarSvg  = document.getElementById('avatarSvg');
  const avatarWrap = document.getElementById('avatarWrap');

  // Original eye centres in SVG coords
  const leftEyeCenter  = { x: 165, y: 268 };
  const rightEyeCenter = { x: 235, y: 268 };
  const MAX_OFFSET = 6; // max pixels the pupil can travel

  let targetLX = 165, targetLY = 268;
  let targetRX = 235, targetRY = 268;
  let currentLX = 165, currentLY = 268;
  let currentRX = 235, currentRY = 268;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentLX = lerp(currentLX, targetLX, 0.08);
    currentLY = lerp(currentLY, targetLY, 0.08);
    currentRX = lerp(currentRX, targetRX, 0.08);
    currentRY = lerp(currentRY, targetRY, 0.08);

    leftPupil.setAttribute('cx', currentLX);
    leftPupil.setAttribute('cy', currentLY);
    // move highlight too
    const leftHighlight = leftPupil.nextElementSibling;
    if (leftHighlight) {
      leftHighlight.setAttribute('cx', currentLX + 3);
      leftHighlight.setAttribute('cy', currentLY - 3);
    }

    rightPupil.setAttribute('cx', currentRX);
    rightPupil.setAttribute('cy', currentRY);
    const rightHighlight = rightPupil.nextElementSibling;
    if (rightHighlight) {
      rightHighlight.setAttribute('cx', currentRX + 3);
      rightHighlight.setAttribute('cy', currentRY - 3);
    }

    requestAnimationFrame(animate);
  }
  animate();

  function getSvgPoint(svgEl, clientX, clientY) {
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.viewBox.baseVal;
    return {
      x: ((clientX - rect.left) / rect.width)  * vb.width,
      y: ((clientY - rect.top)  / rect.height) * vb.height
    };
  }

  function movePupils(cursorSvgX, cursorSvgY) {
    [
      { center: leftEyeCenter,  setX: v => targetLX = v, setY: v => targetLY = v },
      { center: rightEyeCenter, setX: v => targetRX = v, setY: v => targetRY = v }
    ].forEach(({ center, setX, setY }) => {
      const dx = cursorSvgX - center.x;
      const dy = cursorSvgY - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamp = Math.min(dist, MAX_OFFSET);
      const angle = Math.atan2(dy, dx);
      setX(center.x + Math.cos(angle) * clamp);
      setY(center.y + Math.sin(angle) * clamp);
    });
  }

  document.addEventListener('mousemove', (e) => {
    const svgPoint = getSvgPoint(avatarSvg, e.clientX, e.clientY);
    movePupils(svgPoint.x, svgPoint.y);

    // Subtle head lean
    const rect = avatarWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = (e.clientX - cx) / window.innerWidth;
    const ry = (e.clientY - cy) / window.innerHeight;
    avatarWrap.style.transform = `translate(${rx * 8}px, ${ry * 5}px)`;
  });

  // Touch support
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const svgPoint = getSvgPoint(avatarSvg, touch.clientX, touch.clientY);
    movePupils(svgPoint.x, svgPoint.y);
  }, { passive: true });

  // ── SCROLL HINT FADE ────────────────────────────────────
  const scrollHint = document.querySelector('.scroll-hint');
  window.addEventListener('scroll', () => {
    if (scrollHint) {
      scrollHint.style.opacity = Math.max(0, 0.4 - window.scrollY / 200);
    }
  }, { passive: true });
