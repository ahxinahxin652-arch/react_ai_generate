import { CameraSetup } from "../types";

// vite.config.ts 里通过 define 注入了 process.env.*，这里声明一下避免 TS 报错。
// （构建时会被 Vite 替换，不会在浏览器里真的访问 Node.js 的 process）
declare const process: { env: Record<string, string | undefined> };

const DEFAULT_AI_T8STAR_API_KEY = "";

const sanitizeApiKeyForHeader = (raw: string): string => {
  // 常见问题：复制粘贴 API Key 时夹带零宽字符、换行、不可见空格，
  // 在部分运行时（例如 iframe + Electron 渲染进程）会导致 fetch headers 抛出
  // "String contains non ISO-8859-1 code point"。
  return raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // 零宽字符 / BOM
    .replace(/[\r\n\t]/g, "") // 去掉换行与制表符
    .trim();
};

const ensureLatin1HeaderValue = (headerName: string, value: string): string => {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 255) {
      throw new Error(
        `${headerName} 含有非法字符（可能夹带零宽字符/中文/表情）。请重新复制粘贴，并确保没有换行。`
      );
    }
  }
  return value;
};

interface NanoBananaResponse {
  id: string;
  results: Array<{
    url: string;
    content: string;
  }>;
  progress: number;
  status: "running" | "succeeded" | "failed";
  failure_reason?: string;
  error?: string;
}

/**
 * Nano Banana API 服务
 * 使用第三方 API 生成电影感图像
 */
export const generateCinematicImageNano = async (
  apiKey: string | undefined | null,
  prompt: string,
  cameraSetup: CameraSetup,
  aspectRatio: string = "16:9",
  zoomPrompt: string = "",
  referenceImagesBase64?: string[] | null,
  resolution: string = "2K"
): Promise<string> => {
  try {
    // 优先使用手动提供的 API Key，否则使用环境变量
    const defaultKey =
      import.meta.env.VITE_NANO_BANANA_API_KEY ||
      process.env.NANO_BANANA_API_KEY ||
      DEFAULT_AI_T8STAR_API_KEY;

    const candidateKey = sanitizeApiKeyForHeader(apiKey || "");
    const rawKeyToUse = candidateKey ? candidateKey : sanitizeApiKeyForHeader(defaultKey);

    if (!rawKeyToUse) {
      throw new Error(
        "未配置 Nano Banana API Key：请在设置中输入，或在构建时注入 VITE_NANO_BANANA_API_KEY（或 NANO_BANANA_API_KEY）。"
      );
    }

    const keyToUse = ensureLatin1HeaderValue("API Key", rawKeyToUse);

    // 使用代理地址（开发环境）或直接 API 地址（生产环境）
    const isDev = import.meta.env.DEV;
    const apiURL = "https://ai.t8star.cn";

    console.log(
      "使用 API Key:",
      (keyToUse.length > 10 ? keyToUse.substring(0, 10) : keyToUse) + "...",
      "来源:",
      candidateKey ? "用户输入" : "环境变量/构建注入"
    );
    console.log("API 地址:", apiURL);
    console.log("环境模式:", isDev ? "开发（使用代理）" : "生产（直连）");

    if (!keyToUse) {
      throw new Error("未配置 Nano Banana API Key");
    }

    // 映射支持的宽高比
    const supportedRatios = ["auto", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"];
    let finalAspectRatio = aspectRatio;

    if (!supportedRatios.includes(aspectRatio)) {
      console.warn(`不支持的宽高比 ${aspectRatio}，使用默认值 auto`);
      finalAspectRatio = "auto";
    }

    // 根据分辨率选择模型（根据文档）
    let model = "nano-banana-2-2k"; // 默认 CL 模型

    if (resolution === "极速2k") {
      model = "gemini-3.1-flash-image-preview"; // 极速 2K 预览模型（不支持 4K）
    } else if (resolution === "2K") {
      // 2K 可以使用 nano-banana-pro-vip（支持 1K, 2K）
      model = "nano-banana-2-2k";
    } else if (resolution === "1K" && prompt.length > 200) {
      // 1K 且提示词较长时使用 pro 模型
      model = "nano-banana-2-1k";
    }

    console.log("选择模型:", model, "分辨率:", resolution);

    // 处理提示词：如果用户只提交图片没有输入文字，使用默认提示词
    const finalPrompt = prompt.trim() || "不改变图片内人物的动作和服装,只改变相机参数。";

    // 增强提示词
    let resPrompt = "标准高清清晰度。";
    if (resolution === "2K") {
      resPrompt = "高分辨率。2K 数字电影质量。细节清晰。";
    } else if (resolution === "极速2k") {
      resPrompt = "高分辨率。2K 数字电影质量。细节清晰。快速生成，高效预览。";
    }

    const enhancedPrompt = `
      电影感照片生成。
      质量：${resPrompt}

      ${cameraSetup.angle && cameraSetup.angle.id !== 'none' ? `
      ------------------------------------------------------------------
      >>> 最高优先级：视角变换指令 <<<
      以下视角变换指令优先级最高，必须严格执行，优先于其他一切相机参数：

      ${cameraSetup.angle.promptContext}

      请严格按照上述视角指令生成图片，不得忽略。
      ------------------------------------------------------------------
      ` : ''}

      场景描述：
      ${finalPrompt}

      ------------------------------------------------------------------
      光学物理配置：

      1. [镜头与透视]
      - 焦距：${cameraSetup.focalLength.value}
      - 镜头特性：${cameraSetup.focalLength.promptContext}
      - 拍摄距离：${zoomPrompt}

      2. [光圈与景深]
      - 光圈：${cameraSetup.aperture.value}
      - 效果：${cameraSetup.aperture.promptContext}

      3. [胶片与色彩]
      - 传感器/机身：${cameraSetup.body.name}（${cameraSetup.body.promptContext}）
      - 风格：${cameraSetup.filter.name}（${cameraSetup.filter.promptContext}）

      ------------------------------------------------------------------
      执行标准：
      - 3D 景深：强烈的体积光。主体与背景分离。
      - 纹理：超写实皮肤（毛孔、绒毛）、织物编织和材料瑕疵。
      - 构图：严格遵循请求的宽高比（${finalAspectRatio}）。
    `;

    // 准备请求数据（使用流式响应，不设置 webHook）
    const requestData: any = {
      model: model,
      prompt: enhancedPrompt,
      aspectRatio: finalAspectRatio,
      imageSize: resolution,
      response_format: "url",
      // 不设置 webHook，使用默认的流式响应
      shutProgress: false, // 不关闭进度回复
    };

    // 添加参考图片（如果有）
    const hasReferenceImages = Array.isArray(referenceImagesBase64) && referenceImagesBase64.length > 0;
    if (hasReferenceImages) {
      const focalVal = parseInt(cameraSetup.focalLength.value);
      let framingOverride = "根据新镜头特性自然调整构图。";

      if (focalVal <= 24) {
        framingOverride = `
          动作：缩小 / 拉远（广角）。
          - 相机物理后移。
          - 显著增加视野。
          - 如果输入是局部镜头，必须生成缺失的下身。
          - 展示更多环境。
        `;
      } else if (focalVal >= 85) {
        let zoomLevel = "特写";
        let cropInstruction = "裁剪至头部和肩膀。";

        if (focalVal >= 135) {
          zoomLevel = "紧致头像";
          cropInstruction = "紧密裁剪至仅面部。";
        }
        if (focalVal >= 200) {
          zoomLevel = "微距 / 超特写";
          cropInstruction = "极端裁剪。仅展示特定特征（眼睛、嘴唇、物体细节）。丢弃其余部分。";
        }

        framingOverride = `
          动作：放大（焦距：${focalVal}mm - ${zoomLevel}）。
          - ${cropInstruction}
          - 相机显著靠近。
          - 强烈背景压缩（虚化）。
        `;
      }

      const reframeInstruction = `
        关键图像重新生成指令：
        您正在担任摄影指导，使用新镜头重新拍摄此场景。
        1. 参考用途：仅将输入图像用于角色身份和照明参考。
        2. 必须的构图调整：
           ${framingOverride}
      `;

      requestData.image = referenceImagesBase64;
      requestData.prompt = enhancedPrompt + reframeInstruction;
    }

    // 发送 API 请求
    const requestURL = `${apiURL}/v1/images/generations`;
    console.log("发送 API 请求到:", requestURL);
    console.log("请求数据:", JSON.stringify({
      ...requestData,
      image: requestData.image ? ["<图片数据已省略>"] : undefined
    }, null, 2));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 只在非开发环境（直连）时添加 Authorization 头
    if (keyToUse) {
      headers["Authorization"] = ensureLatin1HeaderValue("Authorization", `Bearer ${keyToUse}`);
    }

    const response = await fetch(requestURL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    console.log("API 响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 错误响应:", errorText);
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    // 读取流式响应（SSE格式）
    const responseText = await response.text();
    console.log("原始响应:", responseText);

    // 有些情况下服务端会返回普通 JSON（例如 apikey error），但 HTTP 状态仍是 200。
    // 这里优先识别并抛出更明确的错误。
    const trimmed = responseText.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const maybeJson = JSON.parse(trimmed);
        console.log("检测到 JSON 响应:", maybeJson);
        if (maybeJson && typeof maybeJson === "object") {
          const data = (maybeJson as any).data;
          const resultUrl =
            data?.[0]?.url ||
            (maybeJson as any)?.results?.[0]?.url ||
            (maybeJson as any)?.url;

          if (resultUrl) {
            return resultUrl;
          }

          const apiErrorMessage =
            (maybeJson as any)?.error ||
            (maybeJson as any)?.message ||
            (maybeJson as any)?.failure_reason;

          if (apiErrorMessage) {
            throw new Error(String(apiErrorMessage));
          }
        }
      } catch (e: any) {
        if (e instanceof Error && e.message) {
          throw e;
        }
        // 不是标准 JSON 或不是错误结构则继续按 SSE 解析
      }
    }
    throw new Error("未收到有效响应");
    // 解析SSE格式（每行以 "data: " 开头）
    // const lines = responseText.split('\n').filter(line => line.trim().startsWith('data:'));
    // let finalData: any = null;

    // for (const line of lines) {
    //   const jsonStr = line.replace(/^data:\s*/, '').trim();
    //   if (jsonStr) {
    //     try {
    //       const data = JSON.parse(jsonStr);
    //       finalData = data;
    //       console.log("解析进度:", data.status, data.progress + "%");

    //       // 如果任务成功，结束循环
    //       if (data.status === 'succeeded') {
    //         break;
    //       }

    //       // 如果任务失败，抛出错误
    //       if (data.status === 'failed') {
    //         throw new Error(`图像生成失败: ${data.failure_reason || data.error || "未知错误"}`);
    //       }
    //     } catch (e) {
    //       // JSON解析错误，可能是空行或其他格式
    //       if (jsonStr.length > 10) {
    //         console.error("解析失败:", jsonStr, e);
    //       }
    //     }
    //   }
    // }

    // if (!finalData) {
    //   throw new Error("未收到有效响应");
    // }

    // console.log("最终响应数据:", JSON.stringify(finalData, null, 2));

    // // 处理成功的响应
    // if (finalData.status === "succeeded") {
    //   if (finalData.results && finalData.results.length > 0) {
    //     console.log("✅ 成功生成图片，URL:", finalData.results[0].url);
    //     return finalData.results[0].url;
    //   }
    //   console.error("任务完成但没有图片数据，完整响应:", finalData);
    //   throw new Error("任务完成但没有图片数据");
    // }

    // console.error("未知的响应状态:", finalData);
    // throw new Error("未知的响应状态");
  } catch (error: any) {
    console.error("Nano Banana API 错误:", error);
    throw new Error(error.message || error.toString());
  }
};
