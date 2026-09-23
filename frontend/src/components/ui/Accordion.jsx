import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Accordion = ({ children, type = 'single', collapsible = true, className }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (value) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) && collapsible ? [] : [value]);
    } else {
      setOpenItems(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
    }
  };

  return (
    <div className={cn("w-full border-b border-border", className)}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          isOpen: openItems.includes(child.props.value),
          onToggle: () => toggleItem(child.props.value)
        });
      })}
    </div>
  );
};

export const AccordionItem = ({ value, isOpen, onToggle, children, className }) => {
  return (
    <div className={cn("border-t border-border", className)}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { isOpen, onToggle, value });
      })}
    </div>
  );
};

export const AccordionTrigger = ({ isOpen, onToggle, value, children, className }) => {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={cn(
        "flex w-full flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-text-muted", isOpen && "rotate-180")}
      />
    </button>
  );
};

export const AccordionContent = ({ isOpen, children, className }) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className={cn("pb-4 pt-0 text-sm text-text-secondary", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
