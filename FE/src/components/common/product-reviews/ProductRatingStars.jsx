// ProductRatingStars.jsx - Hiển thị và cho phép chọn mức đánh giá sản phẩm bằng sao
import { useState } from "react";
import { Star } from "lucide-react";

function ProductRatingStars({ rating, onChange }) {
  const [hovered, setHovered] = useState(null);
  const safeRating = Math.max(0, Math.min(Number(rating) || 0, 5));
  const displayRating = hovered ?? safeRating;

  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${safeRating}/5 sao`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={`rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            onChange ? "cursor-pointer hover:text-amber-600" : "cursor-default"
          }`}
          onClick={() => onChange?.(index + 1)}
          onMouseEnter={() => onChange && setHovered(index + 1)}
          onMouseLeave={() => onChange && setHovered(null)}
          disabled={!onChange}
          aria-label={`Chon ${index + 1} sao`}
        >
          <Star
            className={`h-4 w-4 transition-all ${
              index < displayRating
                ? "fill-current text-amber-500"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export { ProductRatingStars };
