import { CameraBody, FocalLengthConfig, ApertureConfig, CameraFilter, CameraAngle } from './types';

export const CAMERA_ANGLES: CameraAngle[] = [
  {
    id: 'none',
    name: '默认视角',
    description: '不指定特殊视角，AI 自由发挥。',
    promptContext: ''
  },
  {
    id: 'quad-grid',
    name: '4宫格',
    description: '一张图内以2×2宫格展示原图、左90°、右90°、反打180°四个视角。',
    promptContext: `【4宫格多视角生成】：请在一张图片中生成2×2的四宫格布局，四个格子之间用细白线分隔。四个格子分别展示同一场景的不同视角：
左上格：保持原始视角不变，直接展示场景原貌。
右上格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向左转移90度，进行图片左侧内容的联想，展现出左侧的场景样貌图，同时也需要控制右侧部分内容不会被展示。
左下格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向右转移90度，进行图片右侧内容的联想，展现出右侧的场景样貌图，同时也需要控制左侧部分内容不会被展示。
右下格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向后转移180度角，进行扩展联想，展现出对面场景样貌图。
要求：四个格子大小相等，布局整齐，场景风格、光照、色调保持一致。图片内不要出现任何文字标注。`
  },
  {
    id: 'hex-grid',
    name: '6宫格',
    description: '一张图内以2×3宫格展示左、右、反打、近景、远景、核心区域六个视角。',
    promptContext: `【6宫格多视角生成】：请在一张图片中生成2×3的六宫格布局（2列3行），六个格子之间用细白线分隔。六个格子分别展示同一场景的不同视角：
第1行左格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向左转移90度，进行图片左侧内容的联想，展现出左侧的场景样貌图，同时也需要控制右侧部分内容不会被展示。
第1行右格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向右转移90度，进行图片右侧内容的联想，展现出右侧的场景样貌图，同时也需要控制左侧部分内容不会被展示。
第2行左格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向后转移180度角，进行扩展联想，展现出对面场景样貌图。
第2行右格：这是一张场景图片，我现在需要你将视角镜头拉近，向中心聚焦，展示截取后的样貌图。
第3行左格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角镜头拉远50%，扩展场景图四周的环境。
第3行右格：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考将视角镜头聚焦到场景图中的核心元素的部分，展现该元素的近景样貌图。
要求：六个格子大小相等，布局整齐，场景风格、光照、色调保持一致。图片内不要出现任何文字标注。`
  },
  {
    id: 'left',
    name: '向左 90°',
    description: '视角向左转移 90 度，展现左侧场景。',
    promptContext: '【左】：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向左转移90度，进行图片左侧内容的联想，展现出左侧的场景样貌图，同时也需要控制右侧部分内容不会被展示'
  },
  {
    id: 'right',
    name: '向右 90°',
    description: '视角向右转移 90 度，展现右侧场景。',
    promptContext: '【右】：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向右转移90度，进行图片右侧内容的联想，展现出右侧的场景样貌图，同时也需要控制左侧部分内容不会被展示'
  },
  {
    id: 'reverse',
    name: '反向 180°',
    description: '视角向后转移 180 度，展现对面场景。',
    promptContext: '【反打】：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角向后转移180度角，进行扩展联想，展现出对面场景样貌图'
  },
  {
    id: 'push-in',
    name: '近景 (推进)',
    description: '镜头拉近，向中心聚焦。',
    promptContext: '【近景（推进）】：这是一张场景图片，我现在需要你将视角镜头拉近，向中心聚焦，展示截取后的样貌图'
  },
  {
    id: 'pull-out',
    name: '远景 (拉远)',
    description: '镜头拉远 50%，扩展四周环境。',
    promptContext: '【远景（拉远）】：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考现在视角镜头拉远50%，扩展场景图四周的环境'
  },
  {
    id: 'core',
    name: '核心区域',
    description: '聚焦核心元素，展现近景样貌。',
    promptContext: '【核心区域】：这是一张场景图片，我现在需要你先理解这一张图片所处的场景信息，然后思考将视角镜头聚焦到场景图中的核心元素的部分，展现该元素的近景样貌图'
  }
];

export const CAMERA_BODIES: CameraBody[] = [
  {
    id: 'venice',
    name: 'Sony Venice 2',
    description: '全画幅 8.6K 传感器，现代电影工业标准，高动态范围，色彩还原精准。',
    promptContext: 'CAMERA: Sony Venice 2 with full-frame 8.6K sensor. VISUAL CHARACTERISTICS: Ultra-clean digital image with near-zero noise floor. 16+ stops dynamic range with dual-gain architecture. Color science features neutral-to-cool shadows, warm highlights, and accurate skin tones. Extremely sharp with pristine micro-contrast. No halation or bloom. Modern clinical aesthetic with deep blacks and clean highlights. Used in: Top Gun: Maverick, Avatar 2. Look for: Crisp edges, high fidelity, rich shadow detail, smooth highlight roll-off, natural color reproduction.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
  {
    id: 'imax',
    name: 'IMAX 15/70',
    description: '70mm 胶片，极致分辨率，史诗般的颗粒感和景深。',
    promptContext: 'CAMERA: IMAX 15/70mm film camera (70mm film, 15 perforations horizontal). VISUAL CHARACTERISTICS: Extremely high resolution (12K+ equivalent). Fine organic film grain visible on close inspection. Shallow depth of field for ultra-wide shots. Epic sense of scale and grandeur. Rich texture and density. Exaggerated perspective and immense depth. Warm color saturation with increased contrast. Subtle vignetting at frame edges. Used in: The Dark Knight, Oppenheimer. Look for: Massive scale, film grain texture, deep shadows, rich highlights, immersive grandiosity, organic film feel.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
  {
    id: 'alexa',
    name: 'Arri Alexa Mini',
    description: 'Super 35 传感器，传奇的色彩科学，肤色柔和自然，高光滚降平滑。',
    promptContext: 'CAMERA: ARRI Alexa Mini with Super 35mm sensor. VISUAL CHARACTERISTICS: Legendary ARRI color science with soft highlight roll-off (no hard clipping). Natural and pleasing skin tones with slight warmth. 14+ stops dynamic range with clean shadows. Organic look with subtle digital noise at high ISO. Moderate sharpness with gentle contrast. Slight green/magenta separation in shadows. Used in: 90% of Hollywood films. Look for: Soft film-like highlight transitions, natural skin tones, clean shadows, organic texture, gentle contrast, cinematic warmth.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
  {
    id: 'komodo',
    name: 'RED Komodo',
    description: '全局快门，锐利且对比度高，适合动作和充满活力的场景。',
    promptContext: 'CAMERA: RED Komodo 6K with global shutter. VISUAL CHARACTERISTICS: Global shutter eliminates rolling shutter artifacts (no skew/jello). Punchy and vibrant colors with RED IPP2 color science. High contrast with hard edge definition. Clinical sharpness with enhanced micro-contrast. Slightly cooler color temperature. Aggressive look that pops. Clean at high ISOs. Used in: Fast-paced action, music videos, commercials. Look for: Crisp edges, high contrast, vibrant saturation, sharp details, clean motion rendering, modern digital aesthetic.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
  {
    id: '16mm',
    name: 'Bolex 16mm',
    description: '复古 16mm 胶片机，明显的颗粒感，边缘模糊，怀旧风格。',
    promptContext: 'CAMERA: Vintage Bolex H16 reflex 16mm film camera. VISUAL CHARACTERISTICS: Heavy and coarse film grain throughout. Soft focus with reduced sharpness. Significant lens vignetting (dark corners). Occasional light leaks and flares. Motion blur on fast movement. Lower fidelity with muted contrast. Scratches and dust artifacts possible. Warm/sepia color shift. Nostalgic home-movie aesthetic. Used in: Moonlight, The Lighthouse. Look for: Visible grain structure, soft details, dark corners, organic imperfections, warm vintage tones, nostalgic authenticity.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
  {
    id: 'vhs',
    name: 'Camcorder VHS',
    description: '90年代家用录像机，低保真，色差干扰，扫描线效果。',
    promptContext: 'CAMERA: 1990s consumer VHS camcorder. VISUAL CHARACTERISTICS: Low resolution (~320x240 equivalent) with soft details. Visible horizontal scan lines and interlacing artifacts. Chromatic aberration (color fringing) especially on high-contrast edges. Tracking errors and tape glitches. Magnetic tape noise with static. Washed-out colors with poor color accuracy. Bleeding highlights. Motion blur and ghosting. Low contrast with crushed blacks. Glitch aesthetic. Used in: Horror movies, nostalgia content. Look for: Scan lines, color bleeding, soft low-res look, tracking errors, static noise, retro 90s home video feel.',
    imageUrl: 'https://em-content.zobj.net/source/microsoft-teams/337/camera_1f4f7.png'
  },
];

export const FOCAL_LENGTH_OPTIONS: FocalLengthConfig[] = [
  {
    id: '14mm',
    value: '14mm',
    name: '14mm 超广角',
    description: '极其宽广的视野，极强的透视变形，主体与背景距离感拉大。',
    promptContext: 'FOCAL LENGTH: 14mm ultra-wide angle. FIELD OF VIEW: ~114° diagonal - extremely expansive. PERSPECTIVE: Extreme perspective distortion - objects close to lens appear HUGE, distant objects appear tiny. Dramatic size relationships. SPATIAL EFFECT: Subject feels small and isolated in vast environment. Background elements appear pushed far away. DISTORTION: Significant barrel distortion - straight lines curve at edges. FACE DISTORTION: Features at edges stretch; nose appears enlarged if close. BEST FOR: Epic landscapes, interior architecture, cramped spaces, establishing shots, exaggerating scale. VISUAL EFFECT: Grand, expansive, dramatic perspective that emphasizes environment over subject.'
  },
  {
    id: '24mm',
    value: '24mm',
    name: '24mm 广角',
    description: '风景和环境人像，视野开阔，有冲击力。',
    promptContext: 'FOCAL LENGTH: 24mm wide angle. FIELD OF VIEW: ~84° diagonal - very wide but manageable. PERSPECTIVE: Noticeable but controlled wide-angle perspective. Subject has breathing room. SPATIAL EFFECT: Background is visible and contextual but not overwhelming. Good environmental storytelling. DISTORTION: Mild barrel distortion at frame edges. FACE DISTORTION: Minimal if subject centered. BEST FOR: Street photography, environmental portraits, travel, documentary, landscapes. VISUAL EFFECT: Natural wide view with context, classic "storytelling" focal length.'
  },
  {
    id: '35mm',
    value: '35mm',
    name: '35mm 人文',
    description: '经典纪实视角，适中的环境感，最接近双眼关注点。',
    promptContext: 'FOCAL LENGTH: 35mm classic documentary. FIELD OF VIEW: ~63° diagonal - natural field of view. PERSPECTIVE: Similar to human vision with both eyes. Most "normal" wide-angle look. SPATIAL EFFECT: Balanced subject and environment. Subject is clearly placed in context. DISTORTION: Minimal and unobjectionable. BEST FOR: Documentary, street photography, photojournalism, environmental storytelling. VISUAL EFFECT: Honest, realistic representation with environmental context - the "human perspective" lens.'
  },
  {
    id: '50mm',
    value: '50mm',
    name: '50mm 标准',
    description: '人眼视角，真实的透视关系，畸变极小。',
    promptContext: 'FOCAL LENGTH: 50mm standard. FIELD OF VIEW: ~47° diagonal - matches single-eye vision. PERSPECTIVE: Completely natural and realistic. No perspective exaggeration. SPATIAL EFFECT: Subject and background appear in natural proportion. DISTORTION: Zero geometric distortion. FLATTERING: Neutral - neither flattering nor unflattering. BEST FOR: Portraits, products, general photography, candid shots. VISUAL EFFECT: "What you see is what you get" - honest, realistic reproduction of scene.'
  },
  {
    id: '85mm',
    value: '85mm',
    name: '85mm 人像',
    description: '特写首选，压缩空间，背景拉近，主体分离。',
    promptContext: 'FOCAL LENGTH: 85mm portrait telephoto. FIELD OF VIEW: ~28° diagonal - narrow and selective. PERSPECTIVE: Flattering compression - facial features appear slightly flattened and more proportionate. SPATIAL COMPRESSION: Background appears closer/larger than in reality, creating subject-background relationship. DEPTH SEPARATION: Enhanced - shallow DOH at this focal length isolates subject. DISTORTION: None. BEST FOR: Headshots, portraits, fashion, detail shots. VISUAL EFFECT: Professional portrait look with subject separation and gentle background compression.'
  },
  {
    id: '135mm',
    value: '135mm',
    name: '135mm 长焦',
    description: '强烈的空间压缩感，背景像一堵墙一样贴在主体身后。',
    promptContext: 'FOCAL LENGTH: 135mm short telephoto. FIELD OF VIEW: ~18° diagonal - very selective. PERSPECTIVE: Strong compression - background elements appear much closer to subject. SPATIAL COMPRESSION: Background feels like a "wall" behind subject. Creates layered, flat look. DEPTH SEPARATION: Maximum - background completely separates from subject. DISTORTION: None. BEST FOR: Tight portraits, sports, wildlife, detail extraction. VISUAL EFFECT: Intimate, compressed look with strong subject isolation and "flat" background planes.'
  },
  {
    id: '200mm',
    value: '200mm',
    name: '200mm 超长焦',
    description: '极致的空间压缩，仅仅拍摄主体局部，背景完全抽象化。',
    promptContext: 'FOCAL LENGTH: 200mm super-telephoto. FIELD OF VIEW: ~12° diagonal - extremely narrow slice of world. PERSPECTIVE: Extreme compression - multiple background layers collapse into single plane. SPATIAL COMPRESSION: Maximum flattening effect. Background becomes abstract color/texture. SUBJECT ISOLATION: Complete - subject floats in void. DISTORTION: None. BEST FOR: Extreme close-ups, wildlife, sports, detail abstraction. VISUAL EFFECT: Binocular-like view with total subject isolation and abstracted background - "extracted" look.'
  }
];

export const APERTURE_OPTIONS: ApertureConfig[] = [
  {
    id: 'f0.95',
    value: 'f/0.95',
    name: 'f/0.95 梦幻',
    description: '被称为"夜神"，景深薄如纸，背景完全融化成光斑。',
    promptContext: 'APERTURE: f/0.95 (ultra-fast prime). DEPTH OF FIELD: Extremely thin - only a few millimeters in focus at close distance. Only eyes (or single focal point) are razor sharp; nose and ears are already soft. BOKEH: Background completely melts into large, circular, dreamy orbs of color. No discernible background details. SUBJECT ISOLATION: Maximum separation - subject floats in void. Low-light capability: Excellent - captures images in near darkness. BEST FOR: Extreme close-up portraits, artistic abstract, dream sequences, night photography. VISUAL EFFECT: Ethereal, intimate, painterly background abstraction.'
  },
  {
    id: 'f1.4',
    value: 'f/1.4',
    name: 'f/1.4 大光圈',
    description: '刀锐奶化，主体极其突出，背景柔美虚化。',
    promptContext: 'APERTURE: f/1.4 (fast prime). DEPTH OF FIELD: Very shallow - eyelashes in focus, ears soft. BOKEH: Creamy, smooth circular highlights. Background blurred but color and form are visible. SUBJECT ISOLATION: Strong - subject pops against soft background. Low-light capability: Very good - clean low-light shots. BEST FOR: Classic portraits, headshots, moody cinematic scenes. VISUAL EFFECT: Professional "fast prime" look with creamy background separation, razor-sharp subject details.'
  },
  {
    id: 'f2.8',
    value: 'f/2.8',
    name: 'f/2.8 电影感',
    description: '电影常用的光圈值，主体清晰，背景有适度分离感。',
    promptContext: 'APERTURE: f/2.8 (standard cinema zoom). DEPTH OF FIELD: Shallow but manageable - entire face in focus at portrait distance. BOKEH: Soft and pleasing. Background context visible but gentle. SUBJECT ISOLATION: Moderate - clear subject-background relationship. Low-light capability: Good. BEST FOR: Standard cinema, narrative films, talking head shots. VISUAL EFFECT: Classic Hollywood cinematic look with subject focus and environmental context.'
  },
  {
    id: 'f4',
    value: 'f/4',
    name: 'f/4 通用',
    description: '最佳锐度光圈，景深适中，画面扎实清晰。',
    promptContext: 'APERTURE: f/4 (sweet spot). DEPTH OF FIELD: Moderate - person fully sharp from nose to ears, background slightly soft. BOKEH: Minimal - background elements recognizable. SHARPNESS: Optimal - lens peak performance. SUBJECT ISOLATION: Subtle - background not distracting. BEST FOR: Travel photography, product shots, general purpose, commercial work. VISUAL EFFECT: Clean, crisp, high-fidelity look with maximum detail and clarity.'
  },
  {
    id: 'f5.6',
    value: 'f/5.6',
    name: 'f/5.6 纪实',
    description: '主体和环境都相对清晰，适合叙事。',
    promptContext: 'APERTURE: f/5.6 (documentary standard). DEPTH OF FIELD: Good depth - subject and immediate surroundings sharp. BOKEH: Minimal separation - background context clear. SHARPNESS: Excellent across frame. SUBJECT ISOLATION: Minimal - environmental storytelling emphasis. BEST FOR: Documentary, street photography, environmental portraits, photojournalism. VISUAL EFFECT: Natural, realistic representation of scene with clear context and details.'
  },
  {
    id: 'f11',
    value: 'f/11',
    name: 'f/11 全深',
    description: '远近都清晰，适合风景或大场景，无虚化。',
    promptContext: 'APERTURE: f/11 (deep focus). DEPTH OF FIELD: DEEP FOCUS - everything from foreground to background is sharp. BOKEH: None - no background blur. SHARPNESS: Edge-to-edge sharpness. BEST FOR: Landscapes, architecture, group shots, deep composition (Wes Anderson style). VISUAL EFFECT: Everything equally important and clear, no visual hierarchy, detailed and clinical look.'
  }
];

export const CAMERA_FILTERS: CameraFilter[] = [
  {
    id: 'std',
    name: '标准色彩',
    description: '中性，自然，还原真实场景。',
    previewColor: '#9CA3AF',
    promptContext: 'Color Grade: Standard Natural. Visuals: True-to-life colors, neutral white balance, standard contrast curve, realistic lighting.'
  },
  {
    id: 'teal-orange',
    name: '青橙色调',
    description: '好莱坞大片质感，冷色阴影暖色高光。',
    previewColor: '#F97316',
    promptContext: 'Color Grade: Teal & Orange Blockbuster. Visuals: Cyan/Blue shadows and Warm/Orange highlights, high contrast, hollywood action movie look, complementary color separation.'
  },
  {
    id: 'bw-noir',
    name: '黑色电影',
    description: '高对比度黑白，神秘，压抑，戏剧性光影。',
    previewColor: '#1F2937',
    promptContext: 'Color Grade: Film Noir B&W. Visuals: Black and white photography, high contrast, dramatic chiaroscuro lighting, deep shadows, moody atmosphere, silver halide texture.'
  },
  {
    id: 'portra',
    name: 'Portra 400',
    description: '温暖，肤色透亮，稍微过曝的胶片质感。',
    previewColor: '#FCD34D',
    promptContext: 'Color Grade: Kodak Portra 400 Simulation. Visuals: Warm pastel tones, fine grain, glowing highlights, vibrant but natural skin tones, slightly overexposed film look.'
  },
  {
    id: 'cyber',
    name: '赛博朋克',
    description: '霓虹色调，高饱和度紫红与青蓝。',
    previewColor: '#D946EF',
    promptContext: 'Color Grade: Cyberpunk Neon. Visuals: High saturation, dominant Magenta, Purple and Cyan lighting, dark futuristic atmosphere, neon glow effects.'
  },
  {
    id: 'vintage',
    name: '复古泛黄',
    description: '低饱和，褐色调，褪色老照片的感觉。',
    previewColor: '#78350F',
    promptContext: 'Color Grade: Vintage Sepia. Visuals: Low saturation, brown/sepia tint, faded blacks, aged paper texture, retro 70s vibe.'
  },
];

// Re-defined to emphasize "Distance" which changes perspective when combined with Focal Length
export const ZOOM_OPTIONS = [
  { label: '0.5x', value: 'Wide', prompt: 'Subject Distance: Far / Wide Shot. Establish the location.' },
  { label: '1x', value: 'Standard', prompt: 'Subject Distance: Medium Shot. Waist-up or full body.' },
  { label: '2x', value: 'Close-up', prompt: 'Subject Distance: Close-up. Head and shoulders.' },
  { label: '3x', value: 'Macro', prompt: 'Subject Distance: Extreme Close-up / Macro. Texture focus.' },
];

export const ACCENT_COLOR = '#D1FE17';