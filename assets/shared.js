/* ─────────────────────────────────────────────────────────────
   NPM site — shared interactions
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // Sticky header shadow on scroll
  const header = document.querySelector('.header-wrap');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Close mobile nav on link click
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    document.querySelectorAll('.mobile-nav a').forEach((a) => {
      a.addEventListener('click', () => { menuToggle.checked = false; });
    });
  }

  // Fade-in on intersection
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    : null;
  if (io) {
    document.querySelectorAll('.fade-in').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
  }

  // Synergy diagram — draw dashed triangle edges between the three nodes
  function drawSynergyEdges(diagram) {
    const svg = diagram.querySelector('svg.edges');
    if (!svg) return;
    const rect = diagram.getBoundingClientRect();
    if (rect.width === 0) return;

    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Node centers (match CSS positions)
    const nodes = diagram.querySelectorAll('.node');
    if (nodes.length < 3) return;

    const centers = [];
    nodes.forEach((n) => {
      const nrect = n.getBoundingClientRect();
      centers.push({
        x: (nrect.left - rect.left) + nrect.width / 2,
        y: (nrect.top - rect.top) + nrect.height / 2,
        r: Math.max(nrect.width, nrect.height) / 2
      });
    });

    const ns = 'http://www.w3.org/2000/svg';
    const pairs = [[0, 1], [1, 2], [2, 0]];

    pairs.forEach(([i, j]) => {
      const a = centers[i], b = centers[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d === 0) return;
      const insetA = a.r * 0.55, insetB = b.r * 0.55;
      const x1 = a.x + dx * (insetA / d);
      const y1 = a.y + dy * (insetA / d);
      const x2 = b.x - dx * (insetB / d);
      const y2 = b.y - dy * (insetB / d);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '1.25');
      line.setAttribute('stroke-dasharray', '4 6');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    });
  }

  function redrawAll() {
    document.querySelectorAll('.synergy-diagram').forEach(drawSynergyEdges);
  }

  // Initial draw after fonts/layout settle
  if (document.readyState === 'complete') {
    redrawAll();
  } else {
    window.addEventListener('load', redrawAll);
  }
  // Fallback: also redraw slightly later to catch font-load reflows
  setTimeout(redrawAll, 150);
  setTimeout(redrawAll, 600);

  // Resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(redrawAll, 120);
  });

})();
