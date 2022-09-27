import { TolgeePlugin } from '@tolgee/core';

export declare class UI {
  private dependencies;
  private viewerComponent;
  private keyContextMenu;
  constructor(dependencies: any[]);
  renderViewer(key: string, defaultValue?: string): void;
  getKey(props: { openEvent: MouseEvent; keys: Set<string> }): Promise<string>;
}

export declare const DevTools = TolgeePlugin;

export * from '../lib/typedIndex';
