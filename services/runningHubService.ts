import { CameraSetup } from "../types";

/**
 * RunningHub 图像生成服务（占位实现）
 * 
 * 此文件为占位模块，提供与其他服务相同的接口签名。
 * 当 RunningHub 后端可用时，请替换为实际的 API 调用逻辑。
 */
export const generateCinematicImageRunningHub = async (
    apiKey: string | undefined | null,
    prompt: string,
    cameraSetup: CameraSetup,
    aspectRatio: string = "16:9",
    zoomPrompt: string = "",
    referenceImagesBase64?: string[] | null,
    resolution: string = "2K"
): Promise<string> => {
    throw new Error(
        "RunningHub 服务尚未配置。请选择其他 API 提供商（Gemini 或 Nano Banana）。"
    );
};
