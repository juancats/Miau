const gallery = document.querySelector(".cards");
const cards = gallery ? [...gallery.querySelectorAll(".card")] : [];
const flipAllBtn = document.getElementById("flipAll");
const toTop = document.getElementById("toTop");

/* ---------- Masonry: cada tarjeta ocupa las filas que necesita ---------- */
function spanCard(card) {
    const styles = getComputedStyle(gallery);
    const rowHeight = parseFloat(styles.gridAutoRows);
    const gap = parseFloat(styles.rowGap);
    const height = card.getBoundingClientRect().height;
    card.style.gridRowEnd = `span ${Math.ceil((height + gap) / (rowHeight + gap))}`;
}

// Recalcula cuando cambia el tamaño de una tarjeta (carga de imagen, ancho de pantalla…)
const sizeObserver = new ResizeObserver((entries) => entries.forEach((e) => spanCard(e.target)));
cards.forEach((card) => sizeObserver.observe(card));

/* ---------- Giro de tarjetas ---------- */
function setFlipped(card, flipped) {
    card.classList.toggle("is-flipped", flipped);
    const [front, back] = [card.querySelector(".card__front"), card.querySelector(".card__back")];
    // La cara oculta no debe recibir foco ni lectores de pantalla
    front.inert = flipped;
    back.inert = !flipped;
    front.setAttribute("aria-hidden", flipped);
    back.setAttribute("aria-hidden", !flipped);
    card.querySelector(flipped ? ".flip-btn--text" : ".flip-btn:not(.flip-btn--text)").focus({ preventScroll: true });
}

function syncFlipAll() {
    const allFlipped = cards.every((c) => c.classList.contains("is-flipped"));
    flipAllBtn.setAttribute("aria-pressed", allFlipped);
    flipAllBtn.textContent = allFlipped ? "Restaurar todas" : "Voltear todas";
}

cards.forEach((card) => {
    const front = card.querySelector(".card__front");
    const back = card.querySelector(".card__back");
    back.inert = true;
    back.setAttribute("aria-hidden", "true");

    // Clic en cualquier parte de la tarjeta (los botones también llegan aquí)
    card.addEventListener("click", () => {
        setFlipped(card, !card.classList.contains("is-flipped"));
        syncFlipAll();
    });
});

flipAllBtn.addEventListener("click", () => {
    const flip = !cards.every((c) => c.classList.contains("is-flipped"));
    cards.forEach((card, i) => {
        // Giro escalonado para un efecto de ola
        setTimeout(() => {
            card.classList.toggle("is-flipped", flip);
            card.querySelector(".card__front").inert = flip;
            card.querySelector(".card__back").inert = !flip;
        }, i * 60);
    });
    setTimeout(syncFlipAll, cards.length * 60);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        cards.forEach((c) => c.classList.contains("is-flipped") && setFlipped(c, false));
        syncFlipAll();
    }
});

/* ---------- Aparición escalonada al hacer scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        card.style.setProperty("--delay", `${(cards.indexOf(card) % 5) * 0.08}s`);
        card.classList.add("is-visible");
        // Tras la animación de entrada se quita el retardo para que el hover responda al instante
        setTimeout(() => card.classList.add("is-settled"), 900);
        revealObserver.unobserve(card);
    });
}, { threshold: 0.1 });
cards.forEach((card) => revealObserver.observe(card));

/* ---------- Botón "volver arriba" ---------- */
window.addEventListener("scroll", () => {
    toTop.classList.toggle("is-visible", window.scrollY > 400);
}, { passive: true });
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
