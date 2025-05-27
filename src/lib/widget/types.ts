export interface DomIQChatConfig {
  propertyId: string | null;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
}

export interface DomIQChatAPI {
  q: Array<[string, ...any[]]>;
  config: DomIQChatConfig;
  init(config: Partial<DomIQChatConfig>): void;
}

export interface DomIQChatMessage {
  type: 'domiq-widget-height';
  height: number;
}

declare global {
  interface Window {
    domIQChat: DomIQChatAPI;
  }
} 