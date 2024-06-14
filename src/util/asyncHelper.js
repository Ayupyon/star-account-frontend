export function debounce(fn, wait) {
  let timeoutId = null;

  return function(...args) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}