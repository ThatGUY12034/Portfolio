/* =========================================================================
   Portfolio — script.js
   Content is loaded from JSON data files (single source of truth):
     • data/projects.json       — projects
     • data/certifications.json — certifications
     • data/skills.json         — skills
   To add content, edit the relevant JSON file — you do NOT need to touch
   this file.
   ========================================================================= */

function $(id) {
  return document.getElementById(id);
}

function isValidUrl(url) {
  return typeof url === "string" && url.trim().startsWith("http");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ---------------------------------------------------------------- Projects */

async function loadProjects() {
  const grid = $("projectsGrid");
  if (!grid) return;

  try {
    const res = await fetch("./data/projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    renderProjects(projects);
  } catch (err) {
    console.error("Could not load projects.json:", err);
    grid.innerHTML = `
      <div class="card project">
        <h3>Projects unavailable</h3>
        <p>Couldn't load the project list. If you're viewing this locally, serve the
        site over HTTP (e.g. a local server) instead of opening the file directly.</p>
      </div>`;
    const count = $("projectCount");
    if (count) count.textContent = "—";
  }
}

/* Two-letter monogram from a title: prefer its capital letters/digits
   (e.g. "CtrlAI" → "CA", "Ground Water…" → "GW"), else first two chars. */
function projectMonogram(title) {
  const caps = String(title).match(/[A-Z0-9]/g) || [];
  let m = caps.slice(0, 2).join("");
  if (m.length < 2) {
    m = String(title).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
  }
  return m || "·";
}

/* Deterministic on-brand hue (blue→purple→pink) so each monogram differs
   but the set stays cohesive with the accent palette. */
function hueFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return 248 + (h % 82); // 248–330
}

function renderProjects(projects) {
  const grid = $("projectsGrid");

  grid.innerHTML = projects
    .map((p) => {
      const liveLink = isValidUrl(p.live)
        ? `<a class="plink plink-live" href="${p.live}" target="_blank" rel="noreferrer">
             <span class="plink-dot"></span> Live demo
           </a>`
        : "";

      const codeLink = isValidUrl(p.code)
        ? `<a class="plink" href="${p.code}" target="_blank" rel="noreferrer">Code ↗</a>`
        : "";

      const statusBadge = p.status
        ? `<span class="badge">⏳ ${escapeHtml(p.status)}</span>`
        : "";

      const yearTag = p.year
        ? `<span class="project-year">${escapeHtml(p.year)}</span>`
        : "";

      const featured = p.featured ? " featured" : "";
      const featuredFlag = p.featured
        ? `<span class="featured-flag">★ Featured</span>`
        : "";

      const topRow =
        featuredFlag || statusBadge
          ? `<div class="project-top">${featuredFlag}${statusBadge}</div>`
          : "";

      const tags = Array.isArray(p.tags) ? p.tags : [];
      const title = p.title || "Untitled";
      const hue = hueFromString(title);

      return `
        <article class="card project${featured}">
          <div class="project-head">
            <span class="project-mono" style="--h1:${hue}deg;--h2:${hue + 34}deg" aria-hidden="true">${escapeHtml(projectMonogram(title))}</span>
            <div class="project-meta">
              ${topRow}
              <h3>${escapeHtml(title)}</h3>
            </div>
            ${yearTag}
          </div>

          <p>${escapeHtml(p.desc || "")}</p>

          <div class="tags">
            ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>

          <div class="project-links">
            ${liveLink}
            ${codeLink}
          </div>
        </article>
      `;
    })
    .join("");

  const count = $("projectCount");
  if (count) animateCount(count, projects.length);

  // Reveal newly-rendered cards
  observeReveal(grid.querySelectorAll(".project"));
}

/* ----------------------------------------------------------------- Skills */

async function loadSkills() {
  const grid = $("skillsGrid");
  if (!grid) return;
  try {
    const res = await fetch("./data/skills.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const skills = Array.isArray(data.skills) ? data.skills : [];
    grid.innerHTML = skills
      .map((s) => `<span class="chip">${escapeHtml(s)}</span>`)
      .join("");
  } catch (err) {
    console.error("Could not load skills.json:", err);
  }
}

/* --------------------------------------------------------- Certifications */

async function loadCertifications() {
  const grid = $("certsGrid");
  if (!grid) return;
  try {
    const res = await fetch("./data/certifications.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const certs = Array.isArray(data.certifications) ? data.certifications : [];
    grid.innerHTML = certs
      .map((c) => {
        const meta = [c.status, c.year].filter(Boolean).join(" • ");
        const titleHtml = isValidUrl(c.url)
          ? `<a href="${c.url}" target="_blank" rel="noreferrer">${escapeHtml(c.title)} ↗</a>`
          : escapeHtml(c.title || "Untitled");

        // Downloadable certificate (local PDF) or, failing that, an online
        // verification link — either opens the proof in a new tab.
        const proof = c.certificate || (isValidUrl(c.url) ? c.url : "");
        const getCert = proof
          ? `<a class="plink cert-get" href="${escapeHtml(proof)}" target="_blank" rel="noreferrer">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                 <polyline points="14 2 14 8 20 8"/>
               </svg>
               Get Certificate
             </a>`
          : "";

        return `
          <article class="card cert-card">
            <div class="card-body">
              <h3>${titleHtml}</h3>
              <p class="cert-meta">${escapeHtml(c.issuer || "")}</p>
              ${meta ? `<p class="cert-meta small">${escapeHtml(meta)}</p>` : ""}
              ${getCert}
            </div>
          </article>`;
      })
      .join("");
    observeReveal(grid.querySelectorAll(".cert-card"));
  } catch (err) {
    console.error("Could not load certifications.json:", err);
  }
}

/* -------------------------------------------- Full-page ink-reveal background

   A cursor-driven "ink wash" that carves holes in a dark mask to reveal the
   art beneath. Vanilla port of the InkReveal React component: a fixed,
   viewport-sized canvas is filled with the mask colour, then ink "stamps" are
   punched out with `destination-out` compositing. Each stamp is a wobbly circle
   that expands and fades over its lifetime; a trail of them is laid along the
   cursor path. The loop self-terminates when no stamps remain (zero idle cost).
   ------------------------------------------------------------------------- */

function setupInkReveal() {
  const canvas = document.getElementById("pageInk");
  if (!canvas) return;
  const wrap = canvas.closest(".page-ink");

  // No cursor to wash with on touch screens, and respect reduced-motion.
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(hover: none)").matches
  ) {
    if (wrap) wrap.style.display = "none";
    return;
  }

  const cfg = {
    maskColor: [10, 11, 15], // matches --bg so the unrevealed page looks seamless
    brushSize: 130,
    lifetime: 650,
    rStart: 10,
    rVary: 0.45,
    stampStep: 10,
    maxStamps: 200,
    segments: 36,
    wobble: [0.14, 0.08, 0.05],
    gradientInnerRadius: 0.2,
    gradientStops: [0.95, 0.88, 0],
  };
  const maskFill = `rgb(${cfg.maskColor.join(",")})`;

  const ctx = canvas.getContext("2d");
  let dims = { w: 0, h: 0 };
  const stamps = [];
  let running = false;
  let lastPos = null;

  function resize() {
    // Canvas is position:fixed, so it always spans the viewport.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dims = { w: window.innerWidth, h: window.innerHeight };
    canvas.width = Math.round(dims.w * dpr);
    canvas.height = Math.round(dims.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = maskFill;
    ctx.fillRect(0, 0, dims.w, dims.h);
  }

  function carveInk(x, y, r, seed, alpha) {
    const g = ctx.createRadialGradient(
      x, y, r * cfg.gradientInnerRadius,
      x, y, r
    );
    g.addColorStop(0, `rgba(0,0,0,${cfg.gradientStops[0] * alpha})`);
    g.addColorStop(0.5, `rgba(0,0,0,${cfg.gradientStops[1] * alpha})`);
    g.addColorStop(1, `rgba(0,0,0,${cfg.gradientStops[2] * alpha})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i <= cfg.segments; i++) {
      const a = (i / cfg.segments) * Math.PI * 2;
      const wob =
        0.78 +
        cfg.wobble[0] * Math.sin(a * 3 + seed) +
        cfg.wobble[1] * Math.sin(a * 5 + seed * 2.1) +
        cfg.wobble[2] * Math.sin(a * 7 + seed * 0.7);
      const px = x + Math.cos(a) * r * wob;
      const py = y + Math.sin(a) * r * wob;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function addStamp(x, y) {
    if (stamps.length >= cfg.maxStamps) stamps.shift();
    stamps.push({
      x,
      y,
      born: performance.now(),
      seed: Math.random() * Math.PI * 2,
      rmax: cfg.brushSize * (1 - cfg.rVary + Math.random() * cfg.rVary),
    });
  }

  function stampAlong(x, y) {
    if (!lastPos) {
      addStamp(x, y);
    } else {
      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / cfg.stampStep));
      for (let i = 1; i <= steps; i++) {
        addStamp(lastPos.x + (dx * i) / steps, lastPos.y + (dy * i) / steps);
      }
    }
    lastPos = { x, y };
  }

  function loop() {
    const now = performance.now();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = maskFill;
    ctx.fillRect(0, 0, dims.w, dims.h);
    ctx.globalCompositeOperation = "destination-out";
    for (let i = stamps.length - 1; i >= 0; i--) {
      const t = (now - stamps[i].born) / cfg.lifetime;
      if (t >= 1) {
        stamps.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - t, 3);
      const r = cfg.rStart + (stamps[i].rmax - cfg.rStart) * ease;
      const alpha = 1 - t * t;
      carveInk(stamps[i].x, stamps[i].y, r, stamps[i].seed, alpha);
    }
    if (stamps.length) requestAnimationFrame(loop);
    else running = false;
  }

  function start() {
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  resize();
  window.addEventListener("resize", resize);

  // Track the cursor across the whole page. The canvas is fixed, so viewport
  // (client) coordinates map 1:1 to canvas coordinates — no scroll math needed.
  window.addEventListener(
    "mousemove",
    (e) => {
      stampAlong(e.clientX, e.clientY);
      start();
    },
    { passive: true }
  );
  // Drop the trail when the cursor leaves the window so re-entry doesn't streak.
  document.addEventListener("mouseleave", () => {
    lastPos = null;
  });
}

/* ------------------------------------------------------------------ Theme */

function setupTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");

  const btn = $("themeBtn");
  if (!btn) return;
  const sync = () =>
    (btn.textContent = document.body.classList.contains("light") ? "☀" : "☾");
  sync();

  btn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light") ? "light" : "dark"
    );
    sync();
  });
}

/* -------------------------------------------------------------- Copy link */

function setupCopyLink() {
  const btn = $("copyLinkBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = "Copy site link"), 1200);
    } catch {
      alert("Copy failed. Please copy the URL from the address bar.");
    }
  });
}

/* ------------------------------------------------------------------- Year */

function setupYear() {
  const y = $("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------- Mobile nav menu */

function setupMobileNav() {
  const toggle = $("navToggle");
  const drawer = $("mobileNav");
  if (!toggle || !drawer) return;

  const setOpen = (open) => {
    drawer.classList.toggle("open", open);
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  };

  toggle.addEventListener("click", () =>
    setOpen(!drawer.classList.contains("open"))
  );

  // Close on link click
  drawer.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false))
  );

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (
      drawer.classList.contains("open") &&
      !drawer.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      setOpen(false);
    }
  });
}

/* ------------------------------------------------- Scroll-reveal + nav spy */

let revealObserver;
function observeReveal(nodes) {
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("revealed"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }
  nodes.forEach((n) => {
    n.classList.add("reveal");
    revealObserver.observe(n);
  });
}

function setupReveal() {
  observeReveal(document.querySelectorAll("[data-reveal]"));
}

function setupScrollSpy() {
  const links = Array.from(
    document.querySelectorAll('.links a[href^="#"]')
  );
  const map = new Map();
  links.forEach((l) => {
    const id = l.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, l);
  });
  if (!("IntersectionObserver" in window) || map.size === 0) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const link = map.get(entry.target);
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  map.forEach((_, sec) => spy.observe(sec));
}

/* ------------------------------------------------------- Hero entrance */

function setupHeroEntrance() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;
  // Set hidden state, then remove after a paint cycle
  // setTimeout works in hidden/background tabs; rAF does not
  hero.classList.add("hero-pending");
  setTimeout(() => hero.classList.remove("hero-pending"), 50);
}

/* ---------------------------------------------------------- Cursor glow */

function setupCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow || window.matchMedia("(hover: none)").matches) {
    if (glow) glow.style.display = "none";
    return;
  }
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  }, { passive: true });
}

/* ------------------------------------------------------- Scroll progress */

function setupScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + "%" : "0%";
  }, { passive: true });
}

/* -------------------------------------------------- Cycling hero text */

function setupCycleText() {
  const el = document.getElementById("cycleText");
  if (!el) return;

  const phrases = [
    "clean web apps",
    "AI-powered tools",
    "automation scripts",
    "full-stack projects",
    "practical solutions",
  ];

  // Insert blinking cursor right after the span
  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  cursor.setAttribute("aria-hidden", "true");
  el.after(cursor);

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];
    if (deleting) {
      el.textContent = phrase.slice(0, --charIdx);
    } else {
      el.textContent = phrase.slice(0, ++charIdx);
    }

    let delay = deleting ? 38 : 62;
    if (!deleting && charIdx === phrase.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 320;
    }
    setTimeout(tick, delay);
  }

  setTimeout(tick, 900);
}

/* ---------------------------------------------------- 3D card tilt */

function setupCardTilt() {
  if (window.matchMedia("(hover: none)").matches) return;

  let active = null;

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".card");
    if (card !== active) {
      if (active) active.style.transform = "";
      active = card;
    }
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform =
      `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
    card.style.setProperty("--mx", ((e.clientX - r.left) / r.width  * 100).toFixed(1) + "%");
    card.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100).toFixed(1) + "%");
  });

  document.addEventListener("mouseleave", () => {
    if (active) { active.style.transform = ""; active = null; }
  });
}

/* --------------------------------------------------- Animated counters */

// Count up to `target`, ending exactly on it. Shared by the stat counters
// and the dynamic project count.
function animateCount(el, target, dur = 1400) {
  if (!el) return;
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = String(target);
  })(start);
  // Safety net: setTimeout fires even when rAF is frozen (background/hidden
  // tab), so the final value always lands regardless of the animation.
  setTimeout(() => { el.textContent = String(target); }, dur + 120);
}

function setupCounters() {
  if (!("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const target = parseInt(entry.target.textContent, 10);
      if (!isNaN(target)) animateCount(entry.target, target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll(".stat-num").forEach((el) => {
    // #projectCount is filled asynchronously from projects.json — let
    // renderProjects animate it so we never lock onto its initial "0".
    if (el.id === "projectCount") return;
    if (/^\d+$/.test(el.textContent.trim())) obs.observe(el);
  });
}

/* ------------------------------------------------------------------- Init */

loadProjects();
loadSkills();
loadCertifications();
setupInkReveal();
setupTheme();
setupCopyLink();
setupYear();
setupMobileNav();
setupReveal();
setupScrollSpy();
setupHeroEntrance();
setupCursorGlow();
setupScrollProgress();
setupCycleText();
setupCardTilt();
setupCounters();
