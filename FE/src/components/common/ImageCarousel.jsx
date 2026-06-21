import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { cn } from "@/lib/utils";

function ImageCarousel({
  images = [],
  alt = "Image",
  className,
  imageClassName,
  showCounter = true,
  onRemove,
  removeLabel = "Xoa anh hien tai",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeImages = images.filter(Boolean);
  const hasImages = safeImages.length > 0;
  const hasMultipleImages = safeImages.length > 1;

  useEffect(() => {
    setCurrentIndex((index) => {
      if (!safeImages.length) {
        return 0;
      }

      return Math.min(index, safeImages.length - 1);
    });
  }, [safeImages.length]);

  const goToPrev = () => {
    if (hasMultipleImages) {
      setCurrentIndex((index) => (index === 0 ? safeImages.length - 1 : index - 1));
    }
  };

  const goToNext = () => {
    if (hasMultipleImages) {
      setCurrentIndex((index) => (index === safeImages.length - 1 ? 0 : index + 1));
    }
  };

  if (!hasImages) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-green-100 bg-white", className)}>
      <ImageWithFallback
        src={safeImages[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        className={cn("h-full w-full object-contain", imageClassName)}
      />

      {hasMultipleImages && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 text-green-800 shadow-md hover:bg-white"
            onClick={goToPrev}
            aria-label="Anh truoc"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 text-green-800 shadow-md hover:bg-white"
            onClick={goToNext}
            aria-label="Anh tiep theo"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {showCounter && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
          {currentIndex + 1}/{safeImages.length}
        </div>
      )}

      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-md"
          onClick={() => onRemove(currentIndex)}
          aria-label={removeLabel}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export { ImageCarousel };
