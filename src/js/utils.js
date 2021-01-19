// Prototype helper
export const isReady = (onReady) => {
    document.addEventListener('DOMContentLoaded', onReady, false);
    return () => document.removeEventListener('DOMContentLoaded', onReady)
}

// Constrains an input number, value between min and max values
export const constrain = (value, min, max) => min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)

export const delay = (duration = 400) => new Promise(resolve => setTimeout(resolve, duration));

// Simple function to manipulate DOM classes
export const setClass = (element, className, check = true) => {
    check ? element.classList.add(className) : element.classList.remove(className)
}
