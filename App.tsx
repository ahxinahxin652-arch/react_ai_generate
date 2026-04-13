import React, { useState, useRef, useEffect } from 'react';
import DrumPicker from './components/DrumPicker';
import { CAMERA_BODIES, FOCAL_LENGTH_OPTIONS, APERTURE_OPTIONS, CAMERA_FILTERS, ZOOM_OPTIONS, CAMERA_ANGLES } from './constants';
import { CameraSetup, GenerationState, HistoryItem, GeneratedImage } from './types';
import { generateCinematicImage } from './services/geminiService';
import { generateCinematicImageNano } from './services/nanoBananaService';
import { generateCinematicImageRunningHub } from './services/runningHubService';
import { generateImageDualChannel } from './services/dualChannelService';

// SVGs
const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0L12.245 7.755L20 10L12.245 12.245L10 20L7.755 12.245L0 10L7.755 7.755L10 0Z" fill="currentColor" />
    </svg>
);

const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
);

const ImageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
);

const CompareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="9" height="18" rx="2" />
      <rect x="13" y="3" width="9" height="18" rx="2" />
      <line x1="6" y1="8" x2="6" y2="16" />
      <line x1="18" y1="8" x2="18" y2="16" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m6-6h-6m-6 0h6m5.657-5.657l-4.243 4.243m0 0l-4.243 4.243m4.243-4.243l-4.243-4.243m4.243 4.243l4.243 4.243" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const AspectRatioIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="2" />
    </svg>
);

const ResolutionIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
);

const XIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

type Tab = 'body' | 'focal' | 'aperture' | 'filter' | 'angle';
type ApiProvider = 'gemini' | 'nanoBanana' | 'runningHub';
const DEFAULT_AI_T8STAR_API_KEY = '';

// 分辨率检测 Hook
const useResolutionScale = () => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const calculateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 基准分辨率: 1920x1080 (2K)
      const baseWidth = 1920;
      const baseHeight = 1080;

      // 根据屏幕宽度计算缩放比例
      let widthScale = width / baseWidth;

      // 1K 分辨率 (1280x720 或更小)
      if (width <= 1280) {
        widthScale = 0.7;
      }
      // 介于 1K 和 2K 之间
      else if (width < 1600) {
        widthScale = 0.8;
      }
      // 介于 2K 和 2.5K 之间
      else if (width < 2560) {
        widthScale = Math.min(widthScale, 1);
      }
      // 2.5K 及以上
      else {
        widthScale = 1.1;
      }

      // 同样考虑高度
      let heightScale = height / baseHeight;
      if (height <= 720) {
        heightScale = 0.7;
      } else if (height < 900) {
        heightScale = 0.8;
      } else if (height < 1200) {
        heightScale = Math.min(heightScale, 1);
      } else {
        heightScale = 1.1;
      }

      // 取较小的缩放比例以确保内容完全可见
      const finalScale = Math.min(widthScale, heightScale);

      // 限制缩放范围在 0.65 到 1.2 之间
      setScale(Math.max(0.65, Math.min(1.2, finalScale)));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return scale;
};

const App: React.FC = () => {
  const resolutionScale = useResolutionScale();
  // Camera Setup State
  const [cameraSetup, setCameraSetup] = useState<CameraSetup>({
    body: CAMERA_BODIES[0],
    focalLength: FOCAL_LENGTH_OPTIONS[3], // 50mm
    aperture: APERTURE_OPTIONS[2], // f/2.8
    filter: CAMERA_FILTERS[0],
    angle: CAMERA_ANGLES[0] // Default (None)
  });

  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [resolution, setResolution] = useState<string>("2K");
  const [zoomIndex, setZoomIndex] = useState<number>(1);

  const [showCameraList, setShowCameraList] = useState(false);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('nanoBanana');

  // 百度云 VOD 凭证（用于双通道备份）
  const [baiduAK, setBaiduAK] = useState<string>('');
  const [baiduSK, setBaiduSK] = useState<string>('');

  const [activeTab, setActiveTab] = useState<Tab>('body');

  // 阿里云（万相） API-KEY
  const [aliyunApiKey, setAliyunApiKey] = useState<string>('');

  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [isAddingReference, setIsAddingReference] = useState(false);

  const [isDragOverUpload, setIsDragOverUpload] = useState(false);

  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    resultUrl: null,
    error: null,
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 新增：生成的图片列表和选中的图片
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // 大图预览模态框状态
  const [showImageModal, setShowImageModal] = useState(false);

  // 按钮生成中状态（临时显示，2秒后恢复）
  const [isButtonGenerating, setIsButtonGenerating] = useState(false);

  // 拼图模式状态
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [mergeSelectedIds, setMergeSelectedIds] = useState<Set<string>>(new Set());
  const [isMerging, setIsMerging] = useState(false);
  const [mergeLocalUrls, setMergeLocalUrls] = useState<string[]>([]);

  // 拼图编辑器状态（网格模式）
  const [mergeEditorData, setMergeEditorData] = useState<{
    show: boolean;
    urls: string[];
    scales: number[];     // 每张图的缩放比例
    offsets: { x: number, y: number }[]; // 每张图的偏移量 (x,y)
    cols: number;
    rows: number;
    ratio: '16:9' | '9:16'; // 画布比例
    isLandscape: boolean;
  } | null>(null);

  // 拼图编辑器拖拽状态（用 ref 提高性能）
  const cellDragRef = useRef<{
    dragging: boolean;
    index: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({ dragging: false, index: -1, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 });

  const carouselRef = useRef<HTMLDivElement>(null);
  const ratioMenuRef = useRef<HTMLButtonElement>(null);
  const resMenuRef = useRef<HTMLButtonElement>(null);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);

  // 监听父窗口消息：必须放在 useEffect 中，避免每次 render 都重复注册导致回调执行多次
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'saveApikey' && event.data.data.domain == 'ai.t8star.cn') {
        localStorage.setItem('gemini_api_key', event.data.data.apiKey);
        setUserApiKey(event.data.data.apiKey);
        console.log('生图收到saveApikey数据:', event.data.data);
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  // Load settings from storage on mount
  useEffect(() => {
    // Load API Key and provider
    const storedKey = localStorage.getItem('gemini_api_key') || DEFAULT_AI_T8STAR_API_KEY;
    setUserApiKey(storedKey);
    const storedProvider = localStorage.getItem('api_provider') as ApiProvider;
    if (storedProvider) {
      setApiProvider(storedProvider);
    }

    // Load Baidu VOD credentials
    const storedBaiduAK = localStorage.getItem('baidu_vod_ak');
    if (storedBaiduAK) {
      setBaiduAK(storedBaiduAK);
    }
    const storedBaiduSK = localStorage.getItem('baidu_vod_sk');
    if (storedBaiduSK) {
      setBaiduSK(storedBaiduSK);
    }

    // Load WanXiang API KEY
    const storedAliyunKey = localStorage.getItem('aliyun_api_key');
    if (storedAliyunKey) {
      setAliyunApiKey(storedAliyunKey);
    }

    // Load camera setup
    const storedCameraSetup = localStorage.getItem('camera_setup');
    if (storedCameraSetup) {
      try {
        const parsed = JSON.parse(storedCameraSetup);
        // 验证并恢复相机设置
        if (parsed.body && parsed.focalLength && parsed.aperture && parsed.filter) {
          // Backward compatibility: add default angle if missing
          if (!parsed.angle) {
            parsed.angle = CAMERA_ANGLES[0];
          }
          setCameraSetup(parsed);
        }
      } catch (e) {
        console.error('Failed to parse camera setup from storage:', e);
      }
    }

    // Load other settings
    const storedAspectRatio = localStorage.getItem('aspect_ratio');
    if (storedAspectRatio) {
      setAspectRatio(storedAspectRatio);
    }

    const storedResolution = localStorage.getItem('resolution');
    if (storedResolution) {
      setResolution(storedResolution);
    }

    const storedZoomIndex = localStorage.getItem('zoom_index');
    if (storedZoomIndex) {
      setZoomIndex(parseInt(storedZoomIndex, 10));
    }
  }, []);

  // Save camera setup to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('camera_setup', JSON.stringify(cameraSetup));
  }, [cameraSetup]);

  // Save other settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aspect_ratio', aspectRatio);
  }, [aspectRatio]);

  useEffect(() => {
    localStorage.setItem('resolution', resolution);
  }, [resolution]);

  useEffect(() => {
    localStorage.setItem('zoom_index', zoomIndex.toString());
  }, [zoomIndex]);

  // Save Baidu VOD credentials to localStorage
  useEffect(() => {
    if (baiduAK) {
      localStorage.setItem('baidu_vod_ak', baiduAK);
    }
  }, [baiduAK]);

  useEffect(() => {
    if (baiduSK) {
      localStorage.setItem('baidu_vod_sk', baiduSK);
    }
  }, [baiduSK]);

  useEffect(() => {
    if (aliyunApiKey) {
      localStorage.setItem('aliyun_api_key', aliyunApiKey);
    }
  }, [aliyunApiKey]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close Camera List
      if (carouselRef.current && !carouselRef.current.contains(event.target as Node) && !(event.target as Element).closest('#camera-trigger')) {
        setShowCameraList(false);
      }
      // Close Ratio Menu
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target as Node)) {
        setShowRatioMenu(false);
      }
      // Close Res Menu
      if (resMenuRef.current && !resMenuRef.current.contains(event.target as Node)) {
        setShowResMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2200);
  };

  const handleGenerate = async () => {
    // 防抖：如果正在生成中，直接返回
    if (isButtonGenerating) return;

    if (!prompt.trim() && uploadedImages.length === 0) return;

    const currentPrompt = prompt;
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 设置按钮为生成中状态（防抖）
    setIsButtonGenerating(true);

    // 2秒后恢复按钮状态
    setTimeout(() => {
      setIsButtonGenerating(false);
    }, 2000);

    // 立即显示提交成功反馈
    showToast('✓ 已提交，正在生成中...');

    // 立即添加占位图片
    const placeholderImage: GeneratedImage = {
      id: tempId,
      url: '', // 空URL表示占位
      prompt: currentPrompt || (uploadedImages.length ? "Image Variation" : "Untitled"),
      cameraSetup: { ...cameraSetup },
      aspectRatio: aspectRatio,
      resolution: resolution,
      timestamp: Date.now(),
      isLoading: true // 标记为加载中
    };
    setGeneratedImages(prev => [placeholderImage, ...prev]);
    setSelectedImageIndex(0); // 选中占位图片

    try {
      const zoomPrompt = ZOOM_OPTIONS[zoomIndex].prompt;

      // 使用多通道服务（nanoBanana + 百度VOD备份 + 万相通道3）
      const result = await generateImageDualChannel({
        // 通道1: NanoBanana
        nanoBananaApiKey: userApiKey,

        // 通道2: 百度VOD
        baiduAK: baiduAK || undefined,
        baiduSK: baiduSK || undefined,

        // 通道3：阿里云API KEY (传递进去！)
        aliyunApiKey: aliyunApiKey || undefined,

        // 通用参数
        prompt: currentPrompt,
        cameraSetup,
        aspectRatio,
        zoomPrompt,
        referenceImagesBase64: uploadedImages.length ? uploadedImages : null,
        resolution,

        // 通道1超时时间：3分钟
        channel1Timeout: 180000,

        // 通道切换回调
        onChannelSwitch: (fromChannel, reason) => {
          console.log(`切换通道: 从通道${fromChannel} 切换，原因: ${reason}`);
          const reasonText = (reason || '').toLowerCase();
          const isTimeout = reasonText.includes('超时') || reasonText.includes('timeout');
          if (isTimeout) {
            showToast('⚠ 通道1超时，已切换到通道2...');
          } else {
            showToast('⚠ 通道1失败，已切换到通道2...');
          }
        }
      });

      if (!result.success) {
        // 沿用多通道返回结果
        throw new Error(result.error || '所有通道均已生成失败');
      }

      const imageUrl = result.imageUrl!;
      const channelUsed = result.channelUsed || 1;

      // 图片生成完成后，更新占位图片
      setGeneratedImages(prev =>
          prev.map(img =>
              img.id === tempId
                  ? {
                    ...img,
                    url: imageUrl,
                    isLoading: false, // 移除加载状态
                    isError: false,
                    errorMessage: undefined,
                  }
                  : img
          )
      );

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: tempId,
        url: imageUrl,
        prompt: currentPrompt || (uploadedImages.length ? "Image Variation" : "Untitled"),
        cameraSetup: { ...cameraSetup },
        aspectRatio: aspectRatio,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      // 生成完成后再显示成功提示（显示使用的通道）
      showToast(`✓ 生成完成！(通道${channelUsed})`);

      // 清空提示词，准备下一次提交
      setPrompt('');

    } catch (error: any) {
      console.error(error);

      let errorMessage = "生成失败，请重试。";
      if (error.message) {
        errorMessage = error.message;
      }

      // 显示错误 toast
      showToast('✗ ' + errorMessage);

      // 保留占位图片并标记失败，避免失败后“清空图片列表”的观感
      setGeneratedImages(prev =>
          prev.map(img =>
              img.id === tempId
                  ? {
                    ...img,
                    isLoading: false,
                    isError: true,
                    errorMessage,
                  }
                  : img
          )
      );
    }
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setGenerationState({
      isLoading: false,
      resultUrl: item.url,
      error: null
    });
    setPrompt(item.prompt);
    setCameraSetup(item.cameraSetup);
    setAspectRatio(item.aspectRatio);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 防抖：正在生成时，禁用 Enter 键
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Image Upload Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("读取图片失败"));
          reader.readAsDataURL(file);
        });

    const MAX_IMAGES = 20;
    const remaining = Math.max(0, MAX_IMAGES - uploadedImages.length);
    const toRead = files.slice(0, remaining);
    if (!toRead.length) {
      // 已满 20 张时，允许用户再次选择但不追加
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    Promise.all(toRead.map(readAsDataUrl))
        .then((dataUrls) => {
          setUploadedImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES));
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        });
  };

  const isImageFile = (file: File) => {
    if (file.type?.startsWith('image/')) return true;
    const name = (file.name || '').toLowerCase();
    return /\.(png|jpe?g|webp|gif|bmp|tiff?|avif|heic)$/.test(name);
  };

  const addReferenceFiles = async (files: File[]) => {
    const MAX_IMAGES = 20;

    const imageFiles = files.filter(isImageFile);
    if (!imageFiles.length) {
      showToast('未检测到可用图片');
      return;
    }

    const remaining = Math.max(0, MAX_IMAGES - uploadedImages.length);
    const toRead = imageFiles.slice(0, remaining);
    if (!toRead.length) {
      showToast(`参考图已满（最多 ${MAX_IMAGES} 张）`);
      return;
    }

    const readAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("读取图片失败"));
          reader.readAsDataURL(file);
        });

    try {
      const dataUrls = await Promise.all(toRead.map(readAsDataUrl));
      setUploadedImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES));
      if (imageFiles.length > remaining) {
        showToast(`已添加 ${toRead.length} 张（已达到上限）`);
      } else {
        showToast(`已添加 ${toRead.length} 张参考图`);
      }
    } catch (e) {
      console.error(e);
      showToast('读取图片失败');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFilesFromDataTransfer = async (dt: DataTransfer): Promise<File[]> => {
    const items = Array.from(dt.items || []);

    // 尝试支持“拖文件夹”递归读取（Chrome/Edge 支持 webkitGetAsEntry）
    const hasEntries = items.some((it) => typeof (it as any).webkitGetAsEntry === 'function');
    if (!hasEntries) {
      return Array.from(dt.files || []);
    }

    const readAllDirectoryEntries = (directoryReader: any) =>
        new Promise<any[]>((resolve, reject) => {
          const entries: any[] = [];
          const readBatch = () => {
            directoryReader.readEntries(
                (batch: any[]) => {
                  if (!batch?.length) {
                    resolve(entries);
                    return;
                  }
                  entries.push(...batch);
                  readBatch();
                },
                (err: any) => reject(err)
            );
          };
          readBatch();
        });

    const getFilesFromEntry = async (entry: any): Promise<File[]> => {
      if (!entry) return [];

      if (entry.isFile) {
        return new Promise<File[]>((resolve) => {
          entry.file(
              (file: File) => resolve([file]),
              () => resolve([])
          );
        });
      }

      if (entry.isDirectory) {
        const reader = entry.createReader();
        const children = await readAllDirectoryEntries(reader);
        const nested = await Promise.all(children.map((c) => getFilesFromEntry(c)));
        return nested.flat();
      }

      return [];
    };

    const allFilesNested = await Promise.all(
        items
            .filter((it) => it.kind === 'file')
            .map(async (it) => {
              const entry = (it as any).webkitGetAsEntry?.();
              if (entry) return getFilesFromEntry(entry);
              const file = it.getAsFile();
              return file ? [file] : [];
            })
    );

    return allFilesNested.flat();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImages = () => {
    setUploadedImages([]);
    setShowImagePreview(false);
    setPreviewImageIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeUploadedImageAt = (index: number) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    setPreviewImageIndex((prev) => {
      if (index < prev) return prev - 1;
      if (index === prev) return 0;
      return prev;
    });
  };

  const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("读取图片失败"));
        reader.readAsDataURL(blob);
      });

  const fetchImageBlob = async (url: string, timeoutMs = 12000): Promise<Blob> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      // 关键点：force-cache 让浏览器优先走自身缓存（很多情况下图片已经被 <img> 加载过）
      const resp = await fetch(url, {
        signal: controller.signal,
        cache: 'force-cache',
        // 默认 mode 为 cors；如果目标不允许跨域读取，这里会直接抛 TypeError
      } as RequestInit);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.blob();
    } finally {
      window.clearTimeout(timer);
    }
  };

  const tryGetDataUrlForDownload = async (url: string): Promise<string | null> => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;

    try {
      const blob = await fetchImageBlob(url);
      return await blobToDataUrl(blob);
    } catch {
      return null;
    }
  };

  const addReferenceImageFromUrl = async (url: string) => {
    const MAX_IMAGES = 20;
    if (!url) return;

    if (uploadedImages.length >= MAX_IMAGES) {
      showToast(`参考图已满（最多 ${MAX_IMAGES} 张）`);
      return;
    }

    setIsAddingReference(true);
    try {
      const dataUrl = url.startsWith('data:')
          ? url
          : await (async () => {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            return blobToDataUrl(blob);
          })();

      setUploadedImages((prev) => {
        if (prev.length >= MAX_IMAGES) return prev;
        if (prev.includes(dataUrl)) return prev;
        return [...prev, dataUrl].slice(0, MAX_IMAGES);
      });

      showToast('已加入参考图');
    } catch (e) {
      console.error(e);
      showToast('无法加入参考图：图片源不允许读取（跨域）。可先下载后再上传。');
    } finally {
      setIsAddingReference(false);
    }
  };

  const triggerBrowserDownload = (href: string, filename: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadImage = async (url: string, filename: string) => {
    if (!url) return;

    // 优先：尝试从渲染进程直接读到图片数据（通常会命中浏览器缓存，避免 Electron 端再发一次慢请求）
    const dataUrl = await tryGetDataUrlForDownload(url);

    // 1) 先走 Electron/父窗口接管（可做到静默保存到默认目录）
    try {
      window.parent.postMessage(
          {
            type: 'DOWNLOAD_IMAGE',
            // 兼容：旧接收端只看 url/filename，新接收端可优先用 dataUrl 直接落盘
            data: { url, filename, dataUrl }
          },
          '*'
      );
      return;
    } catch {
      // ignore
    }

    // 2) 再退一步：浏览器侧触发下载（无法保证不弹“另存为”，受浏览器安全策略限制）
    try {
      if (dataUrl) {
        triggerBrowserDownload(dataUrl, filename);
      } else {
        triggerBrowserDownload(url, filename);
      }
      showToast('已触发浏览器下载');
    } catch {
      // 兜底：打开新标签页让用户自行保存
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('已打开图片，可右键另存为');
    }
  };

  const handleDownloadResult = () => {
    if (!generationState.resultUrl) return;
    const ts = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const filename = `cinema-shot-${ts.getFullYear()}${pad2(ts.getMonth() + 1)}${pad2(ts.getDate())}-${pad2(ts.getHours())}${pad2(ts.getMinutes())}${pad2(ts.getSeconds())}.png`;
    downloadImage(generationState.resultUrl, filename);
  };

  // ===== 拼图功能：将选中的多张图片拼成一张 =====
  const toggleMergeSelect = (id: string) => {
    setMergeSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 计算网格布局
  const calculateGridLayout = (count: number, isWide: boolean) => {
    if (count <= 1) return { cols: 1, rows: 1 };
    if (count === 2) return isWide ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
    if (count === 3) return isWide ? { cols: 3, rows: 1 } : { cols: 1, rows: 3 };
    if (count === 4) return { cols: 2, rows: 2 };
    if (count <= 6) return isWide ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
    return { cols: Math.ceil(Math.sqrt(count)), rows: Math.ceil(count / Math.ceil(Math.sqrt(count))) };
  };

  const handleMergeImages = async () => {
    const selectedImages = generatedImages.filter(img => mergeSelectedIds.has(img.id) && img.url && !img.isLoading);
    const allUrls = [...selectedImages.map(s => s.url), ...mergeLocalUrls];
    if (allUrls.length < 2) {
      showToast('请至少选择 2 张图片（已生成 + 本地）');
      return;
    }

    // 默认 16:9
    const isLandscape = true;
    const count = allUrls.length;
    const { cols, rows } = calculateGridLayout(count, isLandscape);

    setMergeEditorData({
      show: true,
      urls: allUrls,
      scales: new Array(count).fill(1.0),
      offsets: new Array(count).fill({ x: 0, y: 0 }),
      cols,
      rows,
      ratio: '16:9',
      isLandscape,
    });

    setIsMergeMode(false);
    setMergeSelectedIds(new Set());
    setMergeLocalUrls([]);
  };

  // 从本地添加图片到拼图编辑器
  const handleAddLocalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const readPromises = fileArray.map((file: File) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(dataUrls => {
      if (mergeEditorData) {
        // 已打开编辑器，追加图片
        const allUrls = [...mergeEditorData.urls, ...dataUrls];
        const count = allUrls.length;
        const { cols, rows } = calculateGridLayout(count, mergeEditorData.isLandscape);
        setMergeEditorData({
          ...mergeEditorData,
          urls: allUrls,
          scales: [...mergeEditorData.scales, ...new Array(dataUrls.length).fill(1.0)],
          offsets: [...mergeEditorData.offsets, ...new Array(dataUrls.length).fill({ x: 0, y: 0 })],
          cols,
          rows,
        });
      } else if (isMergeMode) {
        // 在拼图模式中，累加本地图片 URL，不打开编辑器
        setMergeLocalUrls(prev => [...prev, ...dataUrls]);
        showToast(`已添加 ${dataUrls.length} 张本地图片`);
      } else {
        // 非拼图模式，直接用本地图片打开编辑器
        const isLandscape = true;
        const count = dataUrls.length;
        const { cols, rows } = calculateGridLayout(Math.max(count, 1), isLandscape);
        setMergeEditorData({
          show: true,
          urls: dataUrls,
          scales: new Array(count).fill(1.0),
          offsets: new Array(count).fill({ x: 0, y: 0 }),
          cols,
          rows,
          ratio: '16:9',
          isLandscape,
        });
      }
    }).catch(err => {
      console.error('读取本地图片失败:', err);
      showToast('读取图片失败');
    });

    // 重置 input 以便可以重复选择同一文件
    e.target.value = '';
  };

  // 切换编辑器中的画布比例
  const toggleEditorRatio = (ratio: '16:9' | '9:16') => {
    if (!mergeEditorData) return;
    const isLandscape = ratio === '16:9';
    const { cols, rows } = calculateGridLayout(mergeEditorData.urls.length, isLandscape);
    setMergeEditorData({
      ...mergeEditorData,
      ratio,
      isLandscape,
      cols,
      rows,
      // 重置缩放和偏移
      scales: new Array(mergeEditorData.urls.length).fill(1.0),
      offsets: new Array(mergeEditorData.urls.length).fill({ x: 0, y: 0 }),
    });
  };

  // 编辑器：鼠标滚轮缩放图片 (在格子内)
  const handleEditorWheel = (index: number, e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMergeEditorData(prev => {
      if (!prev) return prev;
      const newScales = [...prev.scales];
      const step = e.deltaY > 0 ? -0.1 : 0.1;
      // 限制缩放范围 0.5x ~ 3.0x
      newScales[index] = Math.max(0.5, Math.min(3.0, newScales[index] + step));
      return { ...prev, scales: newScales };
    });
  };

  // 编辑器：鼠标按下开始拖拽图片（在格子内平移）
  const handleCellMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mergeEditorData) return;
    cellDragRef.current = {
      dragging: true,
      index,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: mergeEditorData.offsets[index].x,
      startOffsetY: mergeEditorData.offsets[index].y,
    };
  };

  // 编辑器：鼠标移动时拖拽
  const handleCellMouseMove = (e: React.MouseEvent) => {
    const drag = cellDragRef.current;
    if (!drag.dragging) return;
    e.preventDefault();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setMergeEditorData(prev => {
      if (!prev) return prev;
      const newOffsets = [...prev.offsets];
      newOffsets[drag.index] = {
        x: drag.startOffsetX + dx,
        y: drag.startOffsetY + dy,
      };
      return { ...prev, offsets: newOffsets };
    });
  };

  // 编辑器：鼠标释放停止拖拽
  const handleCellMouseUp = () => {
    cellDragRef.current.dragging = false;
  };

  // 确认拼图
  const confirmMergeEditor = async () => {
    if (!mergeEditorData) return;
    const { urls, scales, cols, rows, isLandscape } = mergeEditorData;
    const count = urls.length;

    try {
      showToast('正在生成拼图...');
      const canvasW = isLandscape ? 3840 : 2160;
      const canvasH = isLandscape ? 2160 : 3840;
      const gap = 6;

      const cellW = (canvasW - (cols - 1) * gap) / cols;
      const cellH = (canvasH - (rows - 1) * gap) / rows;

      const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      const imgs = await Promise.all(urls.map(u => loadImg(u)));

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvasW, canvasH);

      imgs.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);

        // 裁剪到格子区域
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellW, cellH);
        ctx.clip();

        // 计算绘制尺寸 (Contain 模式 + 用户缩放)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const cellRatio = cellW / cellH;
        let baseScale;
        if (imgRatio > cellRatio) {
          baseScale = cellW / img.naturalWidth;
        } else {
          baseScale = cellH / img.naturalHeight;
        }

        const finalScale = baseScale * scales[i];
        const dw = img.naturalWidth * finalScale;
        const dh = img.naturalHeight * finalScale;

        // 居中 + 用户偏移
        const offset = mergeEditorData.offsets[i];
        // 将 CSS 像素偏移转换为画布像素偏移
        // 预览画布宽度约为 CSS 容器宽度，需要按比例缩放
        const previewW = mergeEditorData.isLandscape ? 1200 : (900 * (9 / 16));
        const offsetScaleX = canvasW / previewW;
        const offsetScaleY = canvasH / (previewW * (mergeEditorData.isLandscape ? 9 / 16 : 16 / 9));
        const dx = x + (cellW - dw) / 2 + (offset.x * offsetScaleX);
        const dy = y + (cellH - dh) / 2 + (offset.y * offsetScaleY);

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
        ctx.restore();
      });

      const mergedUrl = canvas.toDataURL('image/png');
      const orientLabel = isLandscape ? '16:9' : '9:16';

      const mergedImage: GeneratedImage = {
        id: Date.now().toString(),
        url: mergedUrl,
        prompt: `拼图 ${orientLabel} (${count}张)`,
        cameraSetup: { ...cameraSetup },
        aspectRatio: orientLabel, // 保持类型兼容
        resolution: resolution,
        timestamp: Date.now(),
        isLoading: false,
      };
      setGeneratedImages(prev => [mergedImage, ...prev]);
      setSelectedImageIndex(0);
      setMergeEditorData(null);
      showToast(`✓ 拼图完成！${orientLabel} 画布`);
    } catch (e: any) {
      console.error('拼图渲染失败:', e);
      showToast('✗ 拼图失败：' + (e.message || ''));
    }
  };

  return (
      <div className="flex flex-col h-screen w-full bg-[#0F1113] overflow-hidden text-white font-sans selection:bg-white/30 selection:text-white">
        {/* Header 已隐藏，避免遮挡图片区域 */}
        {/* <Header onSettingsClick={() => setShowSettings(true)} /> */}

        {/* Main Content Area */}
        <main
            className="relative w-full flex items-center justify-center"
            style={{
              height: 'calc(100vh - 96px)', // 只减去底部控制栏(96px)
              paddingTop: `${16 * resolutionScale}px`,
              paddingBottom: `${16 * resolutionScale}px`,
              paddingLeft: `${16 * resolutionScale}px`,
              paddingRight: `${16 * resolutionScale}px`
            }}
        >

          {/* Thumbnail Grid - 5x5 Grid Layout (直接显示在主区域) */}
          {generatedImages.length === 0 ? (
              // 空状态提示
              <div className="flex flex-col items-center justify-center w-full h-full opacity-30">
                <CameraIcon />
                <div className="text-center mt-6">
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">工作室</h2>
                  <p className="text-sm font-medium">系统就绪 · 输入提示词开始拍摄</p>
                  <p className="text-xs mt-2">生成的图片将显示在下方网格中</p>
                </div>
              </div>
          ) : (
              <div className="relative w-full h-full">
                {/* 拼图按钮 - 右上角 */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                  {isMergeMode ? (
                      <>
                  <span className="text-xs text-gray-400">
                    已选 {mergeSelectedIds.size} 张{mergeLocalUrls.length > 0 ? ` + ${mergeLocalUrls.length} 本地` : ''}
                  </span>
                        <button
                            onClick={() => mergeFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2A2C30] text-blue-400 hover:bg-[#3A3C40] transition-all cursor-pointer border border-blue-500/30"
                        >
                          📁 本地图片
                        </button>
                        <button
                            onClick={handleMergeImages}
                            disabled={(mergeSelectedIds.size + mergeLocalUrls.length) < 2 || isMerging}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: (mergeSelectedIds.size + mergeLocalUrls.length) >= 2 ? 'rgba(255,107,53,1)' : 'rgba(255,107,53,0.3)',
                              color: '#fff',
                              cursor: (mergeSelectedIds.size + mergeLocalUrls.length) >= 2 ? 'pointer' : 'not-allowed',
                            }}
                        >
                          {isMerging ? '拼合中...' : '✓ 确认拼图'}
                        </button>
                        <button
                            onClick={() => { setIsMergeMode(false); setMergeSelectedIds(new Set()); setMergeLocalUrls([]); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2A2C30] text-gray-300 hover:bg-[#3A3C40] transition-all cursor-pointer"
                        >
                          ✕ 取消
                        </button>
                      </>
                  ) : (
                      <button
                          onClick={() => setIsMergeMode(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1B1D20] border border-[#2A2C30] text-gray-300 hover:bg-[#2A2C30] hover:text-white transition-all cursor-pointer"
                          title="选择多张图片拼成一张"
                      >
                        🧩 拼图
                      </button>
                  )}
                </div>

                {/* 5x5 缩略图网格 */}
                <div
                    className="grid w-full overflow-y-auto"
                    style={{
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: `${12 * resolutionScale}px`,
                      maxHeight: '100%',
                      height: 'fit-content',
                      padding: `${8 * resolutionScale}px`,
                      alignContent: 'start'
                    }}
                >
                  {generatedImages.map((img, index) => (
                      <div
                          key={img.id}
                          onClick={() => {
                            if (isMergeMode) {
                              if (!img.isLoading && img.url) toggleMergeSelect(img.id);
                            } else {
                              setSelectedImageIndex(index);
                              setShowImageModal(true);
                            }
                          }}
                          className="relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-orange-500/50 bg-[#0F1113]"
                          style={{
                            borderColor: isMergeMode
                                ? (mergeSelectedIds.has(img.id) ? 'rgba(59, 130, 246, 1)' : 'rgba(42, 44, 48, 1)')
                                : (selectedImageIndex === index ? 'rgba(255, 107, 53, 1)' : 'rgba(42, 44, 48, 1)'),
                            boxShadow: isMergeMode
                                ? (mergeSelectedIds.has(img.id) ? '0 0 20px rgba(59,130,246,0.4)' : 'none')
                                : (selectedImageIndex === index ? '0 0 20px rgba(255,107,53,0.4)' : 'none')
                          }}
                      >
                        {img.isLoading ? (
                            <div className="w-full h-full bg-gradient-to-br from-[#1B1D20] to-[#0F1113] flex items-center justify-center">
                              <div className="relative w-8 h-8">
                                <div className="w-8 h-8 border-2 border-orange-500/20 rounded-full animate-spin"></div>
                                <div className="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                              </div>
                            </div>
                        ) : img.isError ? (
                            <div className="w-full h-full bg-gradient-to-br from-[#24161A] to-[#140D10] flex flex-col items-center justify-center px-3 text-center">
                              <p className="text-red-300 text-xs font-semibold mb-1">生成失败</p>
                              <p className="text-red-200/70 text-[11px] line-clamp-2">{img.errorMessage || '请求失败，请重试'}</p>
                            </div>
                        ) : (
                            <img
                                src={img.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {/* 拼图模式下显示选中标记 */}
                        {isMergeMode && !img.isLoading && img.url && (
                            <div className="absolute top-2 left-2 z-10">
                              <div
                                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                                  style={{
                                    borderColor: mergeSelectedIds.has(img.id) ? 'rgba(59,130,246,1)' : 'rgba(255,255,255,0.5)',
                                    background: mergeSelectedIds.has(img.id) ? 'rgba(59,130,246,1)' : 'rgba(0,0,0,0.5)',
                                    color: '#fff'
                                  }}
                              >
                                {mergeSelectedIds.has(img.id)
                                    ? Array.from(mergeSelectedIds).indexOf(img.id) + 1
                                    : ''}
                              </div>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-[12px] text-gray-300 truncate">{img.prompt}</p>
                        </div>
                      </div>
                  ))}
                  {generatedImages.length < 25 && Array.from({ length: Math.min(25, Math.ceil(generatedImages.length / 5) * 5) - generatedImages.length }).map((_, emptyIndex) => (
                      <div
                          key={`empty-${emptyIndex}`}
                          className="aspect-video rounded-lg border border-dashed border-[#2A2C30]/30 opacity-20"
                      />
                  ))}
                </div>
              </div>
          )}

        </main>

        {/* Toast */}
        {toastMessage && (
            <div className="fixed left-1/2 -translate-x-1/2 bottom-36 z-[120] pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium px-4 py-2 rounded-xl shadow-2xl">
                {toastMessage}
              </div>
            </div>
        )}

        {/* 隐藏的文件选择器（始终渲染，不在模态框内） */}
        <input
            ref={mergeFileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddLocalImages}
        />

        {/* Large Image Modal */}
        {/* 拼图编辑器 Modal - 网格模式 */}
        {mergeEditorData?.show && (
            <div
                className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[60] p-4"
            >
              {/* 顶部标题栏 + 比例切换 */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-white">拼图编辑器</h3>
                <div className="flex gap-2 bg-[#2A2C30] p-1 rounded-lg">
                  <button
                      onClick={() => toggleEditorRatio('16:9')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${mergeEditorData.ratio === '16:9' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    16:9
                  </button>
                  <button
                      onClick={() => toggleEditorRatio('9:16')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${mergeEditorData.ratio === '9:16' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    9:16
                  </button>
                </div>
                <p className="text-xs text-gray-500">滚轮缩放 · 拖拽移动 · 图片限定在各自格内</p>
              </div>

              {/* 网格画布 */}
              <div
                  className="relative border border-[#2A2C30] rounded-lg overflow-hidden bg-[#111]"
                  style={{
                    width: mergeEditorData.isLandscape ? '80vw' : 'auto',
                    height: mergeEditorData.isLandscape ? 'auto' : '80vh',
                    aspectRatio: mergeEditorData.ratio === '16:9' ? '16/9' : '9/16',
                    maxWidth: '1200px',
                    maxHeight: '900px',
                  }}
              >
                <div
                    className="grid w-full h-full"
                    style={{
                      gridTemplateColumns: `repeat(${mergeEditorData.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${mergeEditorData.rows}, 1fr)`,
                      gap: '2px',
                      backgroundColor: '#000',
                    }}
                    onMouseMove={handleCellMouseMove}
                    onMouseUp={handleCellMouseUp}
                    onMouseLeave={handleCellMouseUp}
                >
                  {mergeEditorData.urls.map((url, i) => (
                      <div
                          key={i}
                          className="relative overflow-hidden w-full h-full bg-[#1a1a1a]"
                          style={{ cursor: cellDragRef.current.dragging && cellDragRef.current.index === i ? 'grabbing' : 'grab' }}
                          onWheel={(e) => handleEditorWheel(i, e)}
                          onMouseDown={(e) => handleCellMouseDown(i, e)}
                      >
                        <img
                            src={url}
                            alt={`merge-${i}`}
                            className="w-full h-full object-contain pointer-events-none"
                            style={{
                              transform: `scale(${mergeEditorData.scales[i]}) translate(${mergeEditorData.offsets[i].x / mergeEditorData.scales[i]}px, ${mergeEditorData.offsets[i].y / mergeEditorData.scales[i]}px)`,
                            }}
                            draggable={false}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/50 px-1 rounded text-[10px] text-white/50 pointer-events-none">
                          {Math.round(mergeEditorData.scales[i] * 100)}%
                        </div>
                      </div>
                  ))}
                </div>
              </div>


              {/* 底部按钮 */}
              <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={() => setMergeEditorData(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2A2C30] text-gray-300 hover:bg-[#3A3C40] transition-all cursor-pointer"
                >
                  ✕ 取消
                </button>
                <button
                    onClick={() => mergeFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2A2C30] text-blue-400 hover:bg-[#3A3C40] hover:text-blue-300 transition-all cursor-pointer border border-blue-500/30"
                >
                  📁 添加本地图片
                </button>
                <button
                    onClick={confirmMergeEditor}
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all cursor-pointer"
                >
                  ✓ 确认保存
                </button>
              </div>
            </div>
        )}

        {showImageModal && selectedImageIndex !== null && generatedImages[selectedImageIndex] && (
            <div
                className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                onClick={() => setShowImageModal(false)}
            >
              <div
                  className="relative max-w-6xl max-h-full"
                  onClick={(e) => e.stopPropagation()}
              >
                {generatedImages[selectedImageIndex].isLoading ? (
                    // 加载中的大图
                    <div className="relative bg-[#1B1D20] rounded-2xl overflow-hidden" style={{ width: '80vw', aspectRatio: '16/9' }}>
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#1B1D20] to-[#0F1113]">
                        <div className="relative">
                          <div className="w-20 h-20 border-4 border-orange-500/20 rounded-full animate-spin"></div>
                          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                        <div className="mt-8 text-center">
                          <p className="text-orange-400 font-bold text-2xl mb-2">正在生成中...</p>
                          <p className="text-white/50 text-base">请稍候，AI正在创作您的电影画面</p>
                        </div>
                      </div>
                    </div>
                ) : (
                    // 显示真实大图
                    <>
                      <img
                          src={generatedImages[selectedImageIndex].url}
                          alt="Generated Preview"
                          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                      />

                      {/* Camera Info Overlay */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-orange-500/30 text-sm font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-3">
                          <span className="text-orange-400 font-bold">{generatedImages[selectedImageIndex].cameraSetup.body.name}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/80">{generatedImages[selectedImageIndex].cameraSetup.focalLength.value}</span>
                          <span className="text-white/40">•</span>
                          <span className="text-white/80">{generatedImages[selectedImageIndex].cameraSetup.aperture.value}</span>
                        </div>
                      </div>

                      {/* Prompt Display with Copy Button */}
                      {generatedImages[selectedImageIndex].prompt && (
                          <div className="absolute top-4 right-4 max-w-md">
                            <div className="bg-black/70 backdrop-blur-md border border-orange-500/30 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">生图提示词</span>
                                <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(generatedImages[selectedImageIndex].prompt);
                                      showToast('✓ 提示词已复制到剪贴板');
                                    }}
                                    className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1"
                                    title="复制提示词"
                                    type="button"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  复制
                                </button>
                              </div>
                              <div className="px-3 py-2 max-h-32 overflow-y-auto">
                                <p className="text-xs text-gray-200 leading-relaxed break-words">
                                  {generatedImages[selectedImageIndex].prompt}
                                </p>
                              </div>
                            </div>
                          </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {/* Download Button */}
                        <button
                            onClick={() => {
                              const ts = new Date(generatedImages[selectedImageIndex].timestamp);
                              const pad2 = (n: number) => String(n).padStart(2, '0');
                              const filename = `cinema-shot-${ts.getFullYear()}${pad2(ts.getMonth() + 1)}${pad2(ts.getDate())}-${pad2(ts.getHours())}${pad2(ts.getMinutes())}${pad2(ts.getSeconds())}.png`;
                              downloadImage(generatedImages[selectedImageIndex].url, filename);
                            }}
                            className="bg-black/70 backdrop-blur-md border border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 rounded-lg px-4 py-3 flex items-center gap-2 transition-all"
                            title="下载图片"
                            type="button"
                        >
                          <DownloadIcon />
                          <span className="text-xs font-bold uppercase tracking-wider">下载</span>
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/40 text-white hover:text-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 transition-all"
                            title="关闭预览"
                            type="button"
                        >
                          <XIcon />
                          <span className="text-xs font-bold uppercase tracking-wider">关闭</span>
                        </button>
                      </div>

                      {/* Navigation Arrows */}
                      {generatedImages.length > 1 && (
                          <>
                            {/* Previous Button */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex((prev) => (prev === null ? 0 : (prev - 1 + generatedImages.length) % generatedImages.length));
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/40 text-white rounded-lg p-3 transition-all hover:bg-black/80"
                                title="上一张"
                                type="button"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {/* Next Button */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex((prev) => (prev === null ? 0 : (prev + 1) % generatedImages.length));
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md border border-white/20 hover:border-white/40 text-white rounded-lg p-3 transition-all hover:bg-black/80"
                                title="下一张"
                                type="button"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                      )}
                    </>
                )}
              </div>
            </div>
        )}

        {/* History Sidebar */}
        <div className={`
        fixed top-16 right-0 bottom-0 bg-[#1B1D20]/95 backdrop-blur-xl border-l border-[#2A2C30] z-100 transform transition-transform duration-300 ease-in-out flex flex-col
        ${showHistory ? 'translate-x-0' : 'translate-x-full'}
      `}
             style={{ zIndex: 130, width: `${320 * resolutionScale}px` }}
        >
          <div
              className="border-b border-[#2A2C30] flex items-center justify-between"
              style={{ padding: `${16 * resolutionScale}px` }}
          >
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ fontSize: `${14 * resolutionScale}px` }}>历史记录</h3>
            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white"><XIcon /></button>
          </div>
          <div
              className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
              style={{
                padding: `${16 * resolutionScale}px`,
                gap: `${16 * resolutionScale}px`
              }}
          >
            {history.length === 0 ? (
                <div className="text-center text-gray-500 text-xs mt-10">暂无生成记录</div>
            ) : (
                history.map(item => (
                    <div key={item.id} onClick={() => restoreFromHistory(item)} className="group cursor-pointer">
                      <div
                          style={{ aspectRatio: '10/4', marginBottom: `${8 * resolutionScale}px` }}
                          className="aspect-video bg-black rounded-lg overflow-hidden border border-[#2A2C30] group-hover:border-orange-500/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(255,107,53,0.2)] relative"
                      >
                        <img src={item.url} alt="thumbnail" className="w-full h-full object-cover" />

                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addReferenceImageFromUrl(item.url);
                            }}
                            disabled={isAddingReference || uploadedImages.length >= 6}
                            className={`absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/70 backdrop-blur-md border border-orange-500/30 hover:border-orange-500/60 rounded-lg px-2 py-1.5 flex items-center gap-1.5 ${isAddingReference || uploadedImages.length >= 6
                                ? 'text-white/30 cursor-not-allowed'
                                : 'text-orange-400 hover:text-orange-300'
                            }`}
                            title={uploadedImages.length >= 6 ? '参考图已满（最多 6 张）' : '将此图加入参考图'}
                            type="button"
                        >
                          <ImageIcon />
                          <span className="text-[10px] font-bold uppercase tracking-wider">参考</span>
                        </button>

                        {/* 相机参数覆盖层 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                          <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase">
                            <span className="text-orange-400 font-bold">{item.cameraSetup.body.name}</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/70">{item.cameraSetup.focalLength.value}</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/70">{item.cameraSetup.aperture.value}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">{new Date(item.timestamp).toLocaleTimeString()}</div>
                      <div className="text-xs text-gray-300 line-clamp-2">{item.prompt}</div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className={`
        fixed top-16 right-0 bottom-0 bg-[#1B1D20]/95 backdrop-blur-xl border-l border-[#2A2C30] z-100 transform transition-transform duration-300 ease-in-out flex flex-col
        ${showSettings ? 'translate-x-0' : 'translate-x-full'}
      `}
             style={{ zIndex: 135, width: `${400 * resolutionScale}px` }}
        >
          <div
              className="border-b border-[#2A2C30] flex items-center justify-between"
              style={{ padding: `${16 * resolutionScale}px` }}
          >
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ fontSize: `${14 * resolutionScale}px` }}>API 配置</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><XIcon /></button>
          </div>
          <div
              className="flex-1 overflow-y-auto flex flex-col"
              style={{
                padding: `${20 * resolutionScale}px`,
                gap: `${20 * resolutionScale}px`
              }}
          >
            {/* 通道说明 */}
            <div className="bg-[#0F1113] border border-[#2A2C30] rounded-lg p-3">
              <h4 className="text-xs font-bold text-orange-400 mb-2">双通道生成策略</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• 通道1: ai.t8star.cn (优先使用)</p>
                <p>• 通道2: 百度云 VOD (备用)</p>
                <p className="mt-2 text-gray-500">若通道1超过3分钟或失败，自动切换到通道2</p>
              </div>
            </div>

            {/* 通道1配置 */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-2">通道1 API Key</h4>
              <input
                  type="text"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="输入 ai.t8star.cn API Key"
                  className="w-full bg-[#0F1113] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* 通道2配置 */}
            <div className="border-t border-[#2A2C30] pt-4">
              <h4 className="text-xs font-bold text-gray-300 mb-3">通道2 百度云凭证</h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Access Key (AK)</label>
                  <input
                      type="text"
                      value={baiduAK}
                      onChange={(e) => setBaiduAK(e.target.value)}
                      placeholder="输入百度云 AK"
                      className="w-full bg-[#0F1113] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Secret Key (SK)</label>
                  <input
                      type="password"
                      value={baiduSK}
                      onChange={(e) => setBaiduSK(e.target.value)}
                      placeholder="输入百度云 SK"
                      className="w-full bg-[#0F1113] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-3 bg-[#1B1D20] border border-blue-500/20 rounded-lg p-2">
                <p className="text-xs text-blue-400">
                  💡 百度云凭证将作为备用通道，仅在通道1失败时使用
                </p>
              </div>
            </div>

            {/* 通道3配置 */}
            <div className="border-t border-[#2A2C30] pt-4">
              <h4 className="text-xs font-bold text-gray-300 mb-3">通道3 阿里云万相 (WanXiang)</h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DashScope API Key</label>
                  <input
                      type="password"
                      value={aliyunApiKey}
                      onChange={(e) => setAliyunApiKey(e.target.value)}
                      placeholder="输入阿里云 API Key"
                      className="w-full bg-[#0F1113] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-3 bg-[#1B1D20] border border-orange-500/20 rounded-lg p-2">
                <p className="text-xs text-orange-400">
                  💡 备用通道3：使用 wan2.7-image-pro 模型进行高质量生图。
                </p>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="sticky bottom-0 pt-4 border-t border-[#2A2C30] bg-[#1B1D20]/95 backdrop-blur-sm">
              <button
                  onClick={() => {
                    showToast('✓ 配置已自动保存');
                    setShowSettings(false);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-2 px-4 rounded-lg transition-all text-sm"
              >
                完成
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bottom Control Deck */}
        <div
            className="fixed bottom-0 left-0 w-full z-40 flex justify-center items-end pointer-events-none"
            style={{
              padding: `${24 * resolutionScale}px`,
              gap: `${56 * resolutionScale}px`
            }}
        >

          {/* Left Side: Mode & History */}
          <div
              className="pointer-events-auto bg-[#1B1D20] border border-[#2A2C30] rounded-2xl shadow-xl p-2 flex flex-col justify-between"
              style={{
                height: `${120 * resolutionScale}px`,
                padding: `${8 * resolutionScale}px`
              }}
          >
            <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${showComparison ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(255,107,53,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <CompareIcon />
              <span className="text-[8px] font-medium">对比</span>
            </button>
            <div className="w-full h-px bg-[#2A2C30]"></div>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${showHistory ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(255,107,53,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <HistoryIcon />
              <span className="text-[8px] font-medium">历史</span>
            </button>
            <div className="w-full h-px bg-[#2A2C30]"></div>
            <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${showSettings ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(255,107,53,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <SettingsIcon />
              <span className="text-[8px] font-medium">设置</span>
            </button>
          </div>

          {/* Main Control Bar */}
          <div
              className="pointer-events-auto relative flex-1 max-w-4xl bg-[#1B1D20] border border-[#2A2C30] rounded-3xl shadow-2xl flex items-stretch"
              style={{
                padding: `${12 * resolutionScale}px`,
                gap: `${16 * resolutionScale}px`,
                height: `${120 * resolutionScale}px`
              }}
          >

            {/* Detailed Camera Selection Popover */}
            <div
                ref={carouselRef}
                className={`
              absolute bottom-full left-1/2 -translate-x-1/2 bg-[#1B1D20]/95 backdrop-blur-xl border border-[#2A2C30] rounded-2xl shadow-2xl transition-all duration-300 origin-bottom
              ${showCameraList ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
            `}
                style={{
                  width: `${480 * resolutionScale}px`,
                  marginBottom: `${12 * resolutionScale}px`,
                  padding: `${12 * resolutionScale}px`
                }}
            >
              {/* Tabs */}
              <div
                  className="flex gap-1 bg-[#0F1113] rounded-xl justify-center"
                  style={{
                    padding: `${4 * resolutionScale}px`,
                    gap: `${4 * resolutionScale}px`,
                    marginBottom: `${12 * resolutionScale}px`
                  }}
              >
                <button
                    onClick={() => setActiveTab('body')}
                    style={{
                      padding: `${6 * resolutionScale}px ${16 * resolutionScale}px`,
                      fontSize: `${12 * resolutionScale}px`
                    }}
                    className={`font-bold uppercase rounded-lg transition-all ${activeTab === 'body' ? 'bg-[#2A2C30] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  机身 / Body
                </button>
                <button
                    onClick={() => setActiveTab('focal')}
                    style={{
                      padding: `${6 * resolutionScale}px ${16 * resolutionScale}px`,
                      fontSize: `${12 * resolutionScale}px`
                    }}
                    className={`font-bold uppercase rounded-lg transition-all ${activeTab === 'focal' ? 'bg-[#2A2C30] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  焦距 / Focal
                </button>
                <button
                    onClick={() => setActiveTab('aperture')}
                    style={{
                      padding: `${6 * resolutionScale}px ${16 * resolutionScale}px`,
                      fontSize: `${12 * resolutionScale}px`
                    }}
                    className={`font-bold uppercase rounded-lg transition-all ${activeTab === 'aperture' ? 'bg-[#2A2C30] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  光圈 / Aperture
                </button>
                <button
                    onClick={() => setActiveTab('filter')}
                    style={{
                      padding: `${6 * resolutionScale}px ${16 * resolutionScale}px`,
                      fontSize: `${12 * resolutionScale}px`
                    }}
                    className={`font-bold uppercase rounded-lg transition-all ${activeTab === 'filter' ? 'bg-[#2A2C30] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  胶片 / Filter
                </button>
                <button
                    onClick={() => setActiveTab('angle')}
                    style={{
                      padding: `${6 * resolutionScale}px ${16 * resolutionScale}px`,
                      fontSize: `${12 * resolutionScale}px`
                    }}
                    className={`font-bold uppercase rounded-lg transition-all ${activeTab === 'angle' ? 'bg-[#2A2C30] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  视角 / Angle
                </button>
              </div>

              {/* Drum Picker */}
              <div className="w-full max-w-full mx-auto" style={{ height: `${400 * resolutionScale}px` }}>
                {activeTab === 'body' && (
                    <DrumPicker
                        items={CAMERA_BODIES}
                        selectedItem={cameraSetup.body}
                        onSelect={(body) => setCameraSetup(prev => ({ ...prev, body }))}
                        renderItem={(body, isSelected) => (
                            <div className={`
                      relative rounded-xl overflow-hidden transition-all duration-300
                      ${isSelected
                                ? 'scale-105 shadow-[0_0_40px_rgba(255,107,53,0.4)] bg-orange-500/5'
                                : 'opacity-80 hover:opacity-100'}
                    `}>
                              {/* 科技感边框效果 */}
                              <div className={`
                        absolute inset-0 rounded-xl pointer-events-none
                        ${isSelected
                                  ? 'bg-gradient-to-br from-orange-500/20 via-transparent to-orange-500/10 border border-orange-500/40'
                                  : ''}
                      `} />

                              {/* 图片 */}
                              <div className="relative">
                                <img
                                    src={body.imageUrl || ''}
                                    alt={body.name}
                                    className="w-full h-[80px] object-contain p-4"
                                />

                                {/* 相机名称 */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
                                  <div className={`
                            text-xs font-bold truncate tracking-wide
                            ${isSelected ? 'text-orange-400' : 'text-gray-300'}
                          `}>
                                    {body.name}
                                  </div>
                                </div>
                              </div>

                              {/* 效果描述小字 */}
                              <div className="bg-black/60 backdrop-blur-sm px-2 py-1.5 border-t border-orange-500/20">
                                <div className={`
                          text-[9px] leading-tight line-clamp-2
                          ${isSelected ? 'text-orange-300/90' : 'text-gray-400'}
                        `}>
                                  {(() => {
                                    const effects: Record<string, string> = {
                                      'venice': '8.6K超清·16+档动态范围·零噪点',
                                      'imax': '12K+分辨率·史诗颗粒感·宏大透视',
                                      'alexa': '传奇色彩科学·柔和高光·自然肤色',
                                      'komodo': '全局快门·高对比度·锐利清晰',
                                      '16mm': '粗颗粒·暗角·怀旧胶片质感',
                                      'vhs': '扫描线·色差·低保真故障艺术'
                                    };
                                    return effects[body.id] || '';
                                  })()}
                                </div>
                              </div>

                              {/* 选中时的装饰线条 */}
                              {isSelected && (
                                  <>
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_10px_rgba(255,107,53,0.8)]" />
                                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_10px_rgba(255,107,53,0.8)]" />
                                  </>
                              )}
                            </div>
                        )}
                        itemHeight={150}
                        visibleItems={4}
                    />
                )}

                {activeTab === 'focal' && (
                    <DrumPicker
                        items={FOCAL_LENGTH_OPTIONS}
                        selectedItem={cameraSetup.focalLength}
                        onSelect={(focalLength) => setCameraSetup(prev => ({ ...prev, focalLength }))}
                        renderItem={(lens, isSelected) => (
                            <div className={`
                      flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl
                      transition-all duration-300
                      ${isSelected
                                ? 'scale-105 shadow-[0_0_30px_rgba(255,107,53,0.35)] bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/40'
                                : 'opacity-80 hover:opacity-100 bg-[#0F1113]'}
                    `}>
                              <div className={`text-2xl font-bold font-mono tracking-wider ${isSelected ? 'text-orange-400' : 'text-white/70'}`}>
                                {lens.value}
                              </div>
                              <div className={`text-xs font-medium truncate max-w-[200px] tracking-wide ${isSelected ? 'text-orange-300/90' : 'text-gray-400'}`}>
                                {lens.name}
                              </div>
                              {isSelected && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] bg-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,53,0.9)]" />
                              )}
                            </div>
                        )}
                        itemHeight={80}
                        visibleItems={5}
                    />
                )}

                {activeTab === 'aperture' && (
                    <DrumPicker
                        items={APERTURE_OPTIONS}
                        selectedItem={cameraSetup.aperture}
                        onSelect={(aperture) => setCameraSetup(prev => ({ ...prev, aperture }))}
                        renderItem={(apt, isSelected) => (
                            <div className={`
                      flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl
                      transition-all duration-300
                      ${isSelected
                                ? 'scale-105 shadow-[0_0_30px_rgba(255,107,53,0.35)] bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/40'
                                : 'opacity-80 hover:opacity-100 bg-[#0F1113]'}
                    `}>
                              <div className={`text-2xl font-bold font-mono tracking-wider ${isSelected ? 'text-orange-400' : 'text-white/70'}`}>
                                {apt.value}
                              </div>
                              <div className={`text-xs font-medium truncate max-w-[200px] tracking-wide ${isSelected ? 'text-orange-300/90' : 'text-gray-400'}`}>
                                {apt.name}
                              </div>
                              {isSelected && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] bg-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,53,0.9)]" />
                              )}
                            </div>
                        )}
                        itemHeight={80}
                        visibleItems={5}
                    />
                )}

                {activeTab === 'filter' && (
                    <DrumPicker
                        items={CAMERA_FILTERS}
                        selectedItem={cameraSetup.filter}
                        onSelect={(filter) => setCameraSetup(prev => ({ ...prev, filter }))}
                        renderItem={(filter, isSelected) => (
                            <div className={`
                      flex flex-col items-center justify-center gap-2 px-6 py-3 rounded-xl
                      transition-all duration-300
                      ${isSelected
                                ? 'scale-105 shadow-[0_0_30px_rgba(255,107,53,0.35)] bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/40'
                                : 'opacity-80 hover:opacity-100 bg-[#0F1113]'}
                    `}>
                              <div className="flex items-center gap-3">
                                <div className={`
                          size-8 rounded-full border-2 transition-all
                          ${isSelected ? 'border-orange-400 shadow-[0_0_15px_rgba(255,107,53,0.7)]' : 'border-white/30'}
                        `} style={{ backgroundColor: filter.previewColor }} />
                                <div className={`text-sm font-bold tracking-wide ${isSelected ? 'text-orange-400' : 'text-white/70'}`}>
                                  {filter.name}
                                </div>
                              </div>
                              {isSelected && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] bg-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,53,0.9)]" />
                              )}
                            </div>
                        )}
                        itemHeight={80}
                        visibleItems={5}
                    />
                )}

                {activeTab === 'angle' && (
                    <DrumPicker
                        items={CAMERA_ANGLES}
                        selectedItem={cameraSetup.angle}
                        onSelect={(angle) => setCameraSetup(prev => ({ ...prev, angle }))}
                        renderItem={(angle, isSelected) => (
                            <div className={`
                      flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl
                      transition-all duration-300
                      ${isSelected
                                ? 'scale-105 shadow-[0_0_30px_rgba(255,107,53,0.35)] bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/40' // Orange glow for selection
                                : 'opacity-80 hover:opacity-100 bg-[#0F1113]'}
                    `}>
                              <div className={`text-lg font-bold tracking-wide ${isSelected ? 'text-orange-400' : 'text-white/70'}`}>
                                {angle.name}
                              </div>
                              <div className={`text-[10px] font-medium truncate max-w-[200px] tracking-wide ${isSelected ? 'text-orange-300/90' : 'text-gray-400'}`}>
                                {angle.description}
                              </div>
                              {isSelected && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] bg-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,53,0.9)]" />
                              )}
                            </div>
                        )}
                        itemHeight={80}
                        visibleItems={5}
                    />
                )}
              </div>
            </div>

            {/* Left Column: Input and Settings */}
            <div className="flex-1 flex flex-col justify-between py-1 pl-2 gap-2">
              {/* Top Row: Input */}
              <div
                  className={`flex items-center gap-3 rounded-xl transition-colors ${isDragOverUpload ? 'bg-orange-500/10 ring-2 ring-orange-500/50' : ''
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverUpload(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverUpload(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverUpload(false);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOverUpload(false);
                    const files = await getFilesFromDataTransfer(e.dataTransfer);
                    if (files.length) {
                      await addReferenceFiles(files);
                    }
                  }}
                  title="拖拽图片或文件夹到此处，可自动加入参考图"
              >
                {/* Image Upload Trigger */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                />

                {/* Thumbnails (up to 6) + Add button */}
                <div className="flex items-center gap-2 shrink-0">
                  {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative size-10 shrink-0 group">
                        <img
                            src={img}
                            alt={`Reference ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-[#36383C] cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setPreviewImageIndex(idx);
                              setShowImagePreview(true);
                            }}
                            title="点击查看大图"
                        />
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUploadedImageAt(idx);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-black border border-white/20 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                            title="移除"
                        >
                          <XIcon />
                        </button>
                      </div>
                  ))}

                  {uploadedImages.length < 20 && (
                      <button
                          onClick={triggerFileUpload}
                          className="size-10 rounded-lg bg-[#2A2C30] hover:bg-[#36383C] text-gray-400 flex items-center justify-center transition shrink-0"
                          title={`上传参考图（最多 20 张，当前 ${uploadedImages.length} 张）`}
                          type="button"
                      >
                        <PlusIcon />
                      </button>
                  )}

                  {uploadedImages.length > 0 && (
                      <button
                          onClick={clearUploadedImages}
                          className="h-10 px-3 rounded-lg bg-[#2A2C30] hover:bg-[#36383C] text-gray-400 hover:text-white text-xs font-medium transition"
                          title="清空参考图"
                          type="button"
                      >
                        清空
                      </button>
                  )}
                </div>

                <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={uploadedImages.length ? "描述如何修改这些图片..." : "描述你想象的电影画面..."}
                    className="bg-transparent w-full outline-none text-sm text-gray-200 placeholder-gray-500"
                />
              </div>

              {/* Bottom Row: Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom Control */}
                <div className="flex items-center bg-[#2A2C30] rounded-lg px-2 py-1.5 text-xs font-medium text-gray-300">
                  <button
                      onClick={() => setZoomIndex(prev => Math.max(0, prev - 1))}
                      disabled={zoomIndex === 0}
                      className="px-1.5 hover:text-white transition-colors disabled:opacity-30"
                  >−</button>
                  <span className="px-2 border-l border-r border-white/5 text-gray-400 min-w-[36px] text-center">
                  {ZOOM_OPTIONS[zoomIndex].label}
                </span>
                  <button
                      onClick={() => setZoomIndex(prev => Math.min(ZOOM_OPTIONS.length - 1, prev + 1))}
                      disabled={zoomIndex === ZOOM_OPTIONS.length - 1}
                      className="px-1.5 hover:text-white transition-colors disabled:opacity-30"
                  >+</button>
                </div>

                {/* Aspect Ratio Control with Popup */}
                <button
                    ref={ratioMenuRef}
                    onClick={() => setShowRatioMenu(!showRatioMenu)}
                    className="relative bg-[#2A2C30] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#36383C] transition-colors flex items-center gap-2"
                >
                  <AspectRatioIcon /> {aspectRatio}
                  {/* Popup Menu */}
                  {showRatioMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-full min-w-[80px] bg-[#1B1D20] border border-[#2A2C30] rounded-xl overflow-hidden shadow-xl z-50">
                        {["16:9", "9:16", "1:1"].map(ratio => (
                            <div
                                key={ratio}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAspectRatio(ratio);
                                  setShowRatioMenu(false);
                                }}
                                className={`px-3 py-2 hover:bg-[#2A2C30] cursor-pointer text-center ${aspectRatio === ratio ? 'text-orange-400 font-bold' : 'text-gray-400'}`}
                            >
                              {ratio}
                            </div>
                        ))}
                      </div>
                  )}
                </button>

                {/* Resolution Control with Popup (NEW) */}
                <button
                    ref={resMenuRef}
                    onClick={() => setShowResMenu(!showResMenu)}
                    className="relative bg-[#2A2C30] px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-[#36383C] transition-colors flex items-center gap-2"
                >
                  <ResolutionIcon /> {resolution}
                  {/* Popup Menu */}
                  {showResMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-full min-w-[80px] bg-[#1B1D20] border border-[#2A2C30] rounded-xl overflow-hidden shadow-xl z-50">
                        {["1K", "2K", "极速2k"].map(res => (
                            <div
                                key={res}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResolution(res);
                                  setShowResMenu(false);
                                }}
                                className={`px-3 py-2 hover:bg-[#2A2C30] cursor-pointer text-center ${resolution === res ? 'text-orange-400 font-bold' : 'text-gray-400'}`}
                            >
                              {res}
                            </div>
                        ))}
                      </div>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Camera & Generate */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#2A2C30]">
              {/* Camera Selector Trigger */}
              <button
                  id="camera-trigger"
                  onClick={() => setShowCameraList(!showCameraList)}
                  className={`
                 w-48 h-full bg-[#0F1113] border rounded-xl p-3 text-left flex items-center justify-between group transition-all
                 ${showCameraList ? 'border-orange-500/60 bg-[#16181b] shadow-[0_0_20px_rgba(255,107,53,0.2)]' : 'border-[#2A2C30] hover:border-gray-500'}
               `}
              >
                <div className="overflow-hidden w-full">
                  <div className="text-xs font-bold text-gray-200 truncate mb-0.5">{cameraSetup.body.name}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 truncate">
                    <span>{cameraSetup.focalLength.value}</span>
                    <span className="size-0.5 rounded-full bg-gray-600"></span>
                    <span>{cameraSetup.aperture.value}</span>
                    {cameraSetup.angle.id !== 'none' && (
                        <>
                          <span className="size-0.5 rounded-full bg-gray-600"></span>
                          <span className="text-orange-400">{cameraSetup.angle.name}</span>
                        </>
                    )}
                  </div>
                </div>
                <div className="size-6 shrink-0 rounded-full bg-[#1B1D20] border border-[#2A2C30] text-orange-500 flex items-center justify-center text-xs group-hover:scale-110 transition-transform ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                </div>
              </button>

              {/* Generate Button */}
              <button
                  onClick={handleGenerate}
                  disabled={isButtonGenerating}
                  className={`
                 h-full px-8 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-200 flex flex-col items-center justify-center min-w-[140px]
                 ${isButtonGenerating
                      ? 'bg-[#2A2C30] text-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-orange-500 text-black hover:brightness-110 hover:bg-orange-400 shadow-[0_0_25px_rgba(255,107,53,0.35)] active:scale-95 cursor-pointer'
                  }
               `}
              >
                <div className="flex items-center gap-2 text-base">
                  {isButtonGenerating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                  ) : (
                      <>
                        生成 <SparklesIcon />
                      </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 图片预览模态框 */}
        {showImagePreview && uploadedImages.length > 0 && (
            <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowImagePreview(false)}
            >
              <div className="relative max-w-8xl max-h-full">
                <img
                    src={uploadedImages[Math.min(previewImageIndex, uploadedImages.length - 1)]}
                    alt="预览大图"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
                <button
                    onClick={() => setShowImagePreview(false)}
                    className="absolute -top-3 -right-3 bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors"
                    title="关闭预览"
                >
                  <XIcon />
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default App;