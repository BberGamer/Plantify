// collapsible.jsx - Cung cấp primitive nội dung có thể mở rộng hoặc thu gọn
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({ ...props }) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      {...props}
    />
  );
}

function CollapsibleTrigger({ ...props }) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({ ...props }) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
};
