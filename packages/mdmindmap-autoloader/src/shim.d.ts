declare interface Window {
  markmap: typeof import('mdmindmap-lib') &
    typeof import('mdmindmap-view') &
    typeof import('mdmindmap-toolbar') & {
      autoLoader?: Partial<import('.').AutoLoaderOptions>;
    };
}
