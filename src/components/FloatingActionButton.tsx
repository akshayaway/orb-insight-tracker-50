import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { actionFeedback } from '@/lib/haptics';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const handleClick = async () => {
    await actionFeedback();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="fixed right-4 bottom-6 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center safe-area-bottom"
      aria-label="Add new trade"
    >
      <Plus className="w-7 h-7 text-primary-foreground" />
    </motion.button>
  );
}
