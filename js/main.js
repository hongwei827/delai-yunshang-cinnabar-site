/* 全站基础交互：导航、滚动动效、产品筛选与产品卡片。 */
(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  function setMenu(open) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    body.classList.toggle("menu-open", open);
  }

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const page = body.dataset.page;
  document.querySelectorAll(".site-nav a[data-page]").forEach((link) => {
    const active = link.dataset.page === page;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  function categoryLabel(categoryId) {
    return window.PRODUCT_CATEGORIES?.find((item) => item.id === categoryId)?.label || "朱砂臻品";
  }

  function arrowIcon() {
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  }

  function productCard(product, index, featured = false) {
    const modifier = featured && index === 0 ? " product-card--large" : "";
    return `
      <article class="product-card${modifier} reveal is-visible" data-category="${product.category}">
        <a class="product-card__image" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="查看${product.name}详情">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" decoding="async">
          <span class="product-card__view">查看详情 ${arrowIcon()}</span>
        </a>
        <div class="product-card__body">
          <p class="product-card__category">${categoryLabel(product.category)}</p>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
          <p>${product.tagline}</p>
        </div>
      </article>`;
  }

  const featuredGrid = document.querySelector("#featured-grid");
  if (featuredGrid && window.PRODUCTS) {
    const featuredProducts = window.PRODUCTS
      .filter((product) => product.featured)
      .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
      .slice(0, 5);
    featuredGrid.innerHTML = featuredProducts.map((product, index) => productCard(product, index, true)).join("");
  }

  const productGrid = document.querySelector("#product-grid");
  const filterBar = document.querySelector("#category-filters");
  const resultCount = document.querySelector("#result-count");

  if (productGrid && filterBar && window.PRODUCTS && window.PRODUCT_CATEGORIES) {
    filterBar.innerHTML = window.PRODUCT_CATEGORIES.map(
      (category) => `<button class="filter-button" type="button" data-filter="${category.id}">${category.label}</button>`
    ).join("");

    function renderProducts(categoryId) {
      const products = categoryId === "all"
        ? window.PRODUCTS
        : window.PRODUCTS.filter((product) => product.category === categoryId);

      productGrid.classList.add("is-updating");
      window.setTimeout(() => {
        productGrid.innerHTML = products.map((product, index) => productCard(product, index)).join("");
        productGrid.classList.remove("is-updating");
      }, 130);

      filterBar.querySelectorAll(".filter-button").forEach((button) => {
        const active = button.dataset.filter === categoryId;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const activeButton = filterBar.querySelector(".filter-button.is-active");
      if (activeButton) {
        filterBar.scrollTo({
          left: Math.max(0, activeButton.offsetLeft - (filterBar.clientWidth - activeButton.offsetWidth) / 2),
          behavior: "smooth"
        });
      }

      if (resultCount) resultCount.textContent = `共 ${products.length} 件作品`;
    }

    const queryCategory = new URLSearchParams(window.location.search).get("category");
    const initialCategory = window.PRODUCT_CATEGORIES.some((category) => category.id === queryCategory)
      ? queryCategory
      : "all";
    renderProducts(initialCategory);

    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      renderProducts(button.dataset.filter);
      if (window.location.protocol !== "file:") {
        const url = new URL(window.location.href);
        if (button.dataset.filter === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", button.dataset.filter);
        window.history.replaceState({}, "", url);
      }
    });
  }
})();
