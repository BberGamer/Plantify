import { motion } from "motion/react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function BlogPostDetailSkeleton({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <Card className="overflow-hidden border-green-200/70 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-green-100 px-5 py-4">
            <div className="h-6 w-28 animate-pulse rounded-full bg-green-100" />
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
          <div className="grid gap-3 bg-gradient-to-br from-green-50/60 to-white p-4 md:grid-cols-[1.5fr_1fr]">
            <div className="aspect-video animate-pulse rounded-lg bg-green-100" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-video animate-pulse rounded-lg bg-green-100/80"
                />
              ))}
            </div>
          </div>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="h-10 w-3/4 animate-pulse rounded bg-green-100" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-5 animate-pulse rounded bg-green-100/80"
                />
              ))}
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function BlogPostDetailError({ message, onClose, actionLabel = "Quay lại Blog" }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <Card className="border-destructive/20 bg-white shadow-2xl">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Không thể tải bài viết
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Button
              className="bg-gradient-to-r from-primary to-green-600 text-white"
              onClick={onClose}
            >
              {actionLabel}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export { BlogPostDetailError, BlogPostDetailSkeleton };
