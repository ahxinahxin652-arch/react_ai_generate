import { CameraSetup } from "../types";

/**
 * 通道2云 VOD 大模型生图服务
 * API 文档: https://cloud.baidu.com/doc/VOD/s/Zmj5q4qb3
 */

// ==================== 默认配置 ====================
// ⚠️ 警告：请勿将此文件提交到公共代码仓库
const DEFAULT_BAIDU_AK = "";  // 通过授权接口下发
const DEFAULT_BAIDU_SK = "";  // 通过授权接口下发
// =================================================

/**
 * 使用 Web Crypto API 计算 HMAC-SHA256
 * 如果 crypto.subtle 不可用（如 Electron iframe），则抛出友好的错误提示
 */
const hmacSha256 = async (key: string, message: string): Promise<string> => {
  // 检查 crypto.subtle 是否可用
  if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
    throw new Error(
      '通道2 VOD 通道需要 Web Crypto API (crypto.subtle)，但当前环境不支持。\n' +
      '可能的原因：\n' +
      '1. 页面未通过 HTTPS 或 localhost 访问\n' +
      '2. 在受限的 iframe 环境中运行\n' +
      '3. Electron 渲染进程配置问题\n\n' +
      '解决方案：\n' +
      '- 如果在 Electron 中，请在 webPreferences 中启用 contextIsolation: false 和 nodeIntegration: true\n' +
      '- 或者使用通道1（ai.t8star.cn）进行图片生成'
    );
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  // 转换为十六进制字符串
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

interface BaiduVODConfig {
  ak: string;
  sk: string;
  host?: string;
}

interface BaiduVODImageRequest {
  model: string;
  messages: Array<{
    role: string;
    content: Array<{
      type: string;
      text?: string;
      image_item?: {
        image_url: string;
      };
    }>;
  }>;
  n?: number;
  size?: string;
  quality?: string;
}

interface TaskResponse {
  taskId: string;
}

interface TaskStatusResponse {
  status: string;
  videoGenerateTaskInfo?: {
    videoGenerateTaskOutput?: {
      mediaBasicInfos?: Array<{
        source?: {
          sourceUrl: string;
        };
      }>;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 与 Python test_baidu_api.py 的 normalize() 等价
 */
const bceNormalize = (s: string): string => {
  const result = encodeURIComponent(s);
  return result
    .replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
};

/**
 * 生成 BCE 认证签名
 * contentType: POST 请求时传入，会加入签名（与 Python 脚本一致）
 */
const generateBCEAuthorization = async (
  ak: string,
  sk: string,
  method: string,
  uri: string,
  host: string,
  timestamp: string,
  contentType?: string
): Promise<string> => {
  const period = "1800";
  const authStringPrefix = `bce-auth-v1/${ak}/${timestamp}/${period}`;

  // 生成 SigningKey
  const signingKey = await hmacSha256(sk, authStringPrefix);

  // 规范化 Headers（POST 时包含 content-type，与 Python 脚本保持一致）
  const headersToSign: Record<string, string> = {
    host: host,
    "x-bce-date": timestamp,
  };
  if (method.toUpperCase() === 'POST' && contentType) {
    headersToSign['content-type'] = contentType;
  }

  const sortedKeys = Object.keys(headersToSign).sort();
  const signedHeaders = sortedKeys.join(";");
  const canonicalHeaders = sortedKeys
    .map(k => `${bceNormalize(k)}:${bceNormalize(headersToSign[k].trim())}`)
    .join("\n");

  // 构建 CanonicalRequest
  const canonicalUri = encodeURI(uri).replace(/%2F/g, "/");
  const canonicalRequest = `${method.toUpperCase()}\n${canonicalUri}\n\n${canonicalHeaders}`;

  // 生成签名
  const signature = await hmacSha256(signingKey, canonicalRequest);

  return `${authStringPrefix}/${signedHeaders}/${signature}`;
};

/**
 * 上传单张图片（data: URI）到通道2 VOD，返回 sourceUrl
 * 完整四步流程：申请上传 → PUT 文件 → 完成上传 → 查询媒资
 */
const uploadMediaToBaidu = async (
  config: BaiduVODConfig,
  dataUrl: string
): Promise<string> => {
  const host = config.host || 'vod.bj.baidubce.com';
  const reqId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 解析 data URI
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.+?);/)![1];          // e.g. image/png
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);

  const name = `ref_${Date.now()}`;

  // ── Step 1: 申请上传会话 ──
  let ts = getBCETimestamp();
  let auth = await generateBCEAuthorization(config.ak, config.sk, 'POST', '/v2/medias/upload', host, ts, 'application/json');
  const applyResp = await fetch(`https://${host}/v2/medias/upload`, {
    method: 'POST',
    headers: {
      Host: host,
      'Content-Type': 'application/json',
      'x-bce-date': ts,
      'x-bce-request-id': reqId(),
      Authorization: auth,
    },
    body: JSON.stringify({ name, container: ext, isMultipartUpload: false }),
  });
  if (!applyResp.ok) {
    const t = await applyResp.text();
    throw new Error(`通道2申请上传失败 (${applyResp.status}): ${t}`);
  }
  const { sessionKey, urls } = await applyResp.json();
  const uploadUrl: string = urls[0];

  // ── Step 2: PUT 文件（预签名 URL，无需 BCE 签名）──
  const putResp = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mime },
    body: u8,
  });
  if (putResp.status !== 200 && putResp.status !== 201 && putResp.status !== 204) {
    throw new Error(`通道2文件上传失败 (${putResp.status})`);
  }

  // ── Step 3: 完成上传，获取 mediaId ──
  ts = getBCETimestamp();
  auth = await generateBCEAuthorization(config.ak, config.sk, 'POST', '/v2/medias/complete_upload', host, ts, 'application/json');
  const completeResp = await fetch(`https://${host}/v2/medias/complete_upload`, {
    method: 'POST',
    headers: {
      Host: host,
      'Content-Type': 'application/json',
      'x-bce-date': ts,
      'x-bce-request-id': reqId(),
      Authorization: auth,
    },
    body: JSON.stringify({ sessionKey }),
  });
  if (!completeResp.ok) {
    const t = await completeResp.text();
    throw new Error(`通道2完成上传失败 (${completeResp.status}): ${t}`);
  }
  const { mediaId } = await completeResp.json();

  // ── Step 4: 查询媒资，获取 sourceUrl ──
  ts = getBCETimestamp();
  auth = await generateBCEAuthorization(config.ak, config.sk, 'GET', `/v2/medias/${mediaId}`, host, ts);
  const mediaResp = await fetch(`https://${host}/v2/medias/${mediaId}`, {
    method: 'GET',
    headers: {
      Host: host,
      'x-bce-date': ts,
      'x-bce-request-id': reqId(),
      Authorization: auth,
    },
  });
  if (!mediaResp.ok) {
    const t = await mediaResp.text();
    throw new Error(`通道2查询媒资失败 (${mediaResp.status}): ${t}`);
  }
  const detail = await mediaResp.json();
  const sourceUrl: string = detail?.source?.sourceUrl || detail?.sourceUrl;
  if (!sourceUrl) throw new Error('通道2媒资未返回 sourceUrl');
  return sourceUrl;
};

/**
 * 生成 UTC 时间戳（BCE 格式）
 */
const getBCETimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/\.\d{3}Z$/, "Z");
};

/**
 * 生成唯一的请求 ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建图片生成任务
 */
const createImageTask = async (
  config: BaiduVODConfig,
  requestData: BaiduVODImageRequest
): Promise<string> => {
  const host = config.host || "vod.bj.baidubce.com";
  const uri = "/v2/aigc/image";
  const timestamp = getBCETimestamp();
  const requestId = generateRequestId();

  const authorization = await generateBCEAuthorization(
    config.ak,
    config.sk,
    "POST",
    uri,
    host,
    timestamp,
    "application/json"
  );

  const headers = {
    Host: host,
    "Content-Type": "application/json",
    "x-bce-request-id": requestId,
    "x-bce-date": timestamp,
    Authorization: authorization,
  };

  const url = `https://${host}${uri}`;

  console.log("通道2 VOD API 请求:", url);
  console.log("请求头:", headers);
  console.log("请求体:", JSON.stringify(requestData, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("通道2 VOD API 错误:", response.status, errorText);
    throw new Error(`通道2 VOD API 请求失败 (${response.status}): ${errorText}`);
  }

  const result: TaskResponse = await response.json();
  console.log("任务创建成功:", result);
  return result.taskId;
};

/**
 * 查询任务状态
 * API端点: GET /v2/tasks/{taskId}
 */
const queryTaskStatus = async (
  config: BaiduVODConfig,
  taskId: string
): Promise<TaskStatusResponse> => {
  const host = config.host || "vod.bj.baidubce.com";
  const uri = `/v2/tasks/${taskId}`; // 正确的端点
  const timestamp = getBCETimestamp();
  const requestId = generateRequestId();

  const authorization = await generateBCEAuthorization(
    config.ak,
    config.sk,
    "GET",
    uri,
    host,
    timestamp
  );

  const headers = {
    Host: host,
    "x-bce-request-id": requestId,
    "x-bce-date": timestamp,
    Authorization: authorization,
  };

  const url = `https://${host}${uri}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`查询任务状态失败 (${response.status}): ${errorText}`);
  }

  return await response.json();
};

/**
 * 轮询等待任务完成
 */
const waitForTaskCompletion = async (
  config: BaiduVODConfig,
  taskId: string,
  maxWaitTime: number = 180000, // 默认3分钟
  pollInterval: number = 5000 // 每5秒查询一次
): Promise<string> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await queryTaskStatus(config, taskId);

    console.log("任务状态:", status.status);

    if (status.status === "SUCCESS") {
      // 从响应中提取图片URL
      const imageUrl = status.videoGenerateTaskInfo?.videoGenerateTaskOutput?.mediaBasicInfos?.[0]?.source?.sourceUrl;
      if (imageUrl) {
        return imageUrl;
      }
      throw new Error("任务完成但未返回图片URL");
    }

    if (status.status === "FAILED" || status.status === "CANCELLED") {
      const errorMsg = status.error?.message || "未知错误";
      throw new Error(`任务失败: ${errorMsg}`);
    }

    // 等待后继续轮询
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("任务超时：等待时间超过限制");
};

/**
 * 通道2 VOD 图片生成主函数
 */
export const generateImageBaiduVOD = async (
  ak: string,
  sk: string,
  prompt: string,
  cameraSetup: CameraSetup,
  aspectRatio: string = "16:9",
  zoomPrompt: string = "",
  referenceImagesBase64?: string[] | null,
  resolution: string = "2K"
): Promise<string> => {
  try {
    // 使用传入的参数，如果未提供则使用默认配置
    const finalAK = ak?.trim() || DEFAULT_BAIDU_AK;
    const finalSK = sk?.trim() || DEFAULT_BAIDU_SK;

    if (!finalAK || !finalSK || finalAK === "your_access_key_here" || finalSK === "your_secret_key_here") {
      throw new Error("未配置通道2云 AK/SK，请在 baiduVODService.ts 中设置 DEFAULT_BAIDU_AK 和 DEFAULT_BAIDU_SK");
    }

    const config: BaiduVODConfig = {
      ak: finalAK,
      sk: finalSK,
      host: "vod.bj.baidubce.com",
    };

    // 映射分辨率
    let quality = "2K";
    if (resolution === "2K") {
      quality = "2K";
    } else if (resolution === "4K") {
      quality = "2K";
    }

    // 映射宽高比
    const supportedRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];
    let finalSize = aspectRatio;
    if (!supportedRatios.includes(aspectRatio)) {
      console.warn(`不支持的宽高比 ${aspectRatio}，使用默认值 16:9`);
      finalSize = "16:9";
    }

    // 选择模型（NBP 支持图生图和高分辨率）
    const model = "NBP";

    // 构建增强提示词
    let resPrompt = "标准高清清晰度。";
    if (resolution === "2K") {
      resPrompt = "高分辨率。2K 数字电影质量。细节清晰。";
    } else if (resolution === "4K") {
      resPrompt = "超高清晰度。4K 纹理。超细节。完美质量。";
    }

    const finalPrompt = prompt.trim() || "高质量电影感照片";

    const enhancedPrompt = `
电影感照片生成。
质量：${resPrompt}

${cameraSetup.angle && cameraSetup.angle.id !== 'none' ? `
>>> 视角变换指令 <<<
${cameraSetup.angle.promptContext}
` : ''}

场景描述：
${finalPrompt}

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

执行标准：
- 3D 景深：强烈的体积光。主体与背景分离。
- 纹理：超写实皮肤（毛孔、绒毛）、织物编织和材料瑕疵。
- 构图：严格遵循请求的宽高比（${finalSize}）。
    `.trim();

    // 构建消息内容
    const messageContent: Array<{ type: string; text?: string; image_item?: { image_url: string } }> = [
      { type: "text", text: enhancedPrompt },
    ];

    // 添加参考图片（如果有）
    // data: URI 先上传到通道2 VOD 获取 sourceUrl，HTTP URL 直接使用
    const hasReferenceImages = Array.isArray(referenceImagesBase64) && referenceImagesBase64.length > 0;
    if (hasReferenceImages) {
      const imagesToUse = referenceImagesBase64!.slice(0, 14);
      const resolvedUrls: string[] = [];

      for (const imageData of imagesToUse) {
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
          // 已经是 HTTP URL，直接使用
          resolvedUrls.push(imageData);
        } else if (imageData.startsWith('data:')) {
          // data: URI，上传到通道2 VOD 获取 sourceUrl
          console.log('上传参考图到通道2 VOD...');
          const sourceUrl = await uploadMediaToBaidu(config, imageData);
          console.log('参考图上传成功:', sourceUrl);
          resolvedUrls.push(sourceUrl);
        }
      }

      resolvedUrls.forEach((url) => {
        messageContent.push({
          type: "image_url",
          image_item: { image_url: url },
        });
      });
    }

    // 构建请求数据
    const requestData: BaiduVODImageRequest = {
      model,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      n: 1,
      size: finalSize,
      quality,
    };

    // 创建任务
    console.log("开始创建通道2 VOD 图片生成任务...");
    const taskId = await createImageTask(config, requestData);

    // 等待任务完成（最多3分钟）
    console.log("等待任务完成，任务ID:", taskId);
    const imageUrl = await waitForTaskCompletion(config, taskId, 180000);

    console.log("✅ 通道2 VOD 图片生成成功:", imageUrl);
    return imageUrl;
  } catch (error: any) {
    console.error("通道2 VOD 图片生成错误:", error);
    throw new Error(`通道2 VOD 通道失败: ${error.message || error.toString()}`);
  }
};
