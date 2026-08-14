(() => {
  const faqList = document.querySelector("[data-faq-list]");
  const faqTitle = document.getElementById("faq-title");

  if (!faqList) return;

  function renderFaq(data) {
    if (!data || !Array.isArray(data.items)) {
      throw new TypeError("FAQ data must contain an items array.");
    }

    if (faqTitle && typeof data.title === "string") {
      faqTitle.textContent = data.title;
    }

    const fragment = document.createDocumentFragment();
    data.items.forEach((item) => {
      if (!item || typeof item.question !== "string" || typeof item.answer !== "string") {
        return;
      }

      const card = document.createElement("article");
      card.className = "faq-card";

      const heading = document.createElement("h2");
      const marker = document.createElement("span");
      marker.textContent = "Q";
      heading.append(marker, document.createTextNode(item.question));

      const answer = document.createElement("p");
      answer.textContent = item.answer;
      card.append(heading, answer);
      fragment.append(card);
    });

    faqList.replaceChildren(fragment);
    document.dispatchEvent(new CustomEvent("faq-content:ready"));
  }

  async function loadFaq() {
    try {
      const response = await fetch("data/faq.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      renderFaq(await response.json());
    } catch (error) {
      console.error("Unable to load FAQ content.", error);
      faqList.innerHTML = '<p class="faq-content-error">常見問題暫時無法載入，請稍後再試。</p>';
      document.dispatchEvent(new CustomEvent("faq-content:error"));
    }
  }

  loadFaq();
})();
