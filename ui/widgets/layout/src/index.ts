// chunkName must be unique among packages
export const application = {
  loadingFn: (): Promise<any> =>
    import(
      /* webpackChunkName: "layoutChunk" */
      /* webpackMode: "lazy" */
      './components'
    ),
  name: 'ui-widget-layout',
  title: 'Layout Widget',
  pluginSlotId: 'plugin-slot',
  topbarSlotId: 'topbar-slot',
  sidebarSlotId: 'sidebar-slot',
  widgetSlotId: 'widget-slot',
};
