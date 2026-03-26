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
    span.textContent = ele === " " ? "\u00A0" : ele;
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
    "toggle-receiver-id": toggle_receiver,
    "toggle-enterClass": toggleShowClass,
    "toggle-leaveClass": toggleRemoveClass,
    "scroll-enterClass": scrollEnterClass,
    "scroll-leaveClass": scrollLeaveClass,
  } = variables;
  if (type === "enter" && (scrollEnterClass || enterClass)) {
    element.classList.remove(
      ...clsx_stringarray(
        [scrollEnterClass || enterClass, scrollLeaveClass || leaveClass].flat(),
      ),
    );
    element.classList.add(...clsx_stringarray(scrollEnterClass || enterClass));
  } else if (type === "leave" && (scrollLeaveClass || leaveClass)) {
    element.classList.remove(
      ...clsx_stringarray(
        [scrollEnterClass || enterClass, scrollLeaveClass || leaveClass].flat(),
      ),
    );
    element.classList.add(...clsx_stringarray(scrollLeaveClass || leaveClass));
  }
  if (toggle_receiver) {
    const toggleReveiverElement = document.querySelector(
      `[data-toggle-receiver-id=${toggle_receiver}]`,
    );

    if (type === "enter" && toggleShowClass) {
      toggleReveiverElement.classList.remove(
        ...clsx_stringarray([toggleRemoveClass, toggleShowClass]),
      );
      toggleReveiverElement.classList.add(...clsx_stringarray(toggleShowClass));
    } else if (type === "leave" && toggleRemoveClass) {
      toggleReveiverElement.classList.remove(
        ...clsx_stringarray([toggleRemoveClass, toggleShowClass]),
      );
      toggleReveiverElement.classList.add(
        ...clsx_stringarray(toggleRemoveClass),
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
  const classes = Array.isArray(string)
    ? string.join(" ").split(" ").filter(Boolean)
    : string
      ? string.split(" ").filter(Boolean)
      : [];
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
 * This function runs the specified animation function on the given element. It can be used to toggle animations based on user interactions or other events.
 */
function runAnimation(
  element,
  animationStyle,
  animationFunction,
  animationVariables = {},
) {
  const styleOnlyVariables = Object.keys(animationVariables).filter((key) =>
    key.includes(`${animationStyle}`),
  );
  const styleOnlyVariablesPrefixed = styleOnlyVariables.reduce((acc, key) => {
    acc[key] = animationVariables[key];
    return acc;
  }, {});
  const variables =
    Object.keys(styleOnlyVariablesPrefixed) > 0
      ? styleOnlyVariablesPrefixed
      : animationVariables;

  switch (animationStyle) {
    case "hover":
      ["enter", "leave"].forEach((eventType) => {
        element.addEventListener(`mouse${eventType}`, () => {
          animationFunction(element, eventType, variables);
        });
      });
      break;
    case "play":
      animationFunction(element, "enter", variables);
      break;
    case "toggle":
      let toggled = false;
      element.addEventListener("click", () => {
        toggled = !toggled;
        const type = toggled ? "enter" : "leave";
        animationFunction(element, type, variables);
      });
      break;
    case "scroll":
      useIntersectionObserver(element, variables, animationFunction);
      break;
  }
}

/**
 * @param {HTMLElement} element
 * @param {"hover"|"play"|"toggle"|"scroll"} style
 * @returns {Record<string, string|number|array|boolean>}
 */
function getVariables(element, style) {
  const animationVariables =
    element.getAttribute("data-animation-variables") || "{}";
  const fixedAnimationVariableJson = animationVariables
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":');
  const styleOnlyVariables =
    element.getAttribute(`data-${style}-variables`) || "{}";
  const fixedStyleOnlyVariablesJson = JSON.parse(
    styleOnlyVariables.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'),
  );
  const styleOnlyVariablesPrefixed = Object.keys(
    fixedStyleOnlyVariablesJson,
  ).reduce((acc, key) => {
    acc[`${style}-${key}`] = fixedStyleOnlyVariablesJson[key];
    return acc;
  }, {});
  const variables = Object.assign(
    JSON.parse(fixedAnimationVariableJson),
    styleOnlyVariablesPrefixed,
  );

  return variables;
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
      const animationVariables = getVariables(element, state);
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
