import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline';
import '@xterm/xterm/css/xterm.css';

export interface TerminalProps {
  title?: string;
  onClose?: () => void;
  onInput?: (data: string) => void;
  initialContent?: string;
}

export interface TerminalHandle {
  write: (data: string) => void;
  writeLine: (data: string) => void;
  clear: () => void;
  focus: () => void;
}

const DARK_THEME = {
  background: '#0F1117',
  foreground: '#E4E5E9',
  cursor: '#E4E5E9',
  cursorAccent: '#0F1117',
  selectionBackground: '#3B82F640',
  black: '#1A1D27',
  red: '#F87171',
  green: '#34D399',
  yellow: '#FBBF24',
  blue: '#60A5FA',
  magenta: '#C084FC',
  cyan: '#22D3EE',
  white: '#E4E5E9',
  brightBlack: '#4B5563',
  brightRed: '#FCA5A5',
  brightGreen: '#6EE7B7',
  brightYellow: '#FDE68A',
  brightBlue: '#93C5FD',
  brightMagenta: '#D8B4FE',
  brightCyan: '#67E8F9',
  brightWhite: '#F9FAFB',
};

const LIGHT_THEME = {
  background: '#FFFFFF',
  foreground: '#1A1D23',
  cursor: '#1A1D23',
  cursorAccent: '#FFFFFF',
  selectionBackground: '#3B82F630',
  black: '#1A1D23',
  red: '#DC2626',
  green: '#16A34A',
  yellow: '#CA8A04',
  blue: '#2563EB',
  magenta: '#9333EA',
  cyan: '#0891B2',
  white: '#E4E5E9',
  brightBlack: '#6B7280',
  brightRed: '#EF4444',
  brightGreen: '#22C55E',
  brightYellow: '#EAB308',
  brightBlue: '#3B82F6',
  brightMagenta: '#A855F7',
  brightCyan: '#06B6D4',
  brightWhite: '#F9FAFB',
};

function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const Terminal = React.forwardRef<TerminalHandle, TerminalProps>(
  ({ title = 'Terminal', onClose, onInput, initialContent }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const onInputRef = useRef(onInput);
    const isDark = useIsDarkMode();

    // Keep onInput ref current to avoid stale closures
    useEffect(() => {
      onInputRef.current = onInput;
    }, [onInput]);

    // Initialize xterm instance
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const fitAddon = new FitAddon();
      const term = new XTerm({
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 5000,
        theme: isDark ? DARK_THEME : LIGHT_THEME,
        allowProposedApi: true,
      });

      term.loadAddon(fitAddon);
      term.open(container);

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Initial fit after rendering
      requestAnimationFrame(() => fitAddon.fit());

      if (initialContent) {
        term.write(initialContent);
      }

      // Forward user input to callback via ref for stable closure
      const inputDisposable = term.onData((data) => {
        onInputRef.current?.(data);
      });

      // Auto-fit on container resize
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => fitAddon.fit());
      });
      resizeObserver.observe(container);

      return () => {
        inputDisposable.dispose();
        resizeObserver.disconnect();
        term.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      };
      // Only run on mount/unmount; theme changes handled separately
    }, []);

    // Sync theme when dark mode changes
    useEffect(() => {
      const term = xtermRef.current;
      if (term) {
        term.options.theme = isDark ? DARK_THEME : LIGHT_THEME;
      }
    }, [isDark]);

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        xtermRef.current?.write(data);
      },
      writeLine: (data: string) => {
        xtermRef.current?.writeln(data);
      },
      clear: () => {
        xtermRef.current?.clear();
      },
      focus: () => {
        xtermRef.current?.focus();
      },
    }), []);

    return (
      <div className="flex flex-col h-full rounded-lg border dark:border-claude-darkBorder border-claude-border overflow-hidden dark:bg-claude-darkBg bg-claude-bg">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 dark:bg-claude-darkSurface bg-claude-surface border-b dark:border-claude-darkBorder border-claude-border select-none">
          <div className="flex items-center gap-2 min-w-0">
            <CommandLineIcon className="w-4 h-4 flex-shrink-0 dark:text-claude-darkSecondary text-claude-secondary" />
            <span className="text-sm font-medium truncate dark:text-claude-darkText text-claude-text">
              {title}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded hover:dark:bg-claude-darkBorder hover:bg-claude-border transition-colors"
              aria-label="Close terminal"
            >
              <XMarkIcon className="w-4 h-4 dark:text-claude-darkSecondary text-claude-secondary" />
            </button>
          )}
        </div>

        {/* Terminal container */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 p-1"
        />
      </div>
    );
  }
);

Terminal.displayName = 'Terminal';

export default Terminal;
