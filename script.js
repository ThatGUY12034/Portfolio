const projects = [
  {
    title:
      "Ground Water Monitoring & Predictive Analytics System | Smart India Hackathon 2025 (Waitlist Finalist)",
    desc: "AI-based dashboard to predict groundwater risk using ML models, React Native, and interactive visualizations. Includes automated alerts and reporting.",
    tags: ["React Native", "Python", "ML/AI"],
    code: "https://github.com/ThatGUY12034/Ground_Water_Prototype",
    // live: "https://your-live-link.com"
  },
  {
    title: "Inventory Management System (IMS)",
    desc: "Inventory management system with a clean frontend and Firebase-backed modules for members, orders, and reports management.",
    tags: ["HTML", "CSS", "JavaScript", "Firebase"],
    code: "https://github.com/ThatGUY12034/Inventory_Management-Flask-",
  },
  {
    title: "AI and Python Trading Bot",
    desc: "Trading bot project with rule-based logic and automation workflows (strategy + execution).",
    tags: ["Python", "Trading", "Automation"],
    code: "https://github.com/ThatGUY12034/Trading_bot",
  },
  {
    title: "Snake Game (Python Turtle)",
    desc: "Classic Snake game using OOP (Snake + Apple) with collision detection and scoring logic.",
    tags: ["Python", "OOP"],
    code: "https://github.com/ThatGUY12034/Snake_Game",
  },
  {
    title: "Minion Talk",
    desc: "Fun web app that converts English input into Minion language using Fun Translations API.",
    tags: ["HTML", "CSS", "JavaScript", "API"],
    code: "https://github.com/ThatGUY12034/Minion_Talk-",
    // live: "https://your-live-link.com"
  },
  {
    title: "The College Canteen",
    desc: "Food ordering application built using React and Node.js with Firebase backend integration.",
    tags: ["React", "Node.js", "Firebase", "API"],
    // code: "https://github.com/ThatGUY12034/your-repo" // add later
    // live: "https://your-live-link.com"
    status: "Private / Coming Soon",
  },
];

function $(id) {
  return document.getElementById(id);
}

function isValidUrl(url) {
  return typeof url === "string" && url.trim().startsWith("http");
}

function renderProjects() {
  const grid = $("projectsGrid");

  grid.innerHTML = projects
    .map((p) => {
      const liveLink = isValidUrl(p.live)
        ? `<a href="${p.live}" target="_blank" rel="noreferrer">Live</a>`
        : "";

      const codeLink = isValidUrl(p.code)
        ? `<a href="${p.code}" target="_blank" rel="noreferrer">Code</a>`
        : "";

      const statusBadge = p.status
        ? `<span class="badge">⏳ ${p.status}</span>`
        : "";

      return `
        <article class="card project">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>

          <div class="tags">
            ${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
            ${statusBadge}
          </div>

          <div class="project-links">
            ${liveLink}
            ${codeLink}
          </div>
        </article>
      `;
    })
    .join("");

  $("projectCount").textContent = String(projects.length);
}

function setupTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");

  $("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light") ? "light" : "dark"
    );
  });
}

function setupCopyLink() {
  $("copyLinkBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      $("copyLinkBtn").textContent = "Copied ✓";
      setTimeout(() => ($("copyLinkBtn").textContent = "Copy site link"), 1200);
    } catch {
      alert("Copy failed. Please copy the URL from the address bar.");
    }
  });
}

function setupYear() {
  $("year").textContent = new Date().getFullYear();
}

renderProjects();
setupTheme();
setupCopyLink();
setupYear();
