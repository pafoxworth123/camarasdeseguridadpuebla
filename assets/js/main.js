// Cámaras de Seguridad Puebla — comportamiento del sitio
(function () {
  "use strict";

  /* Menú móvil */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Reloj del HUD en el hero (solo decorativo, escritorio) */
  var clock = document.querySelector("[data-hud-clock]");
  if (clock) {
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var tick = function () {
      var d = new Date();
      clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------
     Asistente de cotización (cuestionario paso a paso)
     Sin backend: al terminar arma un mensaje y abre WhatsApp con todo
     prellenado, listo para enviar.
     ------------------------------------------------------------------ */
  var wizardRoot = document.querySelector("#quote-wizard");
  if (wizardRoot) {
    var STEPS = [
      {
        key: "tipo",
        type: "choice",
        question: "¿Es para una casa o un negocio?",
        options: ["Residencial", "Comercial", "Ambos / varias propiedades"]
      },
      {
        key: "zona",
        type: "choice",
        question: "¿Qué área quieres cubrir principalmente?",
        options: ["Exterior", "Interior", "Ambos"]
      },
      {
        key: "cantidad",
        type: "choice",
        question: "¿Cuántas cámaras o entradas necesitas cubrir, más o menos?",
        options: ["1–2", "3–4", "5 o más", "Aún no lo sé"]
      },
      {
        key: "videoportero",
        type: "choice",
        question: "¿Te interesa también un videoportero (timbre inteligente)?",
        options: ["Sí", "No", "Tal vez, cuéntenme más"]
      },
      {
        key: "cableado",
        type: "choice",
        question: "¿Ya cuentas con cableado o cámaras instaladas?",
        options: ["Sí, ya tengo algo instalado", "No, sería desde cero", "No estoy seguro"]
      },
      {
        key: "colonia",
        type: "text",
        question: "¿En qué colonia o zona de Puebla está la propiedad?",
        placeholder: "Ej. Las Ánimas, Angelópolis, La Paz…"
      },
      {
        key: "presupuesto",
        type: "choice",
        question: "¿Tienes un presupuesto aproximado en mente?",
        options: ["Menos de $5,000", "$5,000 – $15,000", "$15,000 – $30,000", "Más de $30,000", "Prefiero que me orienten"]
      },
      {
        key: "urgencia",
        type: "choice",
        question: "¿Qué tan pronto lo necesitas?",
        options: ["Esta semana", "Este mes", "Solo estoy cotizando por ahora"]
      },
      {
        key: "contacto",
        type: "contact",
        question: "Por último, ¿cómo te contactamos?"
      }
    ];

    var LABELS = {
      tipo: "Tipo de propiedad",
      zona: "Área a cubrir",
      cantidad: "Cámaras / entradas",
      videoportero: "Interés en videoportero",
      cableado: "Cableado existente",
      colonia: "Colonia / zona",
      presupuesto: "Presupuesto aproximado",
      urgencia: "Urgencia"
    };

    var current = 0;
    var answers = {};

    function render() {
      var step = STEPS[current];
      var total = STEPS.length;
      var pct = Math.round(((current + 1) / total) * 100);
      var html = "";

      html += '<div class="qw-head">';
      html += '<span class="qw-steplabel">Paso ' + (current + 1) + ' de ' + total + '</span>';
      html += '<div class="qw-track"><div class="qw-fill" style="width:' + pct + '%;"></div></div>';
      html += "</div>";

      if (step.type === "choice") {
        html += '<p class="qw-question">' + step.question + "</p>";
        html += '<div class="qw-options">';
        step.options.forEach(function (opt) {
          var sel = answers[step.key] === opt ? " is-selected" : "";
          html += '<button type="button" class="qw-option' + sel + '" data-opt="' + opt.replace(/"/g, "&quot;") + '"><span>' + opt + '</span><span class="chk"></span></button>';
        });
        html += "</div>";
        html += '<div class="qw-actions"><button type="button" class="qw-back" data-back>← Atrás</button><span></span></div>';
      }

      if (step.type === "text") {
        html += '<p class="qw-question">' + step.question + "</p>";
        html += '<div class="qw-fields"><input type="text" class="qw-input" placeholder="' + (step.placeholder || "") + '" value="' + (answers[step.key] || "").replace(/"/g, "&quot;") + '"></div>';
        html += '<div class="qw-actions"><button type="button" class="qw-back" data-back' + (current === 0 ? " disabled" : "") + '>← Atrás</button><button type="button" class="btn btn-primary" data-next>Siguiente</button></div>';
      }

      if (step.type === "contact") {
        html += '<p class="qw-question">' + step.question + "</p>";
        html += '<div class="qw-fields">';
        html += '<div class="form-field" style="margin-bottom:0;"><label>Nombre</label><input type="text" class="qw-name" placeholder="Tu nombre" value="' + (answers.nombre || "").replace(/"/g, "&quot;") + '"></div>';
        html += '<div class="form-field" style="margin-bottom:0;"><label>Teléfono</label><input type="tel" class="qw-phone" placeholder="221 000 00 00" value="' + (answers.telefono || "").replace(/"/g, "&quot;") + '"></div>';
        html += "</div>";
        html += '<div class="qw-actions"><button type="button" class="qw-back" data-back>← Atrás</button><button type="button" class="btn btn-whatsapp" data-send>';
        html += '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.35 4 14.93c0 2.3.65 4.44 1.77 6.27L4 29l8.02-1.7a12.9 12.9 0 0 0 4 .63c6.62 0 12.02-5.35 12.02-11.93S22.64 3 16.02 3z"/></svg>';
        html += 'Enviar por WhatsApp</button></div>';
      }

      wizardRoot.innerHTML = html;
      bindStepEvents(step);
    }

    function goNext() {
      if (current < STEPS.length - 1) {
        current++;
        render();
      }
    }
    function goBack() {
      if (current > 0) {
        current--;
        render();
      }
    }

    function bindStepEvents(step) {
      var back = wizardRoot.querySelector("[data-back]");
      if (back) back.addEventListener("click", goBack);

      if (step.type === "choice") {
        wizardRoot.querySelectorAll(".qw-option").forEach(function (btn) {
          btn.addEventListener("click", function () {
            answers[step.key] = btn.getAttribute("data-opt");
            goNext();
          });
        });
      }

      if (step.type === "text") {
        var input = wizardRoot.querySelector(".qw-input");
        var nextBtn = wizardRoot.querySelector("[data-next]");
        nextBtn.addEventListener("click", function () {
          answers[step.key] = input.value.trim();
          goNext();
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") nextBtn.click();
        });
      }

      if (step.type === "contact") {
        var nameInput = wizardRoot.querySelector(".qw-name");
        var phoneInput = wizardRoot.querySelector(".qw-phone");
        var sendBtn = wizardRoot.querySelector("[data-send]");
        sendBtn.addEventListener("click", function () {
          var name = nameInput.value.trim();
          var phone = phoneInput.value.trim();
          if (!name || !phone) {
            nameInput.style.borderColor = name ? "" : "#E14B4B";
            phoneInput.style.borderColor = phone ? "" : "#E14B4B";
            return;
          }
          answers.nombre = name;
          answers.telefono = phone;
          sendQuote();
        });
      }
    }

    function sendQuote() {
      var lines = ["Hola, soy " + answers.nombre + ". Me gustaría una cotización:"];
      Object.keys(LABELS).forEach(function (key) {
        if (answers[key]) lines.push(LABELS[key] + ": " + answers[key]);
      });
      lines.push("Mi teléfono: " + answers.telefono);
      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/522216498364?text=" + text, "_blank", "noopener");
      renderDone();
    }

    function renderDone() {
      var summaryLines = Object.keys(LABELS)
        .filter(function (k) { return answers[k]; })
        .map(function (k) { return "<div><strong>" + LABELS[k] + ":</strong> " + answers[k] + "</div>"; })
        .join("");
      wizardRoot.innerHTML =
        '<div class="qw-done">' +
        '<div class="icon-ok"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
        "<h3>Se abrió WhatsApp con tu solicitud</h3>" +
        "<p>Si no se abrió automáticamente, escríbenos directo al 221 649 83 64. Este es el resumen que preparamos:</p>" +
        '<div class="qw-summary">' + summaryLines + "</div>" +
        '<button type="button" class="btn btn-outline" data-restart>Llenar otra cotización</button>' +
        "</div>";
      wizardRoot.querySelector("[data-restart]").addEventListener("click", function () {
        current = 0;
        answers = {};
        render();
      });
    }

    render();
  }
})();
