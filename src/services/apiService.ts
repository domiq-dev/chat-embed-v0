export type Credentials = {
  agora_uid: number;
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
};

export type Session = {
  _id: string;
  // @deprecated, use credentials instead
  stream_urls?: Credentials;
  credentials: Credentials;
};

export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

export type Voice = {
  accent: string;
  description: string;
  language: string;
  preview: string;
  voice_id: string;
  name: string;
}

export type Language = {
  lang_code: string;
  lang_name: string;
  url: string;
};

export type Avatar = {
  name: string;
  from: number;
  gender: string;
  url: string;
  avatar_id: string;
  voice_id: string;
  thumbnailUrl: string;
  available: boolean;
};

export class ApiService {
  private openapiHost: string;
  private openapiToken: string;

  constructor(openapiHost: string, openapiToken: string) {
    this.openapiHost = openapiHost;
    this.openapiToken = openapiToken;
  }

  private async fetchAPI(endpoint: string, method: string, body?: object): Promise<any> {
    try {
      const response = await fetch(`${this.openapiHost}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.openapiToken}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const responseBody = await response.json();
      
      if (responseBody.code === 1000) {
        return responseBody.data;
      }

      // Fail fast - no retries
      throw new Error(responseBody.msg || `API Error: ${responseBody.code}`);
    } catch (error: any) {
      // Network errors also fail fast
      throw error;
    }
  }

  public async createSession(data: {
    avatar_id: string;
    duration: number;
    voice_id?: string;
  }): Promise<Session> {
    return this.fetchAPI("/api/open/v4/liveAvatar/session/create", "POST", data);
  }

  public async closeSession(id: string) {
    // Add timeout to prevent hanging on server issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${this.openapiHost}/api/open/v4/liveAvatar/session/close`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.openapiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseBody = await response.json();
      
      if (responseBody.code === 1000) {
        return responseBody.data;
      }

      // Handle server unavailable gracefully
      if (responseBody.msg?.includes('unavailable')) {
        console.warn(`AKOOL server unavailable for session ${id}, will auto-expire`);
        return { success: true, warning: 'server_unavailable' };
      }

      throw new Error(responseBody.msg || `API Error: ${responseBody.code}`);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout and network errors gracefully
      if (error.name === 'AbortError') {
        console.warn(`Session close timeout for ${id}, will auto-expire`);
        return { success: true, warning: 'timeout' };
      }
      
      throw error;
    }
  }

  public async getLangList(): Promise<Language[]> {
    const data = await this.fetchAPI("/api/open/v3/language/list", "GET");
    return data?.lang_list;
  }

  public async getVoiceList(): Promise<Voice[]> {
    return this.fetchAPI("/api/open/v3/voice/list", "GET");
  }

  public async getAvatarList(): Promise<Avatar[]> {
    const data = await this.fetchAPI("/api/open/v4/liveAvatar/avatar/list?page=1&size=100", "GET");
    return data?.result;
  }
} 