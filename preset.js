var presets = [
  {
    id: 'figure',
    title: '피규어로 변환',
    description:
      '사진을 캐릭터 피규어로 변환합니다. 박스와 블렌더 모델링 화면을 함께 연출합니다.',
    prompt:
      "Transform a photo into a character figure. Place a box behind it with the character's image printed on it, plus a computer screen showing the Blender modeling process. Add a round plastic base under the figure, and set the whole scene indoors if possible.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'idol-photo',
    title: '아이돌과 함께 사진',
    description:
      '두 사람을 스타일리시한 배경과 함께 하나의 이미지로 합성합니다.',
    prompt:
      'Combine two people into a single image with a stylish, cool background.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: '3d-visual',
    title: '3D 공간 시각화',
    description:
      '실루엣 내부에 시안색 와이어프레임 메쉬를 그려 3D 형태를 표현합니다.',
    prompt:
      'Draw a cyan wireframe mesh inside the silhouette to reveal the 3D shape.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'colorize',
    title: '흑백 사진 컬러화',
    description: '흑백 사진을 컬러풀한 사진으로 변환합니다.',
    prompt: 'Turn a black-and-white photo into a colorful one.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'studio',
    title: 'AI 포토 스튜디오',
    description: '스튜디오 조명과 함께 의자에 앉은 포즈로 촬영합니다.',
    prompt: 'Have the woman sit on a chair with proper studio lighting.',
    imageCount: 1,
    category: '스튜디오',
  },
  {
    id: 'ecommerce',
    title: '이커머스 제품 장면',
    description:
      '제품을 교체하고 배경 요소를 변경하여 상업적인 장면을 만듭니다.',
    prompt:
      'Swap the Coca-Cola in her hand for a Pepsi. Replace the black bag with a yellow one from another image, and change the chair to match a different reference.',
    imageCount: 'multiple',
    category: '상업',
  },
  {
    id: 'bg-change',
    title: '배경 변경',
    description: '인물을 다른 배경 이미지에 합성합니다.',
    prompt: 'Place the woman into the background of the first image.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'cover',
    title: '커버 디자인',
    description: '텍스트와 함께 YouTube 썸네일을 만듭니다.',
    prompt:
      'Create a YouTube thumbnail of the woman in smart glasses with the text "Nano Banana".',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'logo-ext',
    title: '로고 확장',
    description: '로고를 다양한 제품에 적용하고 색상을 변경합니다.',
    prompt:
      'Place the logo on the hat and bag from the second image, and change the text color to white.',
    imageCount: 2,
    category: '브랜딩',
  },
  {
    id: 'photorealistic',
    title: '실사형 장면',
    description:
      '카메라 각도, 렌즈, 조명을 지정하여 사실적인 이미지를 생성합니다.',
    prompt:
      'A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format.',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'sticker',
    title: '세련된 삽화 및 스티커',
    description: '투명 배경의 스티커, 아이콘 또는 애셋을 만듭니다.',
    prompt:
      'A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. The design should have [line style] and [shading style]. The background must be transparent.',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'text-render',
    title: '정확한 텍스트 렌더링',
    description:
      'Gemini의 텍스트 렌더링 능력을 활용하여 명확한 텍스트를 포함한 이미지를 생성합니다.',
    prompt:
      'Create a [image type] for [brand/concept] with the text "[text to render]" in a [font style]. The design should be [style description], with a [color scheme].',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'product',
    title: '제품 모형 및 상업용 사진',
    description:
      '전문적인 제품 사진을 위한 스튜디오 라이팅과 구성을 설정합니다.',
    prompt:
      'A high-resolution, studio-lit product photograph of a [product description] on a [background surface/description]. The lighting is a [lighting setup, e.g., three-point softbox setup] to [lighting purpose]. The camera angle is a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio].',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'minimal',
    title: '미니멀리스트 디자인',
    description: '네거티브 스페이스를 활용한 깔끔한 배경을 만듭니다.',
    prompt:
      'A minimalist composition featuring a single [subject] positioned in the [bottom-right/top-left/etc.] of the frame. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting. [Aspect ratio].',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'comic',
    title: '연속 아트 (만화/스토리보드)',
    description: '시각적 스토리텔링을 위한 만화 패널을 만듭니다.',
    prompt:
      'A single comic book panel in a [art style] style. In the foreground, [character description and action]. In the background, [setting details]. The panel has a [dialogue/caption box] with the text "[Text]". The lighting creates a [mood] mood. [Aspect ratio].',
    imageCount: 1,
    category: '템플릿',
  },
  {
    id: 'add-remove',
    title: '요소 추가 및 삭제',
    description: '이미지의 특정 요소를 추가하거나 제거합니다.',
    prompt:
      'Using the provided image of [subject], please [add/remove/modify] [element] to/from the scene. Ensure the change is [description of how the change should integrate].',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'inpainting',
    title: '인페인팅 (부분 수정)',
    description: '이미지의 특정 부분만 수정하고 나머지는 그대로 유지합니다.',
    prompt:
      'Using the provided image, change only the [specific element] to [new element/description]. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'style-transfer',
    title: '스타일 전이',
    description: '이미지를 다른 예술적 스타일로 재현합니다.',
    prompt:
      'Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'multi-combine',
    title: '고급 합성: 여러 이미지 결합',
    description: '여러 이미지의 요소들을 결합하여 새로운 장면을 만듭니다.',
    prompt:
      'Create a new image by combining the elements from the provided images. Take the [element from image 1] and place it with/on the [element from image 2]. The final image should be a [description of the final scene].',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'preserve-detail',
    title: '세부사항 보존 편집',
    description: '얼굴이나 로고 같은 중요한 세부사항을 보존하면서 편집합니다.',
    prompt:
      'Using the provided images, place [element from image 2] onto [element from image 1]. Ensure that the features of [element from image 1] remain completely unchanged. The added element should [description of how the element should integrate].',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'floorplan-to-3d',
    title: '평면도를 3D 렌더링으로',
    description:
      '건축 평면도를 3D 렌더링된 탑다운 뷰와 특정 관점의 이미지로 변환합니다.',
    prompt:
      'Generate a 3D rendered architectural top-down view from a floor plan, then generate a rendered image from a specified perspective.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'text-edit',
    title: '이미지 속 텍스트 수정',
    description:
      '이미지 내의 텍스트를 동일한 글꼴과 스타일을 유지하며 다른 단어로 변경합니다.',
    prompt:
      "'Love' is written on the screen instead of signal. Keep the same font/style.",
    imageCount: 1,
    category: '편집',
  },
  {
    id: '3d-cutaway-diagram',
    title: '3D 분해도 다이어그램',
    description:
      '복잡한 기계(자동차 엔진 등)의 작동 원리를 보여주는 3D 분해도 디자인 다이어그램을 생성합니다.',
    prompt:
      'Draw a 3D cutaway design diagram showcasing the working principle of a car engine, meticulously presenting its internal structure in a highly realistic manner. Each component is disassembled and arranged in an orderly fashion, with each part featuring clear English labels indicating the structural name and functional description. The overall layout combines professionalism with visual logic, presenting a clear, neat, and highly technological analytical schematic diagram.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'organ-model',
    title: '인체 장기 3D 모델',
    description:
      '학술 발표에 적합한 주석과 설명이 포함된 매우 사실적인 인간 심장 3D 모델을 생성합니다.',
    prompt:
      'Draw a 3D model of human organs to showcase an example of the heart for academic presentation, with annotations and explanations, suitable for demonstrating its principles and the function of each organ, extremely realistic, highly restored, with a design of very fine and meticulous detail.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'isometric-landmark',
    title: '아이소메트릭 랜드마크',
    description:
      '지도상의 실제 위치를 기반으로 특정 게임 스타일의 아이소메트릭 빌딩 이미지를 만듭니다.',
    prompt:
      'Take this location and make the landmark an isometric image (building only), in the style of the game Theme Park.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'dem-to-real',
    title: '지형 모델 실사 변환',
    description:
      '디지털 표고 모델(DEM)과 등고선 지도를 실제와 같은 풍경 이미지로 변환합니다.',
    prompt:
      'Draw a DEM with contour lines, then draw the real world view from the red circle in the direction of the arrow.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'map-to-photo',
    title: '지도에서 실사 이미지로',
    description:
      '지도 이미지와 특정 지점을 기반으로 해당 장소의 실제 사진을 생성합니다.',
    prompt: 'draw what the red arrow sees',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-edit-multiple',
    title: '사진 다중 편집',
    description:
      '얼굴 표정, 손 추가, 배경 변경 등 한 번의 프롬프트로 이미지의 여러 요소를 수정합니다.',
    prompt:
      'Make my face as if I was surprised. Also add my two hands on the sides of my face. Chage also the background to a blue gradient.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'pose-change',
    title: '자세 및 소품 변경',
    description:
      '인물의 자세를 바꾸고 소품(카타나)을 추가하며, 네온 조명 효과를 더해 긴장감 있는 분위기를 연출합니다.',
    prompt:
      'Make her grip a katana with both hands, blade extended horizontally in front of her face, reflecting the neon glow, The pose is tense and ready-to-strike, her eyes locked...',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'ad-creation',
    title: '광고 이미지 제작',
    description:
      '이미지에 텍스트 카피를 추가하여 특정 브랜드(나이키) 스타일의 광고를 만듭니다.',
    prompt: 'Create a Nike ad with this image with text copy.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'professional-attire',
    title: '전문적인 모습으로 변환',
    description:
      '인물 사진을 전문적인 복장과 배경으로 변경하여 프로필 사진처럼 만듭니다.',
    prompt: 'Put him in a professional setting with a professional attire.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'perspective-change',
    title: '시점 변경',
    description:
      '이미지의 시점을 천장 모서리에서 내려다보는 듯한 하이앵글 뷰로 변경합니다.',
    prompt:
      'Change the perspective to a high angle, looking down from above as if from the ceiling corner.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'toy-concept',
    title: '피규어와 컨셉보드',
    description:
      '캐릭터 피규어의 배경에 스케치, 콘셉트 아트 등이 포함된 영감 보드를 추가합니다.',
    prompt:
      'Behind the figure, a large inspiration board full of sticky notes, sketches, material swatches, and early concept art for the toy.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'sketch-to-photo-animation',
    title: '스케치를 실사 및 애니메이션으로',
    description:
      '하나의 스케치를 사실적인 사진과 환상적인 애니메이션 스타일의 두 가지 다른 이미지로 변환합니다.',
    prompt:
      'Create a photorealistic version and a fantasy animation version based on the sketch.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'sketch-to-3d-render',
    title: '스케치를 3D 렌더링으로',
    description: '손으로 그린 스케치를 채색된 3D 렌더링 이미지로 변환합니다.',
    prompt: 'Convert the hand-drawn sketch into a colored 3D rendered image.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'logo-design-jp',
    title: '팝하고 친근한 로고',
    description:
      '주어진 키워드(행성)를 사용하여 팝하고 친근하며 다채로운 로고를 디자인합니다.',
    prompt: '행성\n팝하고 친근하며, 화려한 로고로 만들어 주세요!',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'photo-to-manga',
    title: '사진을 만화 배경으로',
    description:
      '실제 도시 풍경 사진을 흑백 만화 스타일의 배경으로 변환합니다.',
    prompt:
      'Convert the photo of the city into a black and white manga-style background.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'character-bag-composite',
    title: '캐릭터와 가방 합성',
    description:
      '두 개의 다른 이미지에서 캐릭터와 가방을 가져와 자연스럽게 합성합니다.',
    prompt:
      '첫 번째 소녀에게 이 가방을 어깨에 걸쳐 들게 해주세요. 소녀의 포즈는 가장 왼쪽에 서 있는 아이를 채택해 주세요.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'two-image-composite',
    title: '두 이미지 합성',
    description:
      '늑대 이미지와 캐릭터 이미지를 결합하여 캐릭터들이 늑대 등에 타고 있는 새로운 이미지를 만듭니다.',
    prompt: '첫 번째 큰 흰 늑대의 등에 두 캐릭터가 타고 있는 것처럼',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'character-to-manga-scene',
    title: '캐릭터를 만화 장면으로',
    description:
      '캐릭터의 포즈를 바꾸고, 만화 스타일(톤, 카케아미)로 변환한 후, 집중선과 효과음을 추가하여 역동적인 만화 장면을 연출합니다.',
    prompt:
      '이 캐릭터의 포즈를 낫을 휘두른 채 크게 점프하게 하세요. 만화책에 실린 듯한 느낌을 내기 위해 컬러 요소는 완전히 배제합니다. 명암은 톤이나 카케아미 등으로 표현해 주세요. 이미지에 흰색으로 집중선을 추가하세요. 미국 만화 스타일의 효과음을 넣으세요. ZUBAAAAAN!!!! 같은 거요.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: '2d-to-3d-figure',
    title: '2D 일러스트를 3D 피규어로',
    description:
      '2D 캐릭터 일러스트레이션을 사실적인 3D 피규어 스타일로 변환합니다.',
    prompt: 'Convert the 2D character illustration into a realistic 3D figure.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'character-turnaround',
    title: '캐릭터 턴어라운드 시트',
    description:
      '게임 캐릭터의 앞, 뒤, 옆모습을 포함한 턴어라운드 시트를 생성합니다.',
    prompt:
      'Generate a character turnaround sheet showing the front, back, and side views of the game character.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'scene-evolution',
    title: '장면 단계별 변환',
    description:
      '기본 3D 모델을 사실적인 인간 캐릭터로, 실사 배경으로, 그리고 마지막으로 게임 UI를 추가하여 단계적으로 변환합니다.',
    prompt: '1. "To human" 2. "To live-action" 3. "Add game UI"',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'game-screen-creation',
    title: '게임 스크린 생성',
    description:
      '단순한 배경의 캐릭터를 사실적으로 만들고, 게임 UI를 추가한 후, 용과 싸우는 장면으로 발전시킵니다.',
    prompt:
      '1. "Realistically" 2. "Add game UI" 3. "A screen of fighting a dragon"',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'facade-generation',
    title: '건물 파사드 생성',
    description:
      '집의 한쪽 면(북쪽 파사드) 사진을 기반으로 다른 쪽 면(서쪽 파사드)의 모습을 생성합니다.',
    prompt:
      'this is the north facade view of a house. generate the west facade view of this same house.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'disassemble-object',
    title: '사물 분해',
    description:
      '카메라 사진을 부품별로 분해된 모습으로 변환해달라고 요청합니다.',
    prompt: '분해해달라고 함!',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-to-magazine-cover',
    title: '사진을 잡지 커버로',
    description:
      '인물을 광대로 바꾸고, 사진의 구도를 조정한 후, 특정 카메라 스타일로 촬영된 것처럼 만들고, 최종적으로 TIME 잡지 커버로 디자인합니다.',
    prompt:
      'replace the man with clown, turn the clown to me, turn this to a photo (taken with Hasselblad X2D) and put it as a cover of the magazine TIME with the Header "The Age of Clowns"',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'painting-perspective-recreation',
    title: '명화 시점 재창조',
    description:
      "유명한 그림(에드워드 호퍼의 '나이트호크')을 바텐더의 시점에서 재창조합니다.",
    prompt: 'Recreate this painting from the perspective of the barkeeper.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-to-isometric',
    title: '사진을 아이소메트릭 모델로',
    description: '실제 건물 사진을 아이소메트릭 3D 모델 스타일로 변환합니다.',
    prompt: 'make isometric models',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-to-isometric-dark',
    title: '어두운 배경의 아이소메트릭 모델',
    description:
      '도시 풍경 사진을 어두운 파란색 그라데이션 배경의 아이소메트릭 모델로 변환합니다.',
    prompt: 'make isometric models, dark blue gradient background.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'scene-change-tennis',
    title: '테니스 경기장 변경',
    description:
      '테니스 치는 인물 사진의 배경을 US 오픈 경기장으로 변경합니다.',
    prompt: 'Change the background to the US Open tennis court.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'character-in-real-world',
    title: '캐릭터를 현실 세계로',
    description:
      '가상의 캐릭터를 수많은 카메라 기자들 앞에 서 있는 현실적인 코스프레 모습으로 변환합니다.',
    prompt:
      'Place the character in a real-world setting, as a cosplayer surrounded by photographers at a convention.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'remove-people',
    title: '이미지에서 인물 삭제',
    description:
      '거리 풍경 사진에서 사람들을 자연스럽게 제거해달라고 요청합니다.',
    prompt: '사람들을 지워줘!',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'politician-fighting-game',
    title: '인물을 격투 게임 캐릭터로',
    description:
      '두 정치인의 사진과 간단한 스틱맨 포즈를 기반으로 16비트 격투 게임 스타일의 장면을 만듭니다.',
    prompt:
      'Create a 16-bit fighting game scene with the two politicians based on their photos and the stick figure poses.',
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'multi-angle-shots',
    title: '다양한 카메라 앵글 생성',
    description:
      '하나의 이미지를 기반으로 와이드 샷, 트래킹 샷, 클로즈업 등 다양한 카메라 앵글의 장면들을 생성합니다.',
    prompt:
      "- Aerial Wide Shot: Capture the scene from above, revealing the forest, the sunlight rays, and the movement below.\n- Behind-the-Wolf Tracking Shot: Place the camera directly behind the wolf's back, following its run while showing the warrior's flowing cape.\n- Extreme Close-Up on the Wolf's Snarl: Zoom in on the wolf's open jaws, saliva flying, with the warrior's red cape slightly blurred in the background.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'night-to-day-isometric',
    title: '야경을 주간 아이소메트릭으로',
    description:
      '야간 거리 사진을 낮 시간대의 아이소메트릭 모델 이미지로 변환합니다.',
    prompt: 'Make Image Daytime and Isometric',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'character-to-comic',
    title: '캐릭터로 만화 제작',
    description:
      '두 캐릭터 이미지와 배경 이미지를 사용하여 특정 상황과 감정을 묘사하는 만화 장면을 만듭니다.',
    prompt:
      'Make a new image of Emily and Adam in image 1 standing in the mine in image 2. Adam should be on the left and Emily on the right. Adam has his hands up in a can you blame me look with his mouth very slightly open in smug smile while Emily has her arms crossed and looks upset glaring toward adam, match the characters lighting to the backgrounds lighting.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'character-pose-variation',
    title: '캐릭터 포즈 변환',
    description:
      '하나의 캐릭터 이미지를 사용하여 다양한 동작과 포즈를 가진 여러 이미지들을 생성합니다.',
    prompt: '캐릭터의 다양한 포즈 변환',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'food-enhancement',
    title: '음식 사진 보정',
    description:
      '햄버거 사진을 더 신선하고 먹음직스러우며 김이 나는 모습으로 만듭니다.',
    prompt: 'Make this burger look fresh, appetizing and steaming hot.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'deconstructed-food',
    title: '음식 분해 연출',
    description: '햄버거를 각 재료가 공중에 떠 있는 분해된 형태로 연출합니다.',
    prompt:
      'create a deconstructed shot of this burger, with each ingredient floating above one another.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'logo-spoof',
    title: '로고 패러디',
    description:
      '자동차 로고(재규어)의 텍스트와 동물의 머리를 다른 텍스트와 물체(바나나)로 변경하여 패러디 로고를 만듭니다.',
    prompt:
      'change the logo to say "ATOMIC GAINS" instead of "JAGUAR" and change animal head into a chrome banana.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'view-change-aerial',
    title: '시점 변환 (항공뷰)',
    description:
      '지상 레벨에서 촬영된 사진(식당, 도시)을 공중에서 내려다보는 항공뷰(버드아이뷰)로 변경합니다.',
    prompt: "Change this ground-level shot to an aerial bird's eye view.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'neon-sign-text-change',
    title: '네온사인 텍스트 변경',
    description:
      '네온사인 이미지의 텍스트를 다른 문구("LIKE & SUBSCRIBE")로 변경합니다.',
    prompt: 'change the text on the neon sign to "LIKE & SUBSCRIBE"',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'fashion-flat-lay',
    title: '패션 플랫레이 연출',
    description:
      '모델이 착용한 의상 전체를 제품별로 분리하여 보여주는 플랫레이 이미지를 생성합니다.',
    prompt: 'Just let him directly showcase all the outfit design products.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'storytelling-noir',
    title: '이미지로 스토리텔링',
    description:
      '두 캐릭터를 사용하여 텍스트 없이 12개의 이미지로 구성된 흑백 필름 느와르 탐정 이야기를 만듭니다.',
    prompt:
      'Create an addictively intriguing 12 part story with 12 images with these two characters in a classic black and white film noir detective story. Make it about missing treasure that they get clues for throughout and then finally discover. The story is thrilling throughout with emotional highs and lows and ending on a great twist and high note. Do not include any words or text on the images but tell the story purely through the imagery itself.',
    imageCount: 2,
    category: '스토리텔링',
  },
  {
    id: 'character-fight-scene',
    title: '캐릭터 격투 장면',
    description:
      '두 캐릭터와 스틱맨 포즈를 기반으로 적절한 시각적 배경과 상호작용이 포함된 격투 장면을 생성합니다.',
    prompt:
      'Have these two characters fight using the pose from Figure 3. Add appropriate visual backgrounds and scene interactions, Generated image ratio is 16:9.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'anime-resolution-enhancement',
    title: '애니메이션 해상도 향상',
    description:
      '오래된 애니메이션 이미지의 해상도를 높이고, 현대적인 애니메이션 기법으로 재해석하여 텍스처 디테일을 추가합니다.',
    prompt:
      'Enhance the resolution of this old anime image and add the appropriate texture details, reinterpreting it with modern anime techniques.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'day-to-night-lighting',
    title: '주간을 야간으로 조명 변경',
    description:
      '주간에 찍은 자동차 사진의 조명을 야간으로 변경하고 헤드라이트를 켭니다.',
    prompt:
      'change the lighting to night, and the headlights of the car are on.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'remove-people-half',
    title: '거리의 사람들 절반 제거',
    description: '붐비는 거리 장면에서 사람들의 절반을 제거합니다.',
    prompt: 'Remove half the people from this busy street scene',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'comic-book-style',
    title: '만화책 스트립 스타일',
    description: '사진을 만화책 스트립 스타일의 일러스트레이션으로 변환합니다.',
    prompt: 'comic book strip style',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'change-background-rollercoaster',
    title: '배경을 롤러코스터로 변경',
    description: '인물 사진의 배경을 롤러코스터 타는 장면으로 변경합니다.',
    prompt: 'change the background to a rollercoaster ride',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'product-to-ad',
    title: '제품 사진을 광고로 변환',
    description: '제품 사진을 세련된 마케팅 광고로 변환합니다.',
    prompt: 'Convert this product photo into a sleek marketing advertisement',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'mecha-bird',
    title: '메카 버드로 변환',
    description: '새 사진을 위협적인 메카 버드 이미지로 변환합니다.',
    prompt:
      'Make this bird a mecha bird that is hellbent on causing my imminent harm',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'sit-on-sofa',
    title: '소파에 인물 합성',
    description:
      '인물 사진을 배경 이미지의 소파에 앉아있는 것처럼 자연스럽게 합성합니다.',
    prompt: 'Woman is sitting on the sofa',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'map-to-isometric-360',
    title: '지도 건물을 아이소메트릭 360 영상으로',
    description:
      '구글 맵의 건물을 분리하여 아이소메트릭 스타일로 표현하고, 360도 회전하는 영상으로 연출합니다.',
    prompt:
      'Isolate the building from the Google Map image, render it in an isometric style, and create a 360-degree rotating video of it.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'character-light-shadow',
    title: '빛과 그림자 변환',
    description:
      '한 인물의 이미지를 다른 이미지의 빛과 그림자 스타일에 맞춰 변형합니다.',
    prompt:
      "Figure 1's character transforms into Figure 2's light and shadow, with dark colors representing shadow.",
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'lighting-style-transfer',
    title: '조명 스타일 전이',
    description:
      '한 이미지의 조명 스타일을 다른 인물 사진에 적용하여 전문적인 사진으로 만듭니다.',
    prompt:
      'Change the lighting of Image 1 to that of Image 2, professional photography',
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'illustration-to-realistic',
    title: '일러스트를 실사처럼',
    description:
      '향수병 일러스트레이션을 대리석 뚜껑이 있는 반투명 유리병의 사실적인 버전으로 변환합니다.',
    prompt:
      'turn this illustration of a perfume into a realistic version, Frosted glass bottle with a marble cap',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-composition-edit',
    title: '사진 합성 편집',
    description:
      '사진에서 특정 인물을 제거(REMOVE)하고, 다른 인물을 추가(ADD)하며, 자동차를 다른 모델로 교체(REPLACE)합니다.',
    prompt:
      'Remove the child, add the woman in black, and replace the gray car with the red car.',
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'virtual-try-on-color-match',
    title: '가상 착용 및 색상 맞춤',
    description:
      '모델에게 특정 신발을 신기고, 의상 색상을 신발과 어울리도록 변경합니다.',
    prompt:
      "Make this model wear this shoe, and change her outfit's color palette to match the shoes.",
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'photo-to-cyberpunk-ar',
    title: '사진을 사이버펑크 AR 장면으로',
    description:
      '참고 사진을 사용하여 사이버펑크 슈트를 입은 남성이 AR 홀로그램(소셜 미디어 아이콘, 통계 등)을 보는 장면을 생성합니다.',
    prompt:
      'A young man (use my photo as a reference) wearing a cyberpunk suit in a dimly lit room, gazing thoughtfully at his smartphone. Augmented reality (AR) holograms float around him, including social media icons like Facebook and Instagram, app icons from a smartphone screen, follower statistics, and interaction metrics like reach and views. A message bubble reads, "AI is likely to be either the best or worst thing to happen to humanity." - Elon Musk. Image dimensions are longitudinal.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'building-to-isometric-tile',
    title: '건물을 아이소메트릭 타일로',
    description:
      '건물 사진을 둥글고 귀여운 1:1 비율의 아이소메트릭 타일 3D 렌더링 스타일로 변환하며, 건물의 주요 특징을 보존합니다.',
    prompt:
      'Convert the photo of this building into a rounded, cute isometric tile 3D rendering style, with a 1:1 ratio, To preserve the prominent features of the photographed building.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'character-painting-process',
    title: '캐릭터 페인팅 과정 생성',
    description:
      '인물 사진을 기반으로 선화, 단색, 그림자, 완성의 4단계 캐릭터 페인팅 과정을 생성합니다.',
    prompt:
      'Generate a four-panel process for character painting: first step: line draft, second step: flat color, third step: add shadows, fourth step: refine and shape.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'video-character-costume-change',
    title: '영상 속 인물 의상 변경',
    description:
      '영상 속 인물을 원시인, 운동선수, 90년대 탐정, 로마 황제 등 다양한 모습으로 변환합니다.',
    prompt:
      'Change my appearance in the video to a caveman, an athlete in a tank top, a 90s detective in a fedora, and a Roman emperor.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'tv-show-poster',
    title: 'TV쇼 포스터 제작',
    description:
      '여러 인물 사진을 사용하여 90년대 코미디 클럽 무대를 배경으로 한 고해상도 TV쇼 포스터를 제작합니다.',
    prompt:
      "Make a high-resolution TV show poster with these characters. The younger man in the first image is the leading character, and he is standing and grinning in the middle. The rest are around him. They're all on a stand-up comedy club stage in the 90s.",
    imageCount: 'multiple',
    category: '디자인',
  },
  {
    id: 'miniature-model-on-table',
    title: '미니어처 모델 제작 및 합성',
    description:
      '등대 사진으로 미니어처 모델을 만들어 테이블 사진 위에 올려놓습니다.',
    prompt:
      'Make a miniature model of the lighthouse and put it on this table.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'giant-dog-composite',
    title: '거대 강아지 합성',
    description:
      '강아지 사진을 바다에서 솟아오르는 거대한 모습으로 해변 배경과 합성합니다.',
    prompt: 'Make my dog look like a giant rising out of the sea.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'virtual-try-on-clothes',
    title: '가상 의류 피팅',
    description:
      '인물 사진에 다른 이미지의 자켓과 반바지를 입혀 가상으로 피팅해봅니다.',
    prompt: 'What would I look like wearing this jacket and shorts?',
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'virtual-try-on-hat-jacket',
    title: '가상 모자 및 자켓 피팅',
    description:
      '인물 사진에 다른 이미지의 자켓과 모자를 씌워 가상으로 피팅해봅니다.',
    prompt: 'Put me in this jacket and hat.',
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'map-to-realistic-landscape',
    title: '판타지 지도를 실사 풍경으로',
    description:
      '판타지 지도에 표시된 특정 지점(화산)을 사실적인 풍경 이미지로 변환합니다.',
    prompt:
      'Create a realistic landscape view of the volcano marked on the map.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'interactive-map-explorer',
    title: '인터랙티브 지도 탐험',
    description:
      '특정 시대의 지도를 생성하고, 지도상의 한 지점을 클릭하면 1인칭 시점의 탐험가 뷰를 보여줍니다.',
    prompt:
      "Generate a map from 1775 AD Boston and show the Explorer's View from a selected point.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'interactive-moon-map-explorer',
    title: '인터랙티브 달 지도 탐험',
    description:
      '1966년 달 지도를 생성하고, 지도상의 한 지점을 클릭하면 1인칭 시점의 우주비행사 뷰를 보여줍니다.',
    prompt:
      "Generate an ortho map of the moon from 1966 AD and show the Explorer's View from a selected point.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'create-meal-from-ingredients',
    title: '재료로 음식 만들기',
    description:
      '여러 재료 이미지를 사용하여 베이컨으로 감싼 요리를 만들어 접시 위에 올려놓습니다.',
    prompt:
      'draw a bacon wrapped lunch with these ingredients, on a plate here',
    imageCount: 'multiple',
    category: '생성',
  },
  {
    id: 'map-to-3d-tabletop',
    title: '판타지 지도를 3D 테이블탑으로',
    description:
      '손으로 그린 판타지 지도를 성, 마을 등의 구조물과 지형이 표현된 항해 가능한 3D 테이블탑 세계로 변환합니다.',
    prompt:
      'Extrude this hand-drawn fantasy map into a complete, navigable 3D tabletop world, interpreting contour lines for elevation and symbols for structures like castles and villages.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'composite-person-with-changes',
    title: '인물 합성 및 의상 변경',
    description:
      '한 사진의 인물을 다른 배경 사진에 합성하면서, 티셔츠 색상을 바꾸고 신발을 추가하며 사실적인 그림자를 넣습니다.',
    prompt:
      'put me in picture 1 with black t-shirt, white shoes and a realistic shadow.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'create-plated-meal',
    title: '재료로 플레이팅된 음식 만들기',
    description:
      '주방 카운터 위의 여러 재료들을 사용하여 맛있는 점심을 만들어 접시에 담고, 다른 재료들은 제거한 후 확대된 뷰로 보여줍니다.',
    prompt:
      'make me a delicious lunch with these ingredients, and put it on a plate, zoomed in view of the plate, remove the other plates and ingredients.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'concept-to-character-sheet',
    title: '컨셉 아트를 캐릭터 시트로',
    description:
      '손으로 그린 캐릭터 머리 컨셉을 기반으로 앞, 옆, 뒤, 3/4 뷰 및 동적 포즈가 포함된 전체 캐릭터 디자인 시트를 생성합니다.',
    prompt:
      'Generate a full character design sheet based on this hand-drawn concept. Use the visible head design as the foundation. Complete the full body and show the character from multiple angles: front, side, back, and ¾ view. The design should stay stylistically consistent while allowing for creative interpretation of the unseen parts.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'map-to-pov',
    title: '고지도에서 1인칭 뷰로',
    description:
      '고대 아테네 지도를 기반으로 기원전 500년의 거리에 서 있는 1인칭 시점(POV) 사진을 생성합니다.',
    prompt:
      'show a POV picture of standing in the street in Ancient Athens 500BC based on this map',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'map-to-pov-new-amsterdam',
    title: '1670년 뉴암스테르담 1인칭 뷰',
    description:
      '1670년 뉴암스테르담 지도를 기반으로 건물 사이에 서 있는 사람의 1인칭 시점(POV) 모습을 보여줍니다.',
    prompt:
      'show me how this map of New Amsterdam 1670 looks like POV when I am standing there in between buildings as a person',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'past-present-blend',
    title: '과거와 현재 풍경 합성',
    description:
      '1670년 뉴암스테르담의 모습과 현재 뉴욕의 고층 빌딩들을 결합하여 브로드 스트리트에서 올려다보는 1인칭 시점(POV) 이미지를 만듭니다.',
    prompt:
      'show a POV blend of the 1670 New Amsterdam, surrounded by the current day New York City skyscrapers, looking up from Broad Street in NYC',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'in-image-style-transfer-pizza',
    title: '이미지 내 일부 스타일 변환',
    description:
      '사진의 다른 모든 요소는 그대로 유지하면서 피자만 2D 애니메이션 일러스트레이션 스타일로 변경합니다.',
    prompt:
      'make pizza look like 2d whimsical hand drawn anime illustration keeping everything else in the image exactly the same.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'photo-to-cyberpunk-seoul',
    title: '서울을 사이버펑크 스타일로',
    description: '서울의 도시 풍경 이미지를 사이버펑크 스타일로 변환합니다.',
    prompt: '이 서울의 이미지를 사이버펑크 스타일로 바꿔줘!',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'product-replacement-cosmetics',
    title: '제품 교체',
    description:
      '레몬과 얼음이 있는 광고 이미지에서 특정 위치의 화장품을 다른 화장품 이미지로 교체합니다.',
    prompt: '레몬 위에 있는 화장품 자리에, 이 화장품을 대신 위치시켜줘',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'style-transfer-3d-game-character',
    title: '3D 게임 캐릭터 스타일로 변경',
    description:
      '일러스트레이션 이미지의 스타일을 3D 게임 캐릭터 느낌으로 변경합니다.',
    prompt: '3d 게임 캐릭터 느낌으로 이미지 스타일을 바꿔줘!',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'photo-to-3d-character',
    title: '사진을 3D 캐릭터 스타일로',
    description: '인물 사진을 3D 캐릭터 스타일로 변환합니다.',
    prompt: '위의 이미지를 3D character 스타일로 만들어줘',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'image-variation',
    title: '이미지 베리에이션',
    description:
      '원본 AI 이미지를 기반으로 인물과 사진의 느낌을 그대로 유지하면서 다양한 구도의 베리에이션 이미지를 생성합니다.',
    prompt:
      'Create variations of this AI image, keeping the character and photo feel consistent.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'character-in-new-scene',
    title: '캐릭터를 새로운 장면에',
    description: 'AI로 만든 요정 이미지를 김치찌개를 먹는 장면으로 합성합니다.',
    prompt:
      'Place the fairy from the AI image into a scene where she is eating Kimchi Jjigae.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'add-product-to-model',
    title: '모델에게 제품 들게 하기',
    description: '인물 모델의 손에 화장품 제품 이미지를 자연스럽게 합성합니다.',
    prompt: 'Make the model hold this cosmetic product in her hand.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'zoom-out-angle-change',
    title: '줌 아웃 및 각도 변경',
    description:
      '이미지를 줌 아웃하면서 살짝 다른 각도의 장면을 연출하여 영상으로 만들 때 더 자연스러운 효과를 줍니다.',
    prompt: 'Zoom out from the image while slightly changing the angle.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'product-mockup-generation',
    title: '다양한 제품 목업 생성',
    description:
      '하나의 로고와 디자인을 사용하여 물티슈, 스프레이 등 다양한 제품의 목업 이미지를 생성합니다.',
    prompt:
      'Create various product mockups (wipes, spray) using this brand logo and design.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'jewelry-swap',
    title: '주얼리 교체',
    description: '모델이 착용한 팔찌를 다른 팔찌 이미지로 교체합니다.',
    prompt:
      'Replace the bracelet the model is wearing with the one in the provided image.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'watch-on-wrist',
    title: '손목에 시계 합성',
    description: '모델의 손목에 스마트워치 이미지를 합성합니다.',
    prompt: "Place this smartwatch on the model's wrist.",
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'outpainting-and-infilling',
    title: '아웃페인팅 및 영역 생성',
    description:
      '원본 이미지를 임의로 자르고, 없던 영역을 AI가 새롭게 만들어내어 이미지를 확장합니다.',
    prompt:
      'Crop the original image and let the AI generate new content for the missing areas.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'realistic-product-composite',
    title: '사실적인 제품 합성',
    description:
      '모델 사진과 립스틱 제품 사진을 합성하여 모델이 립스틱을 들고 있는 고품질의 이미지를 생성합니다.',
    prompt:
      'Combine the model photo and the lipstick photo to create a high-quality image of the model holding the lipstick.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'replace-and-infer-jewelry',
    title: '주얼리 교체 및 추론',
    description:
      '모델의 귀걸이를 첨부한 이미지로 대체하고, 반지도 그와 비슷한 스타일로 적절히 변경해달라고 요청합니다.',
    prompt:
      '모델의 귀걸이를 첨부한 이미지로 대체해주고, 모델의 반지도, 첨부한 이미지와 비슷한 스타일로 적절히 대체해줘!',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'multi-image-composition',
    title: '여러 이미지 아이템 합성',
    description:
      '여러 개의 개별 이미지를 참조하여 모델, 의상, 자동차, 애완동물, 액세서리를 하나의 완성된 장면으로 합성합니다.',
    prompt:
      "A model is posing and leaning against a pink bmw. She is wearing the following items, the scene is against a light grey background. The green alien is a keychain and it's attached to the pink handbag. The model also has a pink parrot on her shoulder. There is a pug sitting next to her wearing a pink collar and gold headphones.",
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'product-placement-scene',
    title: '매장 내 제품 배치',
    description:
      '인물과 여러 제품 이미지를 사용하여 현대적인 전자제품 매장 내에 자연스럽게 배치된 장면을 연출합니다.',
    prompt:
      'A man is standing in a modern electronic store analyzing a digital camera. He is wearing a watch. On the table in front of him are sunglasses, headphones on a stand, a shoe, a helmet and a sneaker, a white sneaker and a black sneaker.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'group-photo-from-portraits',
    title: '개별 초상화로 단체 사진 제작',
    description:
      '이름표가 붙은 여러 인물 초상화(콜라주 방식)를 사용하여 박물관에 함께 있는 단체 사진을 생성합니다.',
    prompt:
      'Create a scene in a museum where all the labeled individuals (Mona, Pearl, David, Van Gogh, Leonardo) are gathered, looking at a banana on a pedestal.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'group-photo-on-yacht',
    title: '요트 위 단체 사진',
    description:
      '이름이 지정된 5명의 인물 사진을 사용하여 요트 갑판 위에서 검은 정장을 입고 대화하는 영화적인 장면을 만듭니다.',
    prompt:
      'A cinematic medium closeup shot of these 5 people, they are each wearing sleek black suits and chatting to each other while standing on the deck of a yacht.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'robot-driving-scene',
    title: '로봇 드라이빙 장면',
    description:
      '로봇과 자동차 이미지를 결합하여 로봇이 사막에서 레트로 미래형 스포츠카를 운전하는 영화적인 트래킹 샷을 생성합니다. ',
    prompt:
      "A cinematic 3/4 angle tracking shot follows a robot in the driver seat with both hands gripping a white steering wheel. The interior of the car is white with gold trim detailing. It's sleek and minimalistic. The robot is driving a retro futuristic sports car across a white sand desert canyon at noon.",
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'outpainting-zoom-out',
    title: '아웃페인팅 (줌 아웃)',
    description:
      '이미지의 캔버스를 확장하여 기존 장면의 주변을 자연스럽게 채워넣는 줌 아웃 효과를 적용합니다.',
    prompt: 'Zoom out',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'fashion-try-on-pose',
    title: '패션 아이템 가상 피팅 및 포즈 변경',
    description:
      '인물에게 다른 이미지의 자켓과 모자를 입히고, 혀를 내밀고 손가락으로 제스처를 취하는 등 포즈와 표정을 변경합니다.',
    prompt:
      'Make the woman wear this jacket and cap, she is sticking her tongue out holding a devils horn sign with her fingers, she is also wearing beige jeans and black sunglasses.',
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'recreate-pov',
    title: '시점 재구성',
    description: '장면 속 다른 인물의 시점에서 이미지를 재구성합니다.',
    prompt: 'Recreate a new image from the point of you of the guy.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'reimagine-shot-vader-pov',
    title: '다스베이더 시점으로 재구성',
    description:
      '영화의 한 장면을 다스베이더의 시점에서 본 모습으로 재구성합니다.',
    prompt: "Reimagine this shot but from Vader's point of view.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'virtual-shirt-try-on',
    title: '가상 셔츠 피팅',
    description: '인물 사진에 다른 이미지의 셔츠를 입힙니다.',
    prompt: 'Put this shirt on him.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'scene-composition-from-elements',
    title: '요소들로 장면 구성',
    description:
      '인물 사진과 그림 이미지를 지정된 레이아웃(삼분할 구도)에 맞춰 하나의 장면으로 구성합니다.',
    prompt:
      'Compose a scene following the rule of thirds: place the character on the right and the painting on the left, with a continuous tabletop below them.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'facial-expression-transfer',
    title: '표정 전이',
    description:
      '참고용 인물(Reference)의 얼굴에 다른 이미지들의 다양한 표정(찡그림, 키스, 분노, 지루함)을 적용합니다.',
    prompt:
      "Apply the facial expressions from the four images to the reference person's face.",
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'add-item-to-model',
    title: '모델에게 가방 들게 하기',
    description:
      '두 개의 다른 이미지(모델, 가방)를 사용하여 모델이 팔을 들어 가방을 들고 있는 모습으로 합성합니다.',
    prompt: 'Let the woman hold this bag with one arm raised forward.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'phone-case-design-application',
    title: '폰케이스 디자인 적용',
    description:
      '특정 패턴 이미지를 아이폰 케이스에 적용한 후, 해당 폰을 들고 있는 모델의 모습을 생성합니다.',
    prompt:
      'Side profile of a woman with vivid orange bob haircut and bold blue eyeshadow, holding the iPhone to her ear as if speaking on the phone. change the iphone cover to this cover.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'furniture-swap',
    title: '가구 교체',
    description:
      '모던한 거실의 기본 이미지에 다른 사진 속 해변 스타일의 소파, 커피 테이블, 러그, 의자 등 가구들을 교체하여 합성합니다.',
    prompt:
      "Take the clean modern living room as the base image. You're going to then replace the couch, coffee table, rug, and chairs with the furniture from the second beachy living room photo.",
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'photo-to-manga-panel',
    title: '사진을 만화 패널로',
    description:
      '자동차 사진을 흑백 만화로 변환하고, 다음 패널에 고양이와 관련된 재미있는 반전을 추가하여 이야기를 이어갑니다.',
    prompt:
      'turn this into black-and-white manga. make the next panel a funny cat-related twist.',
    imageCount: 1,
    category: '스토리텔링',
  },
  {
    id: 'photo-to-3d-character-in-office',
    title: '사진을 3D 캐릭터로 변환 및 합성',
    description:
      '인물과 마이크만 남기고 3D 애니메이션 캐릭터로 변환한 후, 사실적인 사무실 배경에 배치합니다.',
    prompt:
      'Remove everything except the woman and mic. Make her a 3d animated character. Put her in a photorealistic office.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'poster-replacement',
    title: '포스터 교체',
    description:
      "벽에 걸린 영화 포스터를 다른 영화('제다이의 귀환') 포스터로 교체합니다.",
    prompt: "replace the poster with the 'Return of the Jedi' one.",
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'add-gangster-accessories',
    title: '갱스터 스타일 액세서리 추가',
    description:
      '평범한 강아지와 고양이 사진에 모자, 금니, 목걸이 등을 추가하여 갱스터 스타일로 변환합니다.',
    prompt: 'light animation of dog and cat gangsters.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'manga-story-continuation',
    title: '만화 스토리 이어가기',
    description: '주어진 만화의 다음 패널을 생성하여 이야기를 계속 이어갑니다.',
    prompt: 'make the next panel of this manga that continues the story.',
    imageCount: 1,
    category: '스토리텔링',
  },
  {
    id: 'rearrange-objects',
    title: '물체 재배치',
    description:
      '가로로 쌓인 책들을 수직으로 세워 북엔드 사이에 배치하고, 침실 서랍장 위로 옮깁니다.',
    prompt:
      'Flip stack of books to be upright and put on table between two bookends.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'put-hat-on-person',
    title: '인물에게 모자 씌우기',
    description: '인물 사진에 다른 이미지의 야구 모자를 씌웁니다.',
    prompt: 'Put the baseball hat on the woman.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'cinematic-color-grading',
    title: '영화처럼 색 보정',
    description: '사진의 색감을 더 영화적인 느낌이 나도록 보정합니다.',
    prompt: 'Color grade the photo to make it more cinematic.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'photo-on-tv-screen',
    title: 'TV 화면에 사진 합성',
    description:
      '주어진 사진을 거실 TV 화면에 누군가 시청하고 있는 것처럼 보여줍니다.',
    prompt:
      'Show this photo as if someone is watching it through their living room TV.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'lego-version',
    title: '레고 버전으로 변환',
    description: '사진을 레고 블록으로 만든 것처럼 변환합니다.',
    prompt: 'make a lego version of this photo.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'predict-next-shot',
    title: '다음 장면 예측',
    description:
      '정면을 응시하는 인물의 다음 행동(리모컨을 누르는 장면)을 예측하여 생성합니다.',
    prompt: 'predict the next shot.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'youtube-thumbnail-creation',
    title: '유튜브 썸네일 제작',
    description:
      "사진을 사용하여 'Nano Banana가 인터넷을 뒤흔들 것'이라는 문구와 함께 인물이 심슨 캐릭터로 변환되는 과정을 보여주는 바이럴 유튜브 썸네일을 만듭니다.",
    prompt:
      'A viral photo with some overlay like a YouTube thumbnail version which is basically saying "Nano Banana will break the internet" with an example right of this image and then what it can transform to in a nice way." but make sure to show right and actual transformation... show on the right hand side a version of me as a Simpsons character.',
    imageCount: 1,
    category: '디자인',
  },
  {
    id: 'create-scene-from-multiple-portraits',
    title: '여러 초상화로 장면 생성',
    description:
      '여러 장의 인물 사진을 학습(러닝)시켜, 비 오는 날 버스를 기다리며 우는 한 사람의 모습으로 된 새로운 장면을 생성합니다. 596]',
    prompt: 'this person crying in the rain, waiting for a bus.',
    imageCount: 'multiple',
    category: '생성',
  },
  {
    id: 'change-viewpoint-in-scene',
    title: '장면 시점 변경',
    description:
      '이미지 속 인물의 바로 뒤쪽 시점에서 방의 다른 쪽을 보여주는 장면으로 변경합니다.',
    prompt:
      'Show the scene from a viewpoint directly behind the woman, showing the other side of the room.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'night-to-day-isometric',
    title: '야경을 주간 아이소메트릭으로',
    description:
      '야경 건물 사진을 낮 시간대의 아이소메트릭 뷰(건물만)로 변경합니다.',
    prompt: 'Make Image Daytime and Isometric (Building Only).',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'faceswap',
    title: '얼굴 바꾸기 (페이스 스왑)',
    description:
      '한 이미지 속 인물의 얼굴을 다른 이미지의 인물 얼굴로 교체합니다.',
    prompt:
      'faceswap the character from image 2 with the face of the character from image 1.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'multi-angle-story',
    title: '다양한 앵글로 이야기 전개',
    description:
      '자전거 타는 남자를 다양한 각도(측면, 후면, 항공뷰)에서 보여주며 마지막에 넘어지는 반전을 추가합니다.',
    prompt:
      'Show the man riding a bicycle from multiple angles, then show him falling down.',
    imageCount: 1,
    category: '스토리텔링',
  },
  {
    id: 'step-by-step-image-editing',
    title: '단계별 이미지 편집',
    description:
      '하나의 이미지를 여러 단계에 걸쳐 편집합니다: 중국어 문자 제거, 인물 제거, 머리색 변경, 옷색 변경, 날씨 변경, 잉크 스타일 제목 추가.',
    prompt:
      'remove all the chinese letters, remove the character to the right, change the character hair to white, change the clothes to white, change the weather to snowy, add the title in ink style: "The Journey of Legend".',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'pose-replication',
    title: '포즈 따라하기',
    description:
      '한 인물이 다른 캐릭터(루피)의 포즈를 따라하도록 이미지를 변형합니다.',
    prompt:
      'Make the person on the left strike the pose of the character on the right.',
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'add-doodle-effect',
    title: '두들(Doodle) 효과 추가',
    description:
      '자동차 사진의 연기 부분을 손으로 그린 듯한 두들(doodle) 스타일로 만듭니다.',
    prompt: 'Transform the smoke in the car photo into a doodled part.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'b-roll-montage-creation',
    title: 'B롤 몽타주 영상 제작',
    description:
      '한 인물 이미지를 사용하여 달리기, 건물 들어가기, 여러 장소에 서 있기 등 다양한 B롤 영상 장면들을 생성합니다.',
    prompt:
      'create a scene with this subject running in the existing environment, 16:9. create a scene with this subject entering into the building behind them, shot from behind, in the existing environment, 16:9. provide a 4-panel montage of b-roll footage of this subject, 16:9.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'product-in-hand-mockup',
    title: '손에 든 제품 목업',
    description:
      '제품(캔) 이미지를 사용하여 사람이 손에 들고 있는 자연스러운 사진을 생성합니다.',
    prompt: 'make the subject hold the orange can.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'relight-characters',
    title: '배경에 맞게 조명 재설정',
    description: '인물들의 조명을 배경과 일치하도록 자연스럽게 재조정합니다.',
    prompt: 'Relight the characters to match the background.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'change-aspect-ratio-from-reference',
    title: '참조 이미지로 종횡비 변경',
    description:
      '다른 빈 이미지의 종횡비를 참조하여 원본 이미지의 종횡비를 변경합니다.',
    prompt:
      'Change the aspect ratio to use the aspect ratio from the blank image.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'group-scene-from-portraits-with-aspect-ratio',
    title: '여러 인물을 한 장면에 합성 (종횡비 조절)',
    description:
      '세 명의 인물 사진을 재미있는 방에 함께 있는 것처럼 합성하고, 빈 이미지의 종횡비를 적용합니다.',
    prompt:
      'Have all three women hanging around in a fun room. Use the aspect ratio from the blank image.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'product-ad-spoof',
    title: '제품 광고 패러디',
    description:
      '유명 브랜드(리퀴드 데스)의 제품 이미지를 사용하여 다양한 패러디 광고 이미지를 생성합니다.',
    prompt: 'Create various parody ad images using this Liquid Death can.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'product-placement-lifestyle',
    title: '라이프스타일 속 제품 배치',
    description:
      '프링글스 제품 이미지를 사용하여 인물들이 소파에서 쉬면서 프링글스를 즐기는 다양한 라이프스타일 장면을 연출합니다.',
    prompt:
      'Create lifestyle scenes of people relaxing on a couch and enjoying Pringles.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'various-product-edits',
    title: '다양한 제품 관련 편집',
    description:
      '가방 교체, 재킷 들게 하기, 책 표지 바꾸기, 선글라스 씌우기 등 인물 사진에 다양한 제품 관련 편집을 적용합니다.',
    prompt:
      'CHANGE THE BAG WITH THE SECOND IMAGE; THE WOMAN IS HOLDING THE PINK NIKE PUFFER JACKET; REPLACE THE BOOK COVER WITH THE COVER WITH THE SECOND IMAGE; EDIT THIS PHOTO SO THE WOMAN IS WEARING THE RED PERSIAN-INSPIRED SUNGLASSES.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'various-character-edits',
    title: '다양한 인물 관련 편집',
    description:
      '운동화 교체, 얼굴에 타투 적용, 인물 교체 등 다양한 인물 중심의 편집 작업을 수행합니다. ',
    prompt:
      "Change that nike sneakers into a black and white Converse; Apply a tattoo design on the woman's face; Replace the singer in the first image with the man from the second image.",
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'scene-and-angle-change',
    title: '장면 및 앵글 변경',
    description:
      '인물이 문을 닫는 장면으로 변경한 후, 사람이 없는 전통 가옥의 항공 와이드 샷으로 앵글을 변경합니다.',
    prompt:
      'Change the scene so the subject is standing at his home entrance, closing the wooden gate at night. Then, change the angle to an aerial wide shot of the traditional Japanese home at night, no people in the scene.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'scene-atmosphere-change',
    title: '장면 분위기 변경 (시간/계절)',
    description:
      '어두운 밤의 시골집 장면을 평화로운 아침 햇살이 비치는 모습으로, 그리고 다시 눈 내리는 고요한 겨울 저녁으로 변환합니다.',
    prompt:
      'Transform this scene into a peaceful morning atmosphere with soft golden sunlight. Then, transform this countryside house scene into a serene winter evening with snow.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'battle-scene-perspective-change',
    title: '전투 장면 시점 변경',
    description:
      '오크 군대의 정면 샷을 군대 뒤에서 성벽을 향해 행군하는 모습으로, 그리고 다시 성벽 위 궁수의 시점에서 군대를 내려다보는 모습으로 변경합니다.',
    prompt:
      'Change the camera angle to show the orc army from behind as they march forward toward a massive white stone wall. Then, change the angle to an over-the-shoulder view from an archer on top of the wall.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'add-action-and-emotion',
    title: '행동 및 감정 추가',
    description:
      '인물 사진을 전통 부엌에서 요리하는 장면으로 만들고, 다음 장면에서는 여성이 눈물을 흘리는 모습으로 감정을 변화시킵니다.',
    prompt:
      'create a scene with this subject cooking in the japanese traditional kitchen. Then, change the expression of the young woman so that she is visibly crying.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'billiards-scene-direction',
    title: '당구장에서 장면 연출',
    description:
      '인물들을 당구대 위에 앉히고, 다음 장면에서는 한 명이 공을 치고 다른 한 명은 기다리는 모습으로 연출합니다.',
    prompt:
      'Make them sitting on billiard table. Then, make them now playing billiard, 1 girl want shoot the ball, another one is standing waiting her turns.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'character-replacement-and-action',
    title: '인물 교체 및 행동 추가',
    description:
      '인물들에게 칵테일 잔을 들게 하고, 다음 장면에서는 가운데 인물을 토니 스타크(아이언맨)로 교체하여 양옆의 인물들이 그를 껴안는 장면을 연출합니다.',
    prompt:
      'Make them holding cocktail glass. Then, change the girl in the middle become a man like tony stark ironman and they hug him.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'action-and-object-removal',
    title: '행동 추가 및 물체 제거',
    description:
      '인물이 테이블 위의 아이스티를 마시게 한 후, 다음 장면에서는 테이블에서 아이스티를 제거합니다.',
    prompt:
      'Make her drink the iced tea on the table. Then, remove the iced tea from the table.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'item-and-background-change',
    title: '소품 및 배경 변경',
    description:
      '인물이 들고 있는 랜턴을 샷건으로 바꾸고, 다음 장면에서는 헛간 내부에서 숲속 나무 아래에 앉아 샷건을 재장전하는 모습으로 배경과 행동을 변경합니다.',
    prompt:
      'Change the lantern to shotgun. Then, the woman is no longer inside the barn. Place her outdoors, sitting under a large tree in a forest clearing. She is holding the shotgun across her lap, carefully reloading shells into it with focused determination.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'short-film-scene-generation',
    title: '단편 영화 장면 생성',
    description:
      '하나의 기본 캐릭터 이미지를 사용하여 달리기, 칼싸움, 운전, 수중 장면 등 다양한 액션이 포함된 단편 영화의 여러 장면들을 생성합니다.',
    prompt:
      'Image Developed using Nano Banana a.k.a (Gemini 2.5 Flash) from a single base image.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'angle-and-pose-change',
    title: '앵글 및 포즈 변경',
    description:
      '웅크리고 있는 인물의 앵글을 정면 미디엄 샷으로 변경하고, 카메라를 향해 전신이 보이도록 서 있는 포즈로 바꿉니다.',
    prompt:
      'Change the angle to a front view medium shot, with the whole body facing the camera.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'close-up-shot-with-expression',
    title: '표정을 담은 클로즈업 샷',
    description:
      '자신감 넘치면서도 도도한 패션 모델의 태도를 풍기는 표정으로 얼굴 클로즈업 샷을 생성합니다.',
    prompt:
      'Close-up shot of the face, expression exuding an arrogant fashion model attitude, sharp gaze, slightly raised chin, confident yet dismissive look, cinematic lighting, detailed skin texture, shallow depth of field, glossy highlights on the eyes and lips.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'dynamic-running-shot',
    title: '역동적인 달리기 샷',
    description:
      '인물이 거리에서 달리는 모습을 로우앵글 정면 샷으로 포착하고, 역동적인 모션 블러 효과를 추가하여 힘과 에너지를 강조합니다.',
    prompt:
      'Make her running on the street, captured from a low-angle front view camera shot, dynamic motion blur on her body and hair, urban background, cinematic lighting, full body in frame, emphasizing power and energy.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'high-speed-driving-scene',
    title: '고속 주행 장면',
    description:
      '인물이 비명을 지르며 고속으로 차를 운전하는 정면 미디엄 샷을 만들고, 모션 블러 효과를 추가하여 영화적인 느낌을 줍니다.',
    prompt:
      'Change the angle to a front view medium shot, she is driving a car at high speed with a screaming expression, add motion blur effect, cinematic look.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'anguished-scream-scene',
    title: '고뇌에 찬 비명 장면',
    description:
      '인물이 야외에서 고뇌에 차 비명을 지르는 모습을 강렬한 클로즈업 샷으로 포착합니다. 배경으로 나무들 사이로 햇빛이 비칩니다.',
    prompt:
      'Make her scream in anguish outdoors, captured in an intense close-up shot. Her face contorts with raw fear and desperation, mouth open wide as if crying out. Sunlight filters through the blurred background of trees.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'motorcycle-riding-scene',
    title: '오토바이 타는 장면',
    description: '인물이 오토바이를 타는 장면을 생성합니다.',
    prompt: 'Make her ride a motorcycle.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'katana-combat-stance',
    title: '카타나 전투 자세',
    description:
      '사무라이에서 영감을 받아, 인물이 카타나를 머리 위로 들어 올린 극적인 전투 자세를 취하고 있는 모습을 로우앵글 클로즈업 미디엄 샷으로 생성합니다.',
    prompt:
      'A fierce woman in a bright yellow Adidas tracksuit with white stripes and chunky sneakers, holding a katana raised above her head in a dramatic combat stance, inspired by samurai. Close-up medium shot, dynamic low angle, intense gaze partially obscure by the katan blade cinematic.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'moody-car-scene',
    title: '분위기 있는 자동차 안 장면',
    description:
      '밤에 차 안에 앉아 있는 인물의 감성적인 측면 프로필 샷을 생성합니다. 창문에는 비가 내리고, 거리의 불빛과 부드러운 붉은 조명이 분위기를 더합니다.',
    prompt:
      'Make her sit inside a car at night, captured in a moody side-profile shot. Raindrops cover the window, glowing under green and yellow streetlights outside, while a red light softly illuminates his face. His expression is distant and contemplative lost in thought, as the rain creates a melancolic atmospher. Cinematic film tone.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'diner-scene',
    title: '조용한 식당 장면',
    description:
      '인물이 조용한 식당 안 테이블에 기대 서 있는 모습을 생성합니다. 햇빛이 창문을 통해 부드럽게 들어와 방 안을 비춥니다.',
    prompt:
      'Make her stand inside a quiet diner, leaning against a table. Her expression looks weary and contemplative, as if lost in thought after a long day. The diner is nearly empty, red-and-white checkered tablecloths neatly arranged on the tables, sunlight streaming softly throught the side windows, casting shadows across the room. Cinematic film tone, naturalistic lighting.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'car-replacement-in-scene',
    title: '장면 속 자동차 교체',
    description:
      '인물, 포즈, 배경은 그대로 유지하면서, 한 이미지 속의 자동차를 다른 이미지의 자동차로 교체합니다.',
    prompt:
      'Replace the car in the first image with the car from the second image, keeping the same characters, poses, and setting.',
    imageCount: 'multiple',
    category: '편집',
  },
  {
    id: 'weather-and-expression-change',
    title: '날씨 및 표정 변경',
    description:
      '눈 오는 배경의 인물 사진을 맑은 날씨로 바꾸고, 인물이 미소 짓도록 표정을 변경합니다.',
    prompt: 'Make it sunny and make her smile',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'hairstyle-and-mustache-addition',
    title: '헤어스타일 변경 및 수염 추가',
    description:
      '인물 사진에 풍성하고 아름다운 머리카락을 추가하거나, 단정한 헤어스타일과 함께 콧수염을 추가합니다.',
    prompt:
      'Give me a head of beautiful hair. Give me formal hair with a full mustache.',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'remove-person-from-group',
    title: '단체 사진에서 특정 인물 제거',
    description: '단체 사진에서 특정 인물(트럼프)을 제거합니다.',
    prompt: 'Remove Trump',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'dress-up-for-james-bond',
    title: '제임스 본드 스타일로 옷 입히기',
    description:
      '캐주얼한 복장의 커플(저스틴 비버와 헤일리 비버)을 제임스 본드 영화에 어울리는 턱시도와 드레스 차림으로 변경합니다.',
    prompt: 'Dress them up for James Bond',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'meme-composition',
    title: "'재앙의 소녀' 밈 합성",
    description:
      "강아지 사진을 유명한 '재앙의 소녀(disaster girl)' 밈에 합성합니다.",
    prompt: 'Put the dog in the disaster girl meme',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'change-ethnicity',
    title: '인종 변경',
    description: '인물(순다르 피차이)을 백인으로 변경합니다.',
    prompt: 'Make Sundar white',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'pose-reconstruction-from-sketch',
    title: '스케치로 포즈 재현',
    description:
      '인물 사진을 사용하여 구조적인 스케치(마네킹)의 포즈를 정확하게 재현합니다.',
    prompt:
      'Recreate the pose from the structural sketch using the character photo.',
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'anime-to-real-life-cosplay',
    title: '애니메이션을 실사 코스프레로',
    description:
      '애니메이션 캐릭터 일러스트를 현실의 코스프레 사진으로 변환합니다.',
    prompt: 'Transform the anime illustration into a real-life cosplay photo.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'illustration-to-comiket-cosplay',
    title: '일러스트를 코미케 현장 코스프레로',
    description:
      '캐릭터 일러스트를 코미케(Comiket) 현장을 배경으로 한 코스프레 사진으로 생성합니다.',
    prompt:
      'Generate a photo of a girl cosplaying this illustration, with the background set at Comiket',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'exact-pose-replication-cosplay',
    title: '정확한 포즈 재현 코스프레',
    description:
      '원본 일러스트의 포즈, 몸짓, 표정, 카메라 구도를 정확하게 복제하여 코미케 현장의 코스프레 사진을 생성합니다.',
    prompt:
      'Generate a highly detailed photo of a girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'multi-element-ad-composition',
    title: '여러 요소 광고 합성',
    description:
      '배경 템플릿, 가구, 인물 등 세 가지 이미지를 결합하여 하나의 완성된 광고 이미지를 생성합니다.',
    prompt:
      'Combine the background template, the chair, and the woman into a single advertisement image.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'add-illustration-to-photo',
    title: '사진에 일러스트 추가',
    description:
      '실제 카페 배경 사진에 귀여운 일러스트 스타일의 커플이 앉아 커피를 마시며 대화하는 모습을 추가합니다.',
    prompt:
      'Add a couple to the picture, sitting at the table happily drinking coffee and talking. The characters should be in a cute, thick-lined illustration style.',
    imageCount: 1,
    category: '합성',
  },
  {
    id: 'line-art-and-colorization',
    title: '선화 추출 및 채색',
    description:
      '캐릭터 일러스트를 손그림 스타일의 선화(라인 아트)로 변환한 후, 주어진 색상 팔레트(색상 카드)를 사용하여 정확하게 채색합니다.',
    prompt:
      'Transform into a line art hand-drawn style. Accurately use the color palette to color the character in the second image.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'add-bag-and-background-y2k',
    title: '가방 추가 및 Y2K 배경 생성',
    description:
      '캐릭터에게 다른 이미지 형태의 가방을 메게 하고 Y2K 스타일로 그린 후, 더 화려한 Y2K 스타일의 배경을 추가합니다.',
    prompt:
      'Make the character from image 1 wear the bag from image 2, in a Y2K art style. The background should be a good-looking Y2K art style.',
    imageCount: 2,
    category: '편집',
  },
  {
    id: 'various-camera-angles',
    title: '다양한 카메라 앵글',
    description:
      '한 인물을 다양한 카메라 앵글(버즈 아이 뷰, 웜즈 아이 뷰, 쓰리쿼터 뷰 등)로 촬영한 것처럼 여러 이미지를 생성합니다.',
    prompt:
      "Generate images of the character from various camera angles: Bird's Eye View, Worm's Eye View, Three-Quarter View, Rear Three-Quarter View, and Over the Shoulder.",
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'detailed-character-generation',
    title: '상세 묘사로 인물 생성',
    description:
      '매우 상세한 프롬프트(의상, 자세, 표정, 조명, 분위기 등)를 사용하여 홍보용 이미지에 적합한 특정 인물을 생성합니다.',
    prompt:
      'A photorealistic three quater view image of a chubby African lady sitting comfortably on a soft, round, portable plush green couch, placed on an isolated clean background (white or light neutral). She is smiling warmly with genuine emotion, looking at her smartphone in her right hand, giving a natural and relatable expression of happiness and satisfaction... The overall mood should be welcoming, warm, and trustworthy, aligning perfectly with a promotional copy for booking services.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'satellite-view-transformation',
    title: '위성 항공뷰 변환',
    description:
      '사막에 앉아 있는 캐릭터의 모습을 위성에서 내려다보는 항공 탑다운 뷰로 변환합니다.',
    prompt:
      'SATELLITE AERIAL TOP DOWN VIEW OF THIS CHARACTER SITTING CROSSED LEGS IN THE VAST DESERT',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'face-direction-and-expression-change',
    title: '얼굴 방향 및 표정 변경',
    description:
      '옆을 보고 있던 인물이 카메라를 향해 미소 짓는 모습으로 얼굴 방향과 표정을 변경합니다.',
    prompt: 'MAKE THE MAN FACE THE CAMERA WHILE SMILING',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'buildings-form-letter',
    title: '건물로 문자 형태 만들기',
    description:
      "도시의 건물들이 알파벳 'Z' 형태를 이루도록 이미지를 변형합니다.",
    prompt: 'MAKE THE BUILDINGS FORM THE LETTER Z',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'vending-machine-text-change',
    title: '자판기 텍스트 변경',
    description:
      '자판기 정면의 텍스트를 "RETRO FRESH DRINKS"라는 세 줄의 문구로 변경합니다.',
    prompt:
      'CHANGE TEXT ON THE FRONT OF THE VENDING MACHINE TO SAY "RETRO FRESH DRINKS" ON 3 LINES',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'character-turnaround-generation',
    title: '캐릭터 턴어라운드 생성',
    description:
      '한 인물의 이미지를 기반으로 4개의 패널로 구성된 캐릭터 턴어라운드(여러 각도에서 본 모습)를 생성합니다.',
    prompt: 'CREATE A FOUR-PANEL CHARACTER TURNAROUND FOR THIS MAN',
    imageCount: 1,
    category: '생성',
  },
  {
    id: 'in-image-style-transfer-ramen',
    title: '라면을 2D 애니메이션 스타일로',
    description:
      '사진의 다른 모든 것은 그대로 유지하면서, 라면 그릇과 라면만 2D 손그림 애니메이션 일러스트레이션 스타일로 변경합니다.',
    prompt:
      'Make the ramen bowl and ramen look like 2D whimsical hand drawn anime illustration keeping everything else in the image exactly the same',
    imageCount: 1,
    category: '편집',
  },
  {
    id: 'add-muppet-to-photo',
    title: '사진에 머펫 인형 추가',
    description:
      '잠자는 강아지 사진에 머펫 인형이 기대어 누워 있는 것처럼 합성합니다.',
    prompt: 'Place the muppet puppet next to the sleeping dog.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'product-launch-scene',
    title: '제품 발표 장면 연출',
    description:
      "인물(팀 쿡)과 제품(아이폰) 이미지를 사용하여, 그가 무대에서 신제품 'iPhone 17 Pro'를 소개하는 장면을 연출합니다.",
    prompt:
      "Create a scene where Tim Cook is on stage, introducing the 'iPhone 17 Pro'.",
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'facial-expression-generation',
    title: '다양한 표정 생성',
    description:
      '한 인물의 얼굴을 기반으로 분노, 슬픔, 호기심, 충격, 웃음, 미소, 윙크, 삐죽 내민 입술 등 다양한 표정을 생성합니다.',
    prompt:
      'Generate various facial expressions for this person: angry, sad, curious, shock, laugh, smile, wink, puckered lips.',
    imageCount: 1,
    category: '생성',
  },
  {
    id: '2d-to-3d-character-figure',
    title: '2D 일러스트를 3D 피규어로 변환',
    description:
      '2D 캐릭터 일러스트(측면, 전신)를 사실적인 3D 피규어처럼 변환합니다.',
    prompt: 'Convert the 2D character illustration into a realistic 3D figure.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'perspective-change-high-angle',
    title: '하이앵글 시점 변경',
    description:
      '이미지의 시점을 천장 모서리에서 내려다보는 듯한 높은 각도(하이앵글)로 변경합니다.',
    prompt:
      'Change the perspective to a high angle, looking down from above as if from the ceiling corner.',
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'scene-reconstruction-from-different-angles',
    title: '다양한 앵글로 장면 재구성',
    description:
      '하나의 입력(INPUT) 이미지를 기반으로 천장 팬이 보이는 더 넓은 앵글의 장면과 캐릭터의 얼굴이 클로즈업된 다른 앵글의 장면을 생성합니다.',
    prompt:
      "Reconstruct the scene from a wider angle showing the ceiling fan, and also create a close-up shot of the character's face.",
    imageCount: 1,
    category: '변환',
  },
  {
    id: 'recreate-scene-with-characters-and-pose',
    title: '캐릭터와 포즈로 장면 재현',
    description:
      '지정된 구도(세 번째 이미지)를 사용하여, 한 캐릭터(첫 번째)가 잠들어 있고 다른 캐릭터(두 번째)가 그를 흔들어 깨우는 장면을 표정을 중시하여 생성합니다.',
    prompt:
      'Generate an image with the composition of the third image. The character from the first image is sleeping, and the character from the second image is trying to wake them up by shaking them. Emphasize their facial expressions.',
    imageCount: 'multiple',
    category: '생성',
  },
  {
    id: 'create-fight-scene-from-references',
    title: '참고 자료로 격투 장면 생성',
    description:
      '두 캐릭터 이미지와 스틱맨 포즈 그림을 참고하여 두 캐릭터가 싸우는 역동적인 장면을 생성합니다.',
    prompt:
      'Create a dynamic fighting scene with the two characters based on the stick figure pose reference.',
    imageCount: 'multiple',
    category: '생성',
  },
  {
    id: 'pose-transfer-with-mannequin',
    title: '마네킹으로 포즈 전이',
    description:
      '마네킹의 포즈를 캐릭터 일러스트에 적용하여 새로운 포즈를 만듭니다.',
    prompt:
      'Apply the pose of the reference mannequin to the character illustration.',
    imageCount: 2,
    category: '변환',
  },
  {
    id: 'multi-image-scene-composition',
    title: '여러 이미지로 장면 합성',
    description:
      '세 개의 다른 이미지(A, B, C)에서 배경, 가구/소품, 인물을 각각 가져와 하나의 새로운 장면으로 합성합니다.',
    prompt:
      'Combine the background from image A, the furniture and props from image B, and the person from image C into a single new scene.',
    imageCount: 'multiple',
    category: '합성',
  },
  {
    id: 'place-furniture-in-scene',
    title: '장면에 가구 배치',
    description:
      '한 이미지의 의자와 테이블을 다른 이미지의 빨간 상자 위치에 배치하고, 빨간 상자 표시는 제거합니다.',
    prompt:
      'Place the chair and table from the first image at the red box location in the second image, and generate the image without the red box markings.',
    imageCount: 2,
    category: '합성',
  },
  {
    id: 'wear-necklace',
    title: '목걸이 착용시키기',
    description:
      '인물 사진(그림 2)의 다른 세부 사항은 변경하지 않고, 다른 이미지(그림 1)의 목걸이를 착용시킵니다.',
    prompt:
      'The woman in Figure 2 is wearing the necklace from Figure 1, Do not change the details of other Figure 2.',
    imageCount: 2,
    category: '편집',
  },
]
