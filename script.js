const T = {
  ru: {
    required: "Заполните поле",
    phone: "Введите номер полностью",
    locale: "ru-RU",
  },
  en: {
    required: "This field is required",
    phone: "Enter the full phone number",
    locale: "en-GB",
  },
};

// Язык: сохраняется между страницами
let lang = "ru";
try {
  const saved = localStorage.getItem("lang");
  if (saved === "ru" || saved === "en") lang = saved;
} catch (e) {}

// Мобильное меню
const btn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
btn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});

// Фильтр проектов
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    document.querySelectorAll(".card").forEach((card) => {
      card.hidden = f !== "all" && card.dataset.type !== f;
    });
  });
});

// Калькулятор
const type = document.getElementById("calc-type");
const area = document.getElementById("calc-area");
const out = document.getElementById("calc-result");
function calc() {
  if (!type || !area || !out) return;
  const a = parseFloat(area.value);
  if (!(a > 0)) {
    out.textContent = "—";
    return;
  }
  const n = new Intl.NumberFormat(T[lang].locale).format(
    Math.round(a * type.value),
  );
  out.textContent = lang === "en" ? "€" + n : n + " €";
}
if (type && area) {
  type.addEventListener("change", calc);
  area.addEventListener("input", calc);
}

// Форма заявки (без сервера: подключите свой обработчик в месте, отмеченном TODO)
const form = document.getElementById("lead-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("input[required]").forEach((inp) => {
      const err = inp.parentElement.querySelector(".err");
      let msg = "";
      if (!inp.value.trim()) msg = T[lang].required;
      else if (inp.type === "tel" && inp.value.replace(/\D/g, "").length < 7)
        msg = T[lang].phone;
      inp.classList.toggle("invalid", !!msg);
      err.textContent = msg;
      if (msg) valid = false;
    });
    if (!valid) return;
    // TODO: отправка данных формы (fetch на ваш сервер, Formspree и т.п.)
    form.reset();
    document.getElementById("form-ok").hidden = false;
  });
}

// Перевод: русский текст берётся из HTML, английский из data-en / data-en-<атрибут>
function applyLang() {
  document.documentElement.lang = lang;
  document
    .querySelectorAll(
      "[data-en],[data-en-aria-label],[data-en-content],[data-en-placeholder]",
    )
    .forEach((el) => {
      if (el.hasAttribute("data-en")) {
        if (!el.hasAttribute("data-ru"))
          el.setAttribute("data-ru", el.textContent);
        el.textContent = el.getAttribute(lang === "en" ? "data-en" : "data-ru");
      }
      [...el.attributes]
        .filter((a) => a.name.startsWith("data-en-"))
        .forEach((a) => {
          const attr = a.name.slice(8);
          const key = "data-ru-" + attr;
          if (!el.hasAttribute(key))
            el.setAttribute(key, el.getAttribute(attr) || "");
          el.setAttribute(attr, lang === "en" ? a.value : el.getAttribute(key));
        });
    });
  document.querySelectorAll(".lang button").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.lang === lang);
  });
  document.querySelectorAll(".err").forEach((x) => {
    x.textContent = "";
  });
  document
    .querySelectorAll("input.invalid")
    .forEach((i) => i.classList.remove("invalid"));
  calc();
}

document.querySelectorAll(".lang button").forEach((b) => {
  b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {}
    applyLang();
  });
});

applyLang();
