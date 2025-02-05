declare interface Window {
  mm: import('mdmindmap-view').Markmap;
  markmap: typeof import('mdmindmap-toolbar') &
    typeof import('mdmindmap-view') & {
      cliOptions?: unknown;
    };
}
