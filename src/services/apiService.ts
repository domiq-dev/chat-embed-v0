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
  private maxRetries: number = 5; // Maximum number of retry attempts

  constructor(openapiHost: string, openapiToken: string) {
    this.openapiHost = openapiHost;
    this.openapiToken = openapiToken;
  }

  private async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(endpoint: string, method: string, body?: object, attempt: number = 0): Promise<any> {
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

      // If avatar is busy (specific error code) and we haven't exceeded max retries
      if (attempt < this.maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`AKOOL API Error (attempt ${attempt + 1}/${this.maxRetries}): ${responseBody.msg}`);
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        
        await this.wait(waitTime);
        return this.fetchWithRetry(endpoint, method, body, attempt + 1);
      }

      // If we've exhausted all retries or it's a different error, throw
      throw new Error(responseBody.msg);
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Network error (attempt ${attempt + 1}/${this.maxRetries}): ${error.message}`);
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        
        await this.wait(waitTime);
        return this.fetchWithRetry(endpoint, method, body, attempt + 1);
      }
      throw error;
    }
  }

  public async createSession(data: {
    avatar_id: string;
    duration: number;
    voice_id?: string;
  }): Promise<Session> {
    return this.fetchWithRetry("/api/open/v4/liveAvatar/session/create", "POST", data);
  }

  public async closeSession(id: string) {
    return this.fetchWithRetry("/api/open/v4/liveAvatar/session/close", "POST", {
      id,
    });
  }

  public async getLangList(): Promise<Language[]> {
    const data = await this.fetchWithRetry("/api/open/v3/language/list", "GET");
    return data?.lang_list;
  }

  public async getVoiceList(): Promise<Voice[]> {
    return this.fetchWithRetry("/api/open/v3/voice/list", "GET");
  }

  public async getAvatarList(): Promise<Avatar[]> {
    const data = await this.fetchWithRetry("/api/open/v4/liveAvatar/avatar/list?page=1&size=100", "GET");
    return data?.result;
  }
} 