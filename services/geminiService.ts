import { GoogleGenAI } from "@google/genai";
import { CameraSetup } from "../types";

export const generateCinematicImage = async (
  apiKey: string | undefined | null,
  prompt: string,
  cameraSetup: CameraSetup,
  aspectRatio: string = "16:9",
  zoomPrompt: string = "",
  referenceImagesBase64?: string[] | null,
  resolution: string = "2K"
): Promise<string> => {
  try {
    // Priority: 
    // 1. Manually provided API Key (from UI settings)
    // 2. Environment Variable (from AI Studio/Env)
    const keyToUse = apiKey || process.env.API_KEY;

    if (!keyToUse) {
      throw new Error("未配置 API Key。请点击右上角设置图标，输入您的 Pro 账号 API Key。");
    }

    // STRICT VALIDATION: Ensure aspect ratio is supported by Gemini 3
    const supportedRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    let finalAspectRatio = aspectRatio;

    if (!supportedRatios.includes(aspectRatio)) {
      console.warn(`Unsupported aspect ratio ${aspectRatio}, defaulting to 16:9`);
      finalAspectRatio = "16:9";
    }

    // Initialize with the resolved API Key
    const ai = new GoogleGenAI({ apiKey: keyToUse });

    // Enhance prompt to reinforce resolution quality
    let resPrompt = "Standard HD clarity.";
    if (resolution === "2K") {
      resPrompt = "HIGH RESOLUTION. 2K Digital Cinema quality. Sharp details.";
    } else if (resolution === "4K") {
      resPrompt = "ULTRA HIGH DEFINITION. 4K/8K Textures. Hyper-detailed. Pristine quality.";
    }

    // 处理提示词：如果用户只提交图片没有输入文字，使用默认提示词
    const finalPrompt = prompt.trim() || "不改变图片内人物的动作和服装,只改变相机参数。";

    // Base physics and style prompt
    const enhancedPrompt = `
      PHOTOREALISTIC CINEMA GENERATION.
      QUALITY: ${resPrompt}

      SCENE DESCRIPTION:
      ${finalPrompt}

      ------------------------------------------------------------------
      OPTICAL PHYSICS CONFIGURATION:

      1. [LENS & PERSPECTIVE]
      - Focal Length: ${cameraSetup.focalLength.value}
      - Lens Character: ${cameraSetup.focalLength.promptContext}
      - Shot Distance: ${zoomPrompt}

      2. [APERTURE & DEPTH]
      - Aperture: ${cameraSetup.aperture.value}
      - Effect: ${cameraSetup.aperture.promptContext}
      
      3. [FILM STOCK & COLOR]
      - Sensor/Body: ${cameraSetup.body.name} (${cameraSetup.body.promptContext})
      - Look: ${cameraSetup.filter.name} (${cameraSetup.filter.promptContext})
      
      ------------------------------------------------------------------
      EXECUTION STANDARDS:
      - 3D DEPTH: Strong volumetric lighting. Separation between subject and background.
      - TEXTURE: Hyper-realistic skin (pores, fuzz), fabric weave, and material imperfections.
      - COMPOSITION: Adhere strictly to the requested aspect ratio (${finalAspectRatio}).
    `;

    const parts: any[] = [];

    const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } => {
      // 支持 data:image/png;base64,xxxx 或者纯 base64 字符串
      const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
      if (match) {
        return { mimeType: match[1] || "image/png", data: match[2] };
      }
      return { mimeType: "image/png", data: dataUrl };
    };

    // Add reference image(s) if provided
    const hasReferenceImages = Array.isArray(referenceImagesBase64) && referenceImagesBase64.length > 0;
    if (hasReferenceImages) {
      for (const img of referenceImagesBase64) {
        if (!img) continue;
        const parsed = parseDataUrl(img);
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        });
      }

      // ------------------------------------------------------------------
      // DYNAMIC RE-FRAMING based on Focal Length
      // ------------------------------------------------------------------
      const focalVal = parseInt(cameraSetup.focalLength.value);
      let framingOverride = "Adjust framing naturally based on the new lens characteristics.";

      if (focalVal <= 24) {
        framingOverride = `
          ACTION: ZOOM OUT / PULL BACK (Wide Angle).
          - The camera physically moves BACK. 
          - Increase the field of view significantly.
          - IF the input is a partial shot, YOU MUST GENERATE THE MISSING LOWER BODY.
          - Reveal more of the environment.
        `;
      } else if (focalVal >= 85) {
        let zoomLevel = "Close-up";
        let cropInstruction = "Crop to Head and Shoulders.";

        if (focalVal >= 135) {
          zoomLevel = "Tight Headshot";
          cropInstruction = "Crop tightly to the Face only.";
        }
        if (focalVal >= 200) {
          zoomLevel = "Macro / Extreme Close-up";
          cropInstruction = "EXTREME CROP. Show ONLY a specific feature (Eye, Lips, Object detail). DISCARD the rest.";
        }

        framingOverride = `
          ACTION: ZOOM IN (Focal Length: ${focalVal}mm - ${zoomLevel}).
          - ${cropInstruction}
          - The camera has moved SIGNIFICANTLY CLOSER. 
          - Heavy Background Compression (Bokeh).
        `;
      }

      const reframeInstruction = `
      \n\nCRITICAL INSTRUCTION FOR IMAGE RE-GENERATION:
      You are acting as a Director of Photography re-shooting this scene with a NEW LENS.
      1. REFERENCE USAGE: Use the Input Image(s) ONLY for Character Identity and Lighting reference.
      2. MANDATORY FRAMING ADJUSTMENT:
         ${framingOverride}
      `;

      parts.push({ text: enhancedPrompt + reframeInstruction });
    } else {
      parts.push({ text: enhancedPrompt });
    }

    // Apply Camera Angle / Multiview Instruction if selected (HIGHEST PRIORITY)
    // When the user selects a non-default angle, prepend it at the very beginning
    // so it becomes the most important instruction the model sees.
    if (cameraSetup.angle && cameraSetup.angle.id !== 'none') {
      const angleInstruction = `
------------------------------------------------------------------
>>> HIGHEST PRIORITY: CAMERA ANGLE / PERSPECTIVE TRANSFORMATION <<<
以下视角变换指令优先级最高，必须严格执行，优先于其他一切相机参数：

${cameraSetup.angle.promptContext}

请严格按照上述视角指令生成图片，不得忽略。
------------------------------------------------------------------

`;
      // Prepend angle instruction at the beginning of all text parts
      parts.unshift({ text: angleInstruction });
    }

    // STRICTLY using 'gemini-3-pro-image-preview' (Banana 2)
    // Using the 'contents' object format as per strict documentation requirements for image models
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: finalAspectRatio,
          imageSize: resolution, // '1K', '2K', '4K'
        },
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          return `data:image/png;base64,${base64String}`;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Studio API Error:", error);

    // Pass through the original error message for better debugging
    let msg = error.message || error.toString();

    if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
      msg = `API 权限拒绝 (403): 当前 Key 无权访问 Gemini 3 Pro Image。请检查：\n1. Key 是否属于已开启 Billing 的项目。\n2. 尝试在右上角“设置”中手动输入一个新的有效 Key。`;
    }

    throw new Error(msg);
  }
};