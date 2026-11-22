'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  Laptop, 
  FileText, 
  Wallet, 
  Briefcase, 
  Watch, 
  Key, 
  Shirt, 
  HelpCircle, 
  MapPin, 
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  colorDot?: string;
}

interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | SelectOption)[] | (string | SelectOption)[] | readonly any[];
  placeholder?: string;
  type?: 'category' | 'color' | 'city' | 'custody' | 'generic';
  className?: string;
  required?: boolean;
}

const COLOR_SWATCHES: Record<string, string> = {
  Black: '#1C1E21',
  'Dark Blue / Navy': '#1E3A8A',
  'Brown / Tan': '#854D0E',
  'Grey / Silver': '#9CA3AF',
  White: '#FFFFFF',
  'Red / Maroon': '#DC2626',
  Green: '#16A34A',
  'Yellow / Gold': '#EAB308',
  'Multi-colored': 'linear-gradient(135deg, #EF4444 0%, #3B82F6 50%, #10B981 100%)',
  Other: '#CBD5E1',
};

function getCategoryIcon(cat: string) {
  switch (cat.toLowerCase()) {
    case 'electronics':
      return <Laptop className="h-4 w-4 text-blue-600 shrink-0" />;
    case 'documents':
      return <FileText className="h-4 w-4 text-amber-600 shrink-0" />;
    case 'wallets':
      return <Wallet className="h-4 w-4 text-emerald-600 shrink-0" />;
    case 'bags':
      return <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />;
    case 'accessories':
      return <Watch className="h-4 w-4 text-purple-600 shrink-0" />;
    case 'keys':
      return <Key className="h-4 w-4 text-orange-600 shrink-0" />;
    case 'clothing':
      return <Shirt className="h-4 w-4 text-teal-600 shrink-0" />;
    default:
      return <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />;
  }
}

export default function Select({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  type = 'generic',
  className = '',
  required = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      let icon: React.ReactNode = null;
      let colorDot: string | undefined = undefined;

      if (type === 'category') {
        icon = getCategoryIcon(opt);
      } else if (type === 'color') {
        colorDot = COLOR_SWATCHES[opt] || '#CBD5E1';
      } else if (type === 'city') {
        icon = <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />;
      }

      return {
        value: opt,
        label: opt,
        icon,
        colorDot,
      };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for form compliance */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${
          isOpen
            ? 'border-accent ring-2 ring-accent/20 shadow-sm'
            : 'border-[#D1D5DB] hover:border-text-secondary/60'
        }`}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon}
          {selectedOption?.colorDot && (
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15 shadow-2xs"
              style={{
                background: selectedOption.colorDot,
              }}
            />
          )}
          <span className={selectedOption ? 'text-text-primary font-medium truncate' : 'text-text-muted truncate'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border-subtle bg-surface p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
          <div role="listbox" className="space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent/10 font-semibold text-accent'
                      : 'text-text-primary hover:bg-[#F3F4F6] hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon}
                    {opt.colorDot && (
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15 shadow-2xs"
                        style={{
                          background: opt.colorDot,
                        }}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-accent shrink-0 ml-2 stroke-[2.5]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
