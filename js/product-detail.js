/* 产品详情页：根据 URL 参数载入产品、切换主图并生成相关推荐。 */
(function () {
  "use strict";

  if (!window.PRODUCTS) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const product = window.PRODUCTS.find((item) => item.id === requestedId)
    || window.PRODUCTS.find((item) => item.id === "red-pingan-pendant")
    || window.PRODUCTS[0];

  const category = window.PRODUCT_CATEGORIES.find((item) => item.id === product.category);
  document.title = `${product.name}｜德莱云上朱砂`;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  setText("#detail-category", `${category?.label || "朱砂臻品"}${product.subcategory ? ` · ${product.subcategory}` : ""}`);
  setText("#detail-name", product.name);
  setText("#detail-number", product.number);
  setText("#detail-material", product.material);
  setText("#detail-size", product.size);
  setText("#detail-description", product.description);
  setText("#detail-meaning", product.meaning);
  setText("#breadcrumb-product", product.name);

  const categoryLink = document.querySelector("#detail-category-link");
  if (categoryLink) {
    categoryLink.textContent = category?.label || "产品图集";
    categoryLink.href = `products.html?category=${encodeURIComponent(product.category)}`;
  }

  const mainImage = document.querySelector("#detail-main-image");
  const thumbnails = document.querySelector("#detail-thumbnails");
  let currentIndex = 0;

  function selectImage(index) {
    if (!mainImage || !product.images[index]) return;
    currentIndex = index;
    mainImage.classList.add("is-changing");
    window.setTimeout(() => {
      mainImage.src = product.images[index];
      mainImage.alt = `${product.name}产品图 ${index + 1}`;
      mainImage.classList.remove("is-changing");
    }, 120);
    thumbnails?.querySelectorAll("button").forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  if (mainImage && thumbnails) {
    mainImage.src = product.images[0];
    mainImage.alt = `${product.name}产品主图`;
    thumbnails.innerHTML = product.images.map((image, index) => `
      <button type="button" aria-label="查看第 ${index + 1} 张产品图" aria-pressed="${index === 0}">
        <img src="${image}" alt="" loading="lazy">
      </button>
    `).join("");
    thumbnails.querySelector("button")?.classList.add("is-active");
    thumbnails.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      selectImage(Array.from(thumbnails.children).indexOf(button));
    });

    document.querySelector("#gallery-prev")?.addEventListener("click", () => {
      selectImage((currentIndex - 1 + product.images.length) % product.images.length);
    });
    document.querySelector("#gallery-next")?.addEventListener("click", () => {
      selectImage((currentIndex + 1) % product.images.length);
    });
  }

  const relatedGrid = document.querySelector("#related-grid");
  if (relatedGrid) {
    const sameCategory = window.PRODUCTS.filter(
      (item) => item.id !== product.id && item.category === product.category
    );
    const fallback = window.PRODUCTS.filter(
      (item) => item.id !== product.id && item.category !== product.category
    );
    const related = [...sameCategory, ...fallback].slice(0, 3);
    relatedGrid.innerHTML = related.map((item) => `
      <article class="related-card">
        <a href="product.html?id=${encodeURIComponent(item.id)}" class="related-card__image">
          <img src="${item.images[0]}" alt="${item.name}" loading="lazy">
        </a>
        <div>
          <p>${window.PRODUCT_CATEGORIES.find((categoryItem) => categoryItem.id === item.category)?.label || "朱砂臻品"}</p>
          <h3><a href="product.html?id=${encodeURIComponent(item.id)}">${item.name}</a></h3>
        </div>
      </article>
    `).join("");
  }
})();
