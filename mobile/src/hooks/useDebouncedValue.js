import { useCallback, useEffect, useState } from "react";

// Clear áp dụng ngay; đổi filter/submit dùng flush để áp dụng cả query đang gõ.
export default function useDebouncedValue(input, delay = 400) {
  const [value, setValue] = useState(input);
  useEffect(() => {
    if (input === "") {
      setValue(input);
      return;
    }
    const timer = setTimeout(() => setValue(input), delay);
    return () => clearTimeout(timer);
  }, [input, delay]);
  const flush = useCallback((next = input) => setValue(next), [input]);
  return {
    value: input === "" ? "" : value,
    pending: input !== "" && input !== value,
    flush,
  };
}
