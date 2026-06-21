import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

function ImagePlaceholder({ alt, className, style }) {
  return (
    <div
      className={`flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 bg-muted text-center text-muted-foreground ${className ?? ""}`}
      style={style}
      role="img"
      aria-label={alt || "Không thể tải ảnh"}
    >
      <ImageOff className="h-8 w-8" />
      <span className="px-3 text-sm">Không thể tải ảnh</span>
    </div>
  );
}

function ImageWithFallback({ src, alt, style, className, ...rest }) {
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    setDidError(false);
  }, [src]);

  if (!src || didError) {
    return <ImagePlaceholder alt={alt} className={className} style={style} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}

export { ImageWithFallback };
