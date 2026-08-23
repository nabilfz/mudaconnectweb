import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const itemId = React.useId();
  const triggerId = `${itemId}-trigger`;
  const panelId = `${itemId}-panel`;

  return (
    <div className="border-b border-[#cfcac0] bg-transparent transition-colors duration-200">
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-bold text-[#071f32] transition-colors hover:text-[#007d6f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007d6f]"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-sm sm:text-base font-sans">{title}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-[#617078] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#007d6f]' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="pb-5 pt-1 font-sans text-sm leading-7 text-[#617078]"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = 'divide-y-0',
}) => {
  return <div className={`border-t border-[#cfcac0] ${className}`}>{children}</div>;
};
