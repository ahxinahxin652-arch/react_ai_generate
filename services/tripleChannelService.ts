import { CameraSetup } from "../types";
import { generateCinematicImageNano } from "./nanoBananaService";
import { generateImageBaiduVOD } from "./baiduVODService";
import { generateImageWanXiang } from "./wanXiangService";

/**
 * 多通道图片生成服务
 * 通道1: 阿里云万相 (WanXiang)
 * 通道2: ai.t8star.cn (NanoBanana)
 * 通道3: 百度云 VOD
 * * 策略：
 * 1. 优先使用通道1（万相），超时时间3分钟
 * 2. 如果通道1失败或超时，自动切换到通道2（NanoBanana）
 * 3. 如果通道2失败或超时，自动切换到通道3（百度VOD）
 * 4. 如果三个通道都失败，返回失败信息
 */

/**
 * 带超时的 Promise 包装器
 */
const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = "操作超时"
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
};

interface GenerateImageOptions {
  // 通道1 (万相) 配置
  aliyunApiKey?: string;

  // 通道2 (NanoBanana) 配置
  nanoBananaApiKey?: string | null;

  // 通道3 (百度 VOD) 配置
  baiduAK?: string;
  baiduSK?: string;

  // 通用参数
  prompt: string;
  cameraSetup: CameraSetup;
  aspectRatio?: string;
  zoomPrompt?: string;
  referenceImagesBase64?: string[] | null;
  resolution?: string;

  // 超时配置（毫秒）
  channel1Timeout?: number; // 通道1超时时间，默认3分钟
  channel2Timeout?: number; // 通道2超时时间，默认3分钟
  channel3Timeout?: number; // 通道3超时时间，默认3分钟

  // 回调函数
  onChannelSwitch?: (fromChannel: number, reason: string) => void;
}

export interface DualChannelResult {
  success: boolean;
  imageUrl?: string;
  channelUsed?: 1 | 2 | 3;
  error?: string;
  channel1Error?: string;
  channel2Error?: string;
  channel3Error?: string;
}

/**
 * 多通道图片生成主函数
 */
export const generateImageDualChannel = async (
    options: GenerateImageOptions
): Promise<DualChannelResult> => {
  const {
    nanoBananaApiKey,
    baiduAK,
    baiduSK,
    aliyunApiKey,
    prompt,
    cameraSetup,
    aspectRatio = "16:9",
    zoomPrompt = "",
    referenceImagesBase64,
    resolution = "2K",
    channel1Timeout = 180000, // 默认3分钟
    channel2Timeout = 180000, // 默认3分钟
    channel3Timeout = 180000, // 默认3分钟
    onChannelSwitch,
  } = options;

  let channel1Error: string | null = null;
  let channel2Error: string | null = null;
  let channel3Error: string | null = null;

  // ========== 通道1: 阿里云万相 ==========
  console.log("🚀 开始尝试通道1（阿里云万相）...");
  try {
    const imageUrl = await withTimeout(
        generateImageWanXiang(
            aliyunApiKey,
            prompt,
            cameraSetup,
            aspectRatio,
            zoomPrompt,
            referenceImagesBase64,
            resolution
        ),
        channel1Timeout,
        "通道1请求超时（超过3分钟）"
    );

    console.log("✅ 通道1成功生成图片");
    return {
      success: true,
      imageUrl,
      channelUsed: 1,
    };
  } catch (error: any) {
    channel1Error = error.message || error.toString();
    console.error("❌ 通道1失败:", channel1Error);

    // 通知通道切换
    if (onChannelSwitch) {
      onChannelSwitch(1, channel1Error);
    }
  }

  // ========== 通道2: NanoBanana (ai.t8star.cn) ==========
  console.log("🔄 切换到通道2（ai.t8star.cn）...");
  try {
    const imageUrl = await withTimeout(
        generateCinematicImageNano(
            nanoBananaApiKey,
            prompt,
            cameraSetup,
            aspectRatio,
            zoomPrompt,
            referenceImagesBase64,
            resolution
        ),
        channel2Timeout,
        "通道2请求超时（超过3分钟）"
    );

    console.log("✅ 通道2成功生成图片");
    return {
      success: true,
      imageUrl,
      channelUsed: 2,
    };
  } catch (error: any) {
    channel2Error = error.message || error.toString();
    console.error("❌ 通道2失败:", channel2Error);

    // 通知通道切换
    if (onChannelSwitch) {
      onChannelSwitch(2, channel2Error);
    }
  }

  // ========== 通道3: 百度 VOD ==========
  console.log("🔄 尝试通道3 (百度云 VOD)...");

  // 检查当前环境是否支持 Web Crypto API（百度VOD需要）
  if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
    channel3Error = "当前环境不支持 Web Crypto API，无法使用百度 VOD 通道";
    console.error("❌ 通道3无法启动:", channel3Error);

    // 通知通道切换 (虽然这里已经是最后一个通道，但为了保持日志一致性仍然触发)
    if (onChannelSwitch) {
      onChannelSwitch(3, channel3Error);
    }
  } else {
    try {
      const imageUrl = await withTimeout(
          generateImageBaiduVOD(
              baiduAK || "",
              baiduSK || "",
              prompt,
              cameraSetup,
              aspectRatio,
              zoomPrompt,
              referenceImagesBase64,
              resolution
          ),
          channel3Timeout,
          "通道3请求超时（超过3分钟）"
      );

      console.log("✅ 通道3成功生成图片");
      return {
        success: true,
        imageUrl,
        channelUsed: 3,
      };
    } catch (error: any) {
      channel3Error = error.message || error.toString();
      console.error("❌ 通道3失败:", channel3Error);
    }
  }

  // ========== 三个通道都失败 ==========
  console.error("💥 通道1、2、3均已生成失败");
  return {
    success: false,
    error: "通道1、2、3均已生成失败",
    channel1Error: channel1Error || undefined,
    channel2Error: channel2Error || undefined,
    channel3Error: channel3Error || undefined,
  };
};