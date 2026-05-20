import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

function FloatingAIButton({ onClick }) {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-primary to-green-600 hover:from-green-600 hover:to-primary relative overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
      </Button>
    </motion.div>
  );
}

export { FloatingAIButton };
