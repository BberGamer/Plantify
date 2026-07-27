// aspect-ratio.jsx - Cung cấp primitive duy trì tỷ lệ khung cho nội dung
"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({ ...props }) {
  return (
    <AspectRatioPrimitive.Root
      data-slot="aspect-ratio"
      {...props}
    />
  );
}

export {
  AspectRatio
};
