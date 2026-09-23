import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

export const Popover = ({ children, content, position = 'bottom', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEscape = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" ref={popoverRef} onKeyDown={handleEscape}>
      <div onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0}>
        {children}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-64 rounded-lg border border-border bg-surface p-4 shadow-lg",
              positionClasses[position],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
