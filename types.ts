export interface CameraBody {
  id: string;
  name: string;
  description: string;
  promptContext: string;
  imageUrl?: string;
}

export interface FocalLengthConfig {
  id: string;
  value: string;
  name: string;
  description: string;
  promptContext: string;
}

export interface ApertureConfig {
  id: string;
  value: string;
  name: string;
  description: string;
  promptContext: string;
}

export interface CameraFilter {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  promptContext: string;
}

export interface CameraAngle {
  id: string;
  name: string;
  description: string;
  promptContext: string;
}

export interface CameraSetup {
  body: CameraBody;
  focalLength: FocalLengthConfig;
  aperture: ApertureConfig;
  filter: CameraFilter;
  angle: CameraAngle;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9"
}

export interface GenerationState {
  isLoading: boolean;
  resultUrl: string | null;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  cameraSetup: CameraSetup;
  aspectRatio: string;
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  cameraSetup: CameraSetup;
  aspectRatio: string;
  resolution: string;
  timestamp: number;
  isLoading?: boolean; // 是否正在加载中
  isError?: boolean; // 是否生成失败
  errorMessage?: string; // 失败原因
}
