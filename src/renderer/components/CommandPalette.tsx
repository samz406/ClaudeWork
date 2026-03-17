import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  category?: string;
  handler: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter((cmd) => {
      const label = cmd.label.toLowerCase();
      const category = (cmd.category ?? '').toLowerCase();
      return label.includes(query) || category.includes(query);
    });
  }, [search, commands]);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      // Focus after the portal paints
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Clamp selectedIndex when filtered list shrinks
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const execute = useCallback(
    (cmd: CommandItem) => {
      onClose();
      // Defer handler so the palette closes first
      requestAnimationFrame(() => cmd.handler());
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (filtered.length > 0) {
            setSelectedIndex((i) => (i + 1) % filtered.length);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (filtered.length > 0) {
            setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            execute(filtered[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered, selectedIndex, execute, onClose],
  );

  if (!isOpen) return null;

  // Group filtered commands by category for rendering
  const groups: { category: string; items: CommandItem[] }[] = [];
  const seen = new Map<string, number>();
  for (const cmd of filtered) {
    const cat = cmd.category ?? '';
    const idx = seen.get(cat);
    if (idx !== undefined) {
      groups[idx].items.push(cmd);
    } else {
      seen.set(cat, groups.length);
      groups.push({ category: cat, items: [cmd] });
    }
  }

  // Build a flat index lookup so we can map (groupIdx, itemIdx) → global index
  let globalIndex = 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Translucent overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* Palette container */}
      <div
        className="relative w-full max-w-xl mx-4 flex flex-col bg-claude-surface dark:bg-claude-darkSurface
          rounded-xl shadow-modal border border-claude-border dark:border-claude-darkBorder
          overflow-hidden max-h-[60vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-claude-border dark:border-claude-darkBorder">
          <MagnifyingGlassIcon className="w-5 h-5 text-claude-textSecondary dark:text-claude-darkTextSecondary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 bg-transparent text-sm text-claude-text dark:text-claude-darkText
              placeholder:text-claude-textSecondary dark:placeholder:text-claude-darkTextSecondary
              outline-none"
          />
        </div>

        {/* Command list */}
        <div ref={listRef} className="overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-claude-textSecondary dark:text-claude-darkTextSecondary">
              No matching commands
            </div>
          )}

          {groups.map((group) => {
            const startIndex = globalIndex;
            const renderedItems = group.items.map((cmd, j) => {
              const idx = startIndex + j;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-claude-accent/10 dark:bg-claude-accent/20 text-claude-accent'
                      : 'text-claude-text dark:text-claude-darkText hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover'
                    }`}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="truncate">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd
                      className={`ml-4 flex-shrink-0 text-xs px-1.5 py-0.5 rounded border font-mono
                        ${isSelected
                          ? 'border-claude-accent/30 text-claude-accent'
                          : 'border-claude-border dark:border-claude-darkBorder text-claude-textSecondary dark:text-claude-darkTextSecondary'
                        }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            });
            globalIndex += group.items.length;

            return (
              <div key={group.category || '__uncategorized'}>
                {group.category && (
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-claude-textSecondary dark:text-claude-darkTextSecondary">
                    {group.category}
                  </div>
                )}
                {renderedItems}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-claude-border dark:border-claude-darkBorder text-xs text-claude-textSecondary dark:text-claude-darkTextSecondary">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> execute</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
