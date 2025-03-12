import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, portName }) {
  if (!isOpen) return null;

  // Animation variants for the backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Animation variants for the modal
  const modalVariants = {
    hidden: { 
      scale: 0.5, 
      opacity: 0,
      y: 60
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 40,
      transition: {
        duration: 0.2
      }
    }
  };

  // Button hover animation
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  // Warning icon animation
  const iconVariants = {
    initial: { rotate: 0 },
    animate: { 
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 relative border border-gray-200"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking modal
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className="text-red-500"
            >
              <FaExclamationTriangle className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                This action cannot be reversed
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete port "<span className="font-semibold text-red-600">{portName}</span>"?
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 
                rounded-lg transition-colors duration-200 font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                transition-colors duration-200 font-medium shadow-lg shadow-red-600/30"
            >
              Delete Port
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
