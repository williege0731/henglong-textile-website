(function () {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const drawer = document.querySelector(".nav-drawer");
  const overlay = document.querySelector(".nav-overlay");

  function openMenu() {
    drawer && drawer.classList.add("open");
    overlay && overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    drawer && drawer.classList.remove("open");
    overlay && overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  menuBtn && menuBtn.addEventListener("click", openMenu);
  closeBtn && closeBtn.addEventListener("click", closeMenu);
  overlay && overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 8);
  }, { passive: true });

  const pills = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-cat]");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      const key = pill.getAttribute("data-filter");
      cards.forEach((card) => {
        const show = key === "all" || card.getAttribute("data-cat") === key;
        card.style.display = show ? "" : "none";
      });
    });
  });

  const grid = document.querySelector(".fabric-grid");
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      if (!grid) return;
      grid.classList.toggle("is-list", btn.getAttribute("data-view") === "list");
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
