const React = require("react");

// Navigator giả; effect/cleanup và subscription vẫn chạy qua React thật.
function createFocus() {
  let focused = true;
  const listeners = new Set();
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    set(value) {
      focused = value;
      listeners.forEach((listener) => listener());
    },
    useFocusEffect(callback) {
      const active = React.useSyncExternalStore(subscribe, () => focused);
      React.useEffect(() => {
        if (active) return callback();
      }, [active, callback]);
    },
  };
}
module.exports = { createFocus };
