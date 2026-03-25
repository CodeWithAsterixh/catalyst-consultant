// --------------------------------------------animations
// underline animation
/**
 * @typedef {'enter'|'leave'} TimelineType
 * @typedef {(
 *     element: HTMLElement,
 *     type: TimelineType,
 *     variables: Record<string, string|number|array|boolean>
 * )=>void} AnimationFunction
 */
/**
 * This function adds an underline animation to the specified element. It creates a pseudo-element that animates from left to right, giving the effect of an underline appearing beneath the text.
 * @type {AnimationFunction}
 */
function underlineAnimation(element, type) {
  if (type === "enter") {
    element.classList.remove("underline-animation-leave");
    element.classList.add("underline-animation-enter");
    return;
  } else {
    element.classList.remove("underline-animation-enter");
    element.classList.add("underline-animation-leave");
    return;
  }
}

// character animations
/**
 * This function is intended to add character animations to the specified element. It can be used to create effects such as text appearing one character at a time or other character-based animations. The implementation details would depend on the specific animation effect desired.
 * @type {AnimationFunction}
 */

function characterAnimation(element, type, variables) {
  if (type === "enter") {
    element.classList.remove("character-animation-leave");
    element.classList.add("character-animation-enter");
  } else {
    element.classList.remove("character-animation-enter");
    element.classList.add("character-animation-leave");
  }
  const { text, variant } = variables;
  const characters =
    variant === "char"
      ? text.split("")
      : variant === "word"
        ? text.split(" ")
        : [text];

  const animatedElements = characters.map((ele, index) => {
    const span = document.createElement("span");
    span.ariaHidden = "true";
    span.style.setProperty("--index", index);
    span.textContent = ele;
    return span;
  });

  element.textContent = ""; // clear original text
  animatedElements.forEach((span) => element.appendChild(span));

  // break characters into small
}

// dynamic toggle
/**
 * this function is designed to show add custom class to animations based on it's state
 * @type {AnimationFunction}
 */

function dynamicToggle(element, type, variables) {
  const {
    enterClass,
    leaveClass,
    trigger_receiver,
    trigger_showClass,
    trigger_removeClass,
  } = variables;
  if (type === "enter" && enterClass) {
    element.classList.remove(...clsx_stringarray([enterClass, leaveClass]));
    element.classList.add(...clsx_stringarray(enterClass));
  } else if (type === "leave" && leaveClass) {
    element.classList.remove(...clsx_stringarray([enterClass, leaveClass]));
    element.classList.add(...clsx_stringarray(leaveClass));
  }
  if (trigger_receiver) {
    const triggerReveiverElement = document.querySelector(
      `[data-trigger-receiver-id=${trigger_receiver}]`,
    );

    if (type === "enter" && trigger_showClass) {
      triggerReveiverElement.classList.remove(
        ...clsx_stringarray([trigger_removeClass, trigger_showClass]),
      );
      triggerReveiverElement.classList.add(
        ...clsx_stringarray(trigger_showClass),
      );
    } else if (type === "leave" && trigger_removeClass) {
      triggerReveiverElement.classList.remove(
        ...clsx_stringarray([trigger_removeClass, trigger_showClass]),
      );
      triggerReveiverElement.classList.add(
        ...clsx_stringarray(trigger_removeClass),
      );
    }
  }
}

// --------------------------------------------animation helpers
/**
 * @param {string|string[]} string
 * @returns {string[]}
 * This function is a utility function that can be used to conditionally combine class names based on certain conditions. It takes a string of class names and returns a single string that can be applied to an element's class attribute.
 */
function clsx_stringarray(string) {
  const classes = Array.isArray(string) ? string.join(" ").split(" ").filter(Boolean) : string ? string.split(" ").filter(Boolean) : [];
  return classes;
}

/**
 *
 * @param {HTMLElement} element
 * @param {{visible:string, hidden:string}} styles
 * @param {{
 * type:"scrolling"|"scrollTo",
 * threshold: number,
 * variables: Record<string, string|number|array|boolean>,
 * }} options
 * @param {(element: HTMLElement, type: TimelineType, variables: Record<string, string|number|array|boolean>) => void} animationFunction
 *
 */
function useIntersectionObserver(element, options = {}, animationFunction) {
  options = {
    threshold: 0.1,
    type: "scrollTo",
    root: Element | Document | null,
    ...options,
  };
  let visibilityPercentage = 0;
  // define observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibilityPercentage = entry.intersectionRatio * 100;
        if (entry.isIntersecting) {
          animationFunction(element, "enter", options);
        } else {
          animationFunction(element, "leave", options);
        }
      });
    },
    {
      threshold:
        options.type === "scrollTo"
          ? options.threshold
          : Array.from({ length: 101 }, (_, i) => i / 100),
      root: options.root || null,
    },
  );

  // start observing the element
  observer.observe(element);
  return visibilityPercentage;
}
/**
 * @param {HTMLElement} element
 * @param {"hover"|"play"|"toggle"|"scroll"} animationStyle
 * @param {(element: HTMLElement, type: TimelineType, variables: Record<string, string|number|array|boolean>) => void} animationFunction
 * @param {Record<string, string|number|array|boolean>} animationVariables
 * @returns {void}
 * This function runs the specified animation function on the given element. It can be used to trigger animations based on user interactions or other events.
 */
function runAnimation(
  element,
  animationStyle,
  animationFunction,
  animationVariables = {},
) {
  switch (animationStyle) {
    case "hover":
      ["enter", "leave"].forEach((eventType) => {
        element.addEventListener(`mouse${eventType}`, () => {
          animationFunction(element, eventType, animationVariables);
        });
      });
      break;
    case "play":
      animationFunction(element, "enter", animationVariables);
      break;
    case "toggle":
      let toggled = false;
      element.addEventListener("click", () => {
        toggled = !toggled;
        const type = toggled ? "enter" : "leave";
        animationFunction(element, type, animationVariables);
      });
      break;
    case "scroll":
      useIntersectionObserver(element, animationVariables, animationFunction);
      break;
  }
}

/**
 * @param {HTMLElement} element
 * @returns {Record<string, string|number|array|boolean>}
 */
function getVariables(element) {
  const animationVariables =
    element.getAttribute("data-animation-variables") || "{}";
  const fixedJson = animationVariables
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":');
  return JSON.parse(fixedJson);
}
export function loadAnimations() {
  const availableAnimations = {
    underline_animation: underlineAnimation,
    character_animation: characterAnimation,
    dynamic_toggle: dynamicToggle,
  };

  const animationStates = ["hover", "play", "toggle", "scroll"];
  animationStates.forEach((state) => {
    const stateElements = document.querySelectorAll(
      `[data-${state}-animation]`,
    );
    stateElements.forEach((element) => {
      const animationType = element
        .getAttribute(`data-${state}-animation`)
        .split(", ");
      const animationVariables = getVariables(element);
      if (animationType.length > 0) {
        animationType.forEach((type) => {
          if (availableAnimations[type]) {
            runAnimation(
              element,
              state,
              availableAnimations[type],
              animationVariables,
            );
          }
        });
      }
    });
  });
}
