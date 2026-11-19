import { useCallback, useState } from "react";
import chatService from "../services/chatService";
import useDebouncedValue from "./useDebouncedValue";
import usePaginatedList from "./usePaginatedList";

export default function useManagerChats() {
  const [search, setSearch] = useState("");
  const { value: debounced, pending } = useDebouncedValue(search, 300);
  const fetchPage = useCallback((params) => chatService.listManager({ ...params, search: debounced }), [debounced]);
  const list = usePaginatedList(fetchPage, { limit: 20, enabled: !pending });
  return { ...list, search, changeSearch: setSearch };
}
