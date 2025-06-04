export interface DomIQChatConfig {
  propertyId: string | null;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
}

export interface DomIQChatAPI {
  q: Array<[string, ...any[]]>;
  config: DomIQChatConfig;
  init(config: Partial<DomIQChatConfig>): void;
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export interface DomIQChatMessage {
  type: 'domiq-widget-height' | 'domiq-widget-open' | 'domiq-widget-close' | 'domiq-widget-command';
  height?: number;
  command?: string;
}

declare global {
  interface Window {
    domIQChat?: DomIQChatAPI;
  }
}
