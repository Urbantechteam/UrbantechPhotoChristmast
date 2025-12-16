export interface ProcessedImage {
  data: string; // Base64 string
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PresetPrompt {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
}