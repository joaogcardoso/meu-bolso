(function initDom(root, factory) {
  const api = factory(root.document);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MeuBolsoDom = api;
})(typeof window !== "undefined" ? window : globalThis, function domFactory(documentRef) {
  function createElement(tagName, options = {}) {
    const element = documentRef.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.text !== undefined) {
      element.textContent = options.text;
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== false) {
          element.setAttribute(name, String(value));
        }
      });
    }

    if (options.children) {
      options.children.forEach((child) => {
        if (child) {
          element.appendChild(child);
        }
      });
    }

    return element;
  }

  function replaceChildren(element, children) {
    element.replaceChildren(...children.filter(Boolean));
  }

  function setFieldError(field, errorElement, message) {
    if (!field || !errorElement) {
      return;
    }

    if (message) {
      field.classList.add("input-error", "select-error", "textarea-error");
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", errorElement.id);
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
      return;
    }

    field.classList.remove("input-error", "select-error", "textarea-error");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
  }

  function createEmptyRow(colspan, message) {
    return createElement("tr", {
      children: [
        createElement("td", {
          className: "py-8 text-center text-base-content/60",
          text: message,
          attributes: { colspan },
        }),
      ],
    });
  }

  return {
    createElement,
    replaceChildren,
    setFieldError,
    createEmptyRow,
  };
});
