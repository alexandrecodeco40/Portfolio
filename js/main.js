/* ==========================================================
   Portfolio BTS SIO SLAM - scripts communs
   Chaque bloc ci-dessous est indépendant : si tu ne veux pas
   d'un effet, tu peux supprimer son bloc entier sans rien casser.
   ========================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Menu mobile ---------- */
(function initMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
})();

/* ---------- 2. Effet "machine à écrire" ---------- */
(function initTyped() {
  const el = document.getElementById("typed");
  if (!el) return;

  const phrases = [
    "Étudiant BTS SIO option SLAM",
    "Développeur web",
    "Concepteur d'applications PHP / MySQL",
  ];

  if (prefersReducedMotion) {
    el.textContent = phrases[0];
    return;
  }

  let p = 0, i = 0, deleting = false;

  function tick() {
    const current = phrases[p];
    el.textContent = current.slice(0, i);

    let delay = deleting ? 35 : 70;

    if (!deleting && i === current.length) {
      deleting = true;
      delay = 1600;
    } else if (deleting && i === 0) {
      deleting = false;
      p = (p + 1) % phrases.length;
      delay = 400;
    } else {
      i += deleting ? -1 : 1;
    }
    setTimeout(tick, delay);
  }
  tick();
})();

/* ---------- 2bis. Terminal de boot (tape plusieurs lignes au chargement) ---------- */
(function initBootTerminal() {
  const el = document.getElementById("boot-output");
  if (!el) return;

  const lines = [
    "$ whoami",
    "alexandre.codeco-cerqueira",
    "$ cat formation.txt",
    "BTS SIO - option SLAM (2e année)",
    "$ ls competences/",
    "html css php c csharp sql",
    "$ ./lancer-portfolio.sh",
    "Chargement du profil... OK",
  ];

  if (prefersReducedMotion) {
    el.textContent = lines.join("\n");
    return;
  }

  let li = 0, ci = 0;
  let buffer = "";

  function typeNextChar() {
    if (li >= lines.length) return;
    const line = lines[li];

    if (ci < line.length) {
      buffer += line[ci];
      ci++;
      el.textContent = buffer;
      setTimeout(typeNextChar, 18 + Math.random() * 22);
    } else {
      buffer += "\n";
      li++;
      ci = 0;
      el.textContent = buffer;
      setTimeout(typeNextChar, 260);
    }
  }

  // On démarre l'effet uniquement quand le bloc devient visible à l'écran
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeNextChar();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
  } else {
    typeNextChar();
  }
})();

/* ---------- 3. Curseur personnalisé (souris uniquement) ---------- */
(function initCursor() {
  const canFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!canFinePointer || !dot || !ring) return;

  const root = document.documentElement;
  root.classList.add("has-cursor");

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    root.classList.add("cursor-active");
  });

  document.addEventListener("mouseleave", () => root.classList.remove("cursor-active"));

  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
})();

/* ---------- 4. Fond animé : réseau de particules ---------- */
(function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const LINK_DIST = 140;
  const MOUSE_DIST = 180;
  const mouse = { x: null, y: null };
  let w = 0, h = 0, particles = [], running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(90, Math.floor((w * h) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.4 + 0.8,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.x !== null) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 110 && d > 0) {
            p.x += (dx / d) * 0.8;
            p.y += (dy / d) * 0.8;
          }
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34, 211, 238, 0.7)";
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(96, 165, 250, ${(1 - d / LINK_DIST) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const a = particles[i];
        const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (d < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - d / MOUSE_DIST) * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    if (running) draw();
    if (!prefersReducedMotion) requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseout", () => { mouse.x = mouse.y = null; });
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  resize();
  loop();
})();

/* ---------- 5. Apparition des sections au scroll ---------- */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
})();

/* ---------- 6. Léger effet 3D sur la carte de code au survol ---------- */
(function initTilt() {
  const canFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const card = document.getElementById("code-card");
  if (!canFinePointer || !card || prefersReducedMotion) return;

  const MAX_TILT = 6; // degrés d'inclinaison maximum

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0 à 1
    const py = (e.clientY - rect.top) / rect.height;  // 0 à 1
    const rotY = (px - 0.5) * MAX_TILT * 2;
    const rotX = (0.5 - py) * MAX_TILT * 2;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  });
})();
