import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-50 w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                  {title}
                </h2>
                <IconButton icon={<X className="h-5 w-5" />} onClick={onClose} aria-label="Close modal" size="sm" />
              </div>
            )}
            {!title && (
              <div className="absolute right-4 top-4">
                <IconButton icon={<X className="h-5 w-5" />} onClick={onClose} aria-label="Close modal" size="sm" />
              </div>
            )}
            <div className="mt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
