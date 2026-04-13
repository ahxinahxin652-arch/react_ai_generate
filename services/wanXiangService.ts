import { CameraSetup } from "../types";

const sanitizeApiKey = (raw: string): string => {
    return raw.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[\r\n\t]/g, "").trim();
};

/**
 * 阿里云万相 (WanXiang) API 服务
 * 使用 wan2.7-image-pro 模型
 */
export const generateImageWanXiang = async (
    apiKey: string | undefined | null,
    prompt: string,
    cameraSetup: CameraSetup,
    aspectRatio: string = "16:9",
    zoomPrompt: string = "",
    referenceImagesBase64?: string[] | null,
    resolution: string = "2K"
): Promise<string> => {
    try {
        const rawKey = sanitizeApiKey(apiKey || "");
        if (!rawKey) {
            throw new Error("未配置阿里云 API Key，请在设置中输入。");
        }

        // 1. 组装增强提示词
        const finalPrompt = prompt.trim() || "不改变图片内人物的动作和服装,只改变相机参数。";
        let resPrompt = resolution === "2K" ? "高分辨率。2K 数字电影质量。细节清晰。" : "标准高清清晰度。";

        const enhancedPrompt = `
      电影感照片生成。
      质量：${resPrompt}
      ${cameraSetup.angle && cameraSetup.angle.id !== 'none' ? `
      >>> 最高优先级：视角变换指令 <<<
      ${cameraSetup.angle.promptContext}
      ` : ''}
      场景描述：${finalPrompt}
      光学物理配置：
      1. [镜头与透视] 焦距：${cameraSetup.focalLength.value}，特性：${cameraSetup.focalLength.promptContext}，距离：${zoomPrompt}
      2. [光圈与景深] 光圈：${cameraSetup.aperture.value}，效果：${cameraSetup.aperture.promptContext}
      3. [胶片与色彩] 机身：${cameraSetup.body.name}，风格：${cameraSetup.filter.name}
      执行标准：主体与背景分离，超写实纹理，构图严格遵循宽高比 ${aspectRatio}。
    `;

        // 2. 准备构图调整指令 (针对参考图)
        let reframeInstruction = "";
        if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
            const focalVal = parseInt(cameraSetup.focalLength.value);
            let framingOverride = "根据新镜头特性自然调整构图。";
            if (focalVal <= 24) {
                framingOverride = "动作：缩小/拉远（广角）。展示更多环境，补全缺失部位。";
            } else if (focalVal >= 85) {
                framingOverride = "动作：放大/特写。背景强烈虚化。";
            }
            reframeInstruction = `\n关键图像重绘指令：作为摄影指导，仅参考图中的角色身份，根据以下要求调整构图：${framingOverride}`;
        }

        // 3. 构造阿里云 DashScope 请求体
        const messagesContent: any[] = [];

        // 添加参考图
        if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
            referenceImagesBase64.forEach(base64 => {
                messagesContent.push({ "image": base64 });
            });
        }

        // 添加文本内容
        messagesContent.push({ "text": enhancedPrompt + reframeInstruction });

        const requestBody = {
            model: "wan2.7-image-pro",
            input: {
                messages: [
                    {
                        role: "user",
                        content: messagesContent
                    }
                ]
            },
            parameters: {
                size: resolution === "2K" ? "2K" : "1024*1024", // 简单映射
                n: 1,
                watermark: false
            }
        };

        // 4. 发送请求 (新增代理判断逻辑)
        // 使用 Vite 注入的环境变量判断是否为本地开发环境
        const isDev = import.meta.env.DEV;

        // 核心修改：如果是开发环境，使用配置好的本地代理前缀；如果是生产环境，直连（假设生产环境已解决跨域）
        const fetchUrl = isDev
            ? "/dashscope-api/api/v1/services/aigc/multimodal-generation/generation"
            : "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${rawKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`万相服务错误: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        const imageUrl = result.output?.choices?.[0]?.message?.content?.[0]?.image;

        if (!imageUrl) {
            throw new Error("万相服务未返回图片地址");
        }

        return imageUrl;

    } catch (error: any) {
        console.error("WanXiang Service Error:", error);
        throw error;
    }
};