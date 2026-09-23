import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { motion, AnimatePresence } from 'framer-motion';

export const Drawer = ({ isOpen, onClose, title, children, side = 'right', className }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  };

  const sideClasses = {
    right: 'inset-y-0 right-0',
    left: 'inset-y-0 left-0',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            variants={slideVariants[side]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "absolute h-full w-full max-w-sm bg-surface shadow-2xl flex flex-col",
              sideClasses[side],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              <IconButton icon={<X className="h-5 w-5" />} onClick={onClose} aria-label="Close drawer" size="sm" className="ml-auto" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
