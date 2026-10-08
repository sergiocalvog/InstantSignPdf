export type Language = 'es' | 'en' | 'zh';

export interface Translations {
  // Header & Brand
  brandSubtitle: string;
  privacyBadge: string;
  demoPdfBtn: string;
  changePdfBtn: string;
  presetsBtnTooltip: string;
  themeLightTooltip: string;
  themeDarkTooltip: string;
  downloadBtn: string;
  processingBtn: string;

  // Dropzone
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  dropzonePrivacyTag: string;
  dropzoneDragActive: string;
  dropzoneBrowseBtn: string;
  dropzoneHint: string;
  dropzoneDemoHint: string;
  dropzoneFeaturesTitle: string;
  dropzoneFeature1: string;
  dropzoneFeature2: string;
  dropzoneFeature3: string;
  dropzoneInvalidFile: string;
  dropzoneInvalidHeader: string;
  dropzoneReadError: string;

  // Toolbar & Stamping
  toolsHeading: string;
  addSignature: string;
  signatureDropdownTooltip: string;
  savedSignaturesTitle: string;
  createScanNewSignature: string;
  stampDate: string;
  freeText: string;
  freeTextSubtitle: string;
  quickIdHeading: string;
  editPresetsBtn: string;
  nameLabel: string;
  idNumberLabel: string;
  addPresetPrompt: string;
  combinedBlockBtn: string;
  acceptanceHeading: string;
  tickLabel: string;
  crossLabel: string;
  elementsPlacedHeading: string;
  clearAllBtn: string;
  clearAllConfirm: string;
  tipText: string;
  downloadSignedPdfDesktop: string;

  // Mobile Dock & Drawer
  mobileSig: string;
  mobileDate: string;
  mobilePack: string;
  mobileMore: string;
  mobileDownload: string;
  mobileDrawerTitle: string;
  mobileDrawerDownloadBtn: string;
  mobileDrawerQuickData: string;
  mobileDrawerCombinedBlock: string;

  // Notifications
  exportSuccessMsg: string;
  downloadAgainBtn: string;
  exportErrorMsg: string;

  // Presets Modal
  presetsModalTitle: string;
  presetsModalSubtitle: string;
  presetsFullNameLabel: string;
  presetsFullNamePlaceholder: string;
  presetsIdLabel: string;
  presetsIdPlaceholder: string;
  presetsDateFormatLabel: string;
  presetsSaveBtn: string;
  presetsCancelBtn: string;

  // Signature Modal
  sigModalTitle: string;
  sigModalSubtitle: string;
  sigTabDraw: string;
  sigTabUpload: string;
  sigTabType: string;
  sigInkColorLabel: string;
  sigStrokeWidthLabel: string;
  sigClearBtn: string;
  sigUndoBtn: string;
  sigSaveBtn: string;
  sigUploadDragText: string;
  sigUploadBrowseText: string;
  sigUploadThresholdLabel: string;
  sigTypePlaceholder: string;
  sigFontLabel: string;
  sigBaselinePrompt: string;
  sigDrawPlaceholder: string;
  sigUploadTitle: string;
  sigUploadHelp: string;
  sigChangeImage: string;
  sigRecolorLabel: string;
  sigTypePrompt: string;
  sigNameLabel: string;
  sigNamePlaceholder: string;
  sigSavedLibraryTitle: string;
  sigUseOnceBtn: string;
  sigSaveAndUseBtn: string;
  sigCancelBtn: string;
  sigStrokeFine: string;
  sigStrokeMedium: string;
  sigStrokeThick: string;
  sigInkNotaryBlue: string;
  sigInkBlack: string;
  sigInkNavy: string;

  // Donation Modal
  donationTitle: string;
  donationSubtitle: string;
  donationIntro1: string;
  donationIntro2: string;
  donationTier1Label: string;
  donationTier1Price: string;
  donationTier2Label: string;
  donationTier2Price: string;
  donationTier3Label: string;
  donationTier3Price: string;
  donationBuyMeCoffee: string;
  donationPaypal: string;
  donationGuarantee: string;
  donationSharePrompt: string;
  donationCopyLink: string;
  donationCopied: string;
  donationCloseBtn: string;

  // Overlay Canvas & Items
  sampleTextDefault: string;
  dateDefaultLabel: string;
  dniDefaultLabel: string;
  signerDefaultLabel: string;
  combinedBlockGroupName: string;
  dniAndDateLabel: string;
  signatureDefaultLabel: string;
  zoomInTooltip: string;
  zoomOutTooltip: string;
  fitPageTooltip: string;
  pageIndicator: string;
  viewerPrevPage: string;
  viewerNextPage: string;
  viewerFitWidth: string;
  viewerRotate: string;
  viewerMoveUp: string;
  viewerMoveDown: string;
  viewerMoveLeft: string;
  viewerMoveRight: string;
  viewerFitBtn: string;
  viewerRenderError: string;
  viewerReloadBtn: string;
  viewerRendering: string;
  canvasMoveEntireBox: string;
  canvasMoveBox: string;
  canvasDateFormat: string;
  canvasEditText: string;
  canvasReduceFont: string;
  canvasIncreaseFont: string;
  canvasDuplicate: string;
  canvasDelete: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    brandSubtitle: 'Zero-Knowledge',
    privacyBadge: '100% Offline & Seguro: Tus documentos no salen de este dispositivo',
    demoPdfBtn: 'Probar con PDF Demo',
    changePdfBtn: 'Cambiar PDF',
    presetsBtnTooltip: 'Mis datos rápidos (DNI, Nombre)',
    themeLightTooltip: 'Modo Claro',
    themeDarkTooltip: 'Modo Oscuro',
    downloadBtn: 'Descargar',
    processingBtn: 'Procesando...',

    dropzoneTitle: 'Firma tus documentos con total privacidad',
    dropzoneSubtitle: 'Firma y descarga en segundos con procesamiento 100% local en tu dispositivo.',
    dropzonePrivacyTag: 'Estampa firmas, fechas y texto sin enviar nada a servidores',
    dropzoneDragActive: 'Suelta tu archivo PDF aquí...',
    dropzoneBrowseBtn: 'Seleccionar archivo PDF',
    dropzoneHint: 'o arrastra y suelta tu PDF aquí',
    dropzoneDemoHint: '¿No tienes un PDF a mano?',
    dropzoneFeaturesTitle: 'Máxima Privacidad & Potencia:',
    dropzoneFeature1: 'Cero subidas: tus datos nunca tocan ningún servidor en la nube',
    dropzoneFeature2: 'Añade firmas manuscritas, fechas dinámicas, DNI y casillas',
    dropzoneFeature3: 'Exportación en alta fidelidad vectorial a 72 DPI nativo',
    dropzoneInvalidFile: 'Por favor, selecciona un archivo en formato PDF válido.',
    dropzoneInvalidHeader: 'El archivo no posee una cabecera PDF válida (%PDF). Puede estar dañado.',
    dropzoneReadError: 'Ocurrió un error al leer el archivo en tu navegador.',

    toolsHeading: 'Herramientas de Estampado',
    addSignature: 'Añadir Firma',
    signatureDropdownTooltip: 'Ver firmas guardadas o crear nueva',
    savedSignaturesTitle: 'Tus firmas guardadas:',
    createScanNewSignature: 'Crear / Escanear Nueva',
    stampDate: 'Estampar Fecha',
    freeText: 'Texto Libre',
    freeTextSubtitle: 'Comentarios, cláusulas, etc.',
    quickIdHeading: 'Identificación Rápida',
    editPresetsBtn: 'Editar',
    nameLabel: 'Nombre',
    idNumberLabel: 'DNI/NIF',
    addPresetPrompt: 'Añadir',
    combinedBlockBtn: 'Bloque de Firma Completo',
    acceptanceHeading: 'Casillas de Aceptación',
    tickLabel: 'Tick (✔)',
    crossLabel: 'Cruz (✘)',
    elementsPlacedHeading: 'Elementos',
    clearAllBtn: 'Limpiar todos',
    clearAllConfirm: '¿Eliminar todos los elementos colocados en este PDF?',
    tipText: '💡 Consejo: Arrastra los tiradores para redimensionar. Presiona Supr para borrar.',
    downloadSignedPdfDesktop: 'Descargar PDF Firmado',

    mobileSig: 'Firma',
    mobileDate: 'Fecha',
    mobilePack: 'Pack',
    mobileMore: 'Más',
    mobileDownload: 'Descargar',
    mobileDrawerTitle: 'Herramientas y Estampados',
    mobileDrawerDownloadBtn: 'Descargar PDF Firmado',
    mobileDrawerQuickData: 'Datos Rápidos:',
    mobileDrawerCombinedBlock: 'Estampar Bloque Completo (Firma + Nombre + DNI)',

    exportSuccessMsg: '¡Documento preparado y descargado con éxito!',
    downloadAgainBtn: 'Pulsar aquí para descargar de nuevo',
    exportErrorMsg: 'No se pudo generar el PDF. Verifica que el archivo no esté protegido con contraseña.',

    presetsModalTitle: 'Mis Datos Rápidos',
    presetsModalSubtitle: 'Configura tu nombre y DNI para estamparlos con 1 clic en cualquier documento.',
    presetsFullNameLabel: 'Nombre y Apellidos completos',
    presetsFullNamePlaceholder: 'Ej: María Carmen González López',
    presetsIdLabel: 'Documento de Identidad (DNI / NIE / CIF)',
    presetsIdPlaceholder: 'Ej: 12345678Z',
    presetsDateFormatLabel: 'Formato de fecha preferido',
    presetsSaveBtn: 'Guardar mis datos',
    presetsCancelBtn: 'Cancelar',

    sigModalTitle: 'Gestor de Firma Digital',
    sigModalSubtitle: 'Trazo suave optimizado para documentos legales y oficiales',
    sigTabDraw: 'Dibujar a mano',
    sigTabUpload: 'Subir foto / Escanear',
    sigTabType: 'Escribir con tipografía',
    sigInkColorLabel: 'Color de tinta',
    sigStrokeWidthLabel: 'Grosor de trazo',
    sigClearBtn: 'Limpiar',
    sigUndoBtn: 'Deshacer',
    sigSaveBtn: 'Guardar y Usar Firma',
    sigUploadDragText: 'Arrastra una foto de tu firma en papel',
    sigUploadBrowseText: 'Explorar archivo de imagen',
    sigUploadThresholdLabel: 'Limpieza de fondo blanco',
    sigTypePlaceholder: 'Escribe tu nombre...',
    sigFontLabel: 'Estilo tipográfico',
    sigBaselinePrompt: '✍️ Firme aquí',
    sigDrawPlaceholder: 'Haga clic o use el dedo/lápiz para dibujar su firma',
    sigUploadTitle: 'Subir foto o escaneo de su firma (PNG, JPG)',
    sigUploadHelp: 'El fondo blanco de papel se convertirá automáticamente en transparente mediante nuestro algoritmo alfa.',
    sigChangeImage: 'Cambiar imagen',
    sigRecolorLabel: 'Uniformar trazo al color de tinta seleccionado',
    sigTypePrompt: 'Nombre a convertir en rúbrica:',
    sigNameLabel: 'Nombre o etiqueta de esta firma (opcional):',
    sigNamePlaceholder: 'Ej: Firma Principal, Rúbrica Rápida',
    sigSavedLibraryTitle: 'O elija una firma guardada en este dispositivo:',
    sigUseOnceBtn: 'Usar una sola vez',
    sigSaveAndUseBtn: 'Guardar y Usar',
    sigCancelBtn: 'Cancelar',
    sigStrokeFine: 'Fino',
    sigStrokeMedium: 'Medio',
    sigStrokeThick: 'Grueso',
    sigInkNotaryBlue: 'Azul Notarial',
    sigInkBlack: 'Negro Tinta',
    sigInkNavy: 'Azul Marino',

    donationTitle: '¡PDF firmado y listo!',
    donationSubtitle: '100% procesado en tu navegador sin servidores',
    donationIntro1:
      'Creamos esta herramienta para que nadie tenga que pagar suscripciones abusivas de 15€/mes ni subir contratos confidenciales a servidores extraños solo para firmar un PDF.',
    donationIntro2:
      '¿Te ha ahorrado tiempo o dinero? Si te apetece, invítame a un café para ayudarme a mantener la herramienta activa y libre para todos:',
    donationTier1Label: '☕ 1 Café',
    donationTier1Price: '2 €',
    donationTier2Label: '☕☕ 2 Cafés',
    donationTier2Price: '5 €',
    donationTier3Label: '🚀 Mecenas',
    donationTier3Price: '10 €',
    donationBuyMeCoffee: 'Invitar a un café con Buy Me a Coffee',
    donationPaypal: 'Donar con PayPal',
    donationGuarantee: 'Siempre gratuita e ilimitada. Tu donación es voluntaria y 100% segura.',
    donationSharePrompt: '¿No puedes donar? También nos ayudas compartiéndola con tus amigos o compañeros:',
    donationCopyLink: 'Copiar enlace de la web',
    donationCopied: '¡Enlace copiado al portapapeles!',
    donationCloseBtn: 'Cerrar y continuar editando',

    sampleTextDefault: 'Texto de ejemplo',
    dateDefaultLabel: 'Fecha',
    dniDefaultLabel: 'DNI',
    signerDefaultLabel: 'Firmante',
    combinedBlockGroupName: 'Caja de Firma y Datos',
    dniAndDateLabel: 'DNI y Fecha',
    signatureDefaultLabel: 'Firma',
    zoomInTooltip: 'Acercar',
    zoomOutTooltip: 'Alejar',
    fitPageTooltip: 'Ajustar escala',
    pageIndicator: 'Página',
    viewerPrevPage: 'Página anterior',
    viewerNextPage: 'Página siguiente',
    viewerFitWidth: 'Ajustar al ancho',
    viewerRotate: 'Girar 90°',
    viewerMoveUp: 'Mover hacia arriba',
    viewerMoveDown: 'Mover hacia abajo',
    viewerMoveLeft: 'Mover a la izquierda',
    viewerMoveRight: 'Mover a la derecha',
    viewerFitBtn: 'Ajustar',
    viewerRenderError: 'No se pudo renderizar la página',
    viewerReloadBtn: 'Recargar visor',
    viewerRendering: 'Renderizando página...',
    canvasMoveEntireBox: '✥ Mover caja entera',
    canvasMoveBox: 'Mover caja',
    canvasDateFormat: 'Formato Fecha',
    canvasEditText: 'Editar texto',
    canvasReduceFont: 'Reducir fuente',
    canvasIncreaseFont: 'Aumentar fuente',
    canvasDuplicate: 'Duplicar',
    canvasDelete: 'Eliminar elemento (Supr)',
  },

  en: {
    brandSubtitle: 'Zero-Knowledge',
    privacyBadge: '100% Offline & Secure: Your documents never leave this device',
    demoPdfBtn: 'Try with Demo PDF',
    changePdfBtn: 'Change PDF',
    presetsBtnTooltip: 'Quick presets (ID, Full Name)',
    themeLightTooltip: 'Light Mode',
    themeDarkTooltip: 'Dark Mode',
    downloadBtn: 'Download',
    processingBtn: 'Processing...',

    dropzoneTitle: 'Sign your documents with complete privacy',
    dropzoneSubtitle: 'Sign and download in seconds with 100% local processing on your device.',
    dropzonePrivacyTag: 'Stamp signatures, dates, and text without sending anything to servers',
    dropzoneDragActive: 'Drop your PDF file here...',
    dropzoneBrowseBtn: 'Select PDF file',
    dropzoneHint: 'or drag and drop your PDF here',
    dropzoneDemoHint: "Don't have a PDF ready?",
    dropzoneFeaturesTitle: 'Maximum Privacy & Power:',
    dropzoneFeature1: 'Zero uploads: your data never touches any cloud server',
    dropzoneFeature2: 'Add handwritten signatures, dynamic dates, IDs, and checkboxes',
    dropzoneFeature3: 'High-fidelity vector export at native 72 DPI points',
    dropzoneInvalidFile: 'Please select a valid PDF file.',
    dropzoneInvalidHeader: 'The file does not have a valid PDF header (%PDF). It may be corrupted.',
    dropzoneReadError: 'An error occurred while reading the file in your browser.',

    toolsHeading: 'Stamping Tools',
    addSignature: 'Add Signature',
    signatureDropdownTooltip: 'View saved signatures or create a new one',
    savedSignaturesTitle: 'Your saved signatures:',
    createScanNewSignature: 'Create / Scan New',
    stampDate: 'Stamp Date',
    freeText: 'Free Text',
    freeTextSubtitle: 'Notes, clauses, remarks, etc.',
    quickIdHeading: 'Quick Identification',
    editPresetsBtn: 'Edit',
    nameLabel: 'Full Name',
    idNumberLabel: 'ID / Passport',
    addPresetPrompt: 'Add',
    combinedBlockBtn: 'Full Signature Block',
    acceptanceHeading: 'Checkboxes & Marks',
    tickLabel: 'Check (✔)',
    crossLabel: 'Cross (✘)',
    elementsPlacedHeading: 'Elements',
    clearAllBtn: 'Clear all',
    clearAllConfirm: 'Remove all elements placed on this PDF?',
    tipText: '💡 Tip: Drag handles to resize. Press Del/Backspace to delete.',
    downloadSignedPdfDesktop: 'Download Signed PDF',

    mobileSig: 'Sign',
    mobileDate: 'Date',
    mobilePack: 'Pack',
    mobileMore: 'More',
    mobileDownload: 'Download',
    mobileDrawerTitle: 'Tools & Stamps',
    mobileDrawerDownloadBtn: 'Download Signed PDF',
    mobileDrawerQuickData: 'Quick Data:',
    mobileDrawerCombinedBlock: 'Stamp Full Block (Signature + Name + ID)',

    exportSuccessMsg: 'Document prepared and downloaded successfully!',
    downloadAgainBtn: 'Click here to download again',
    exportErrorMsg: 'Failed to generate PDF. Make sure the file is not password-protected.',

    presetsModalTitle: 'My Quick Presets',
    presetsModalSubtitle: 'Set up your name and ID number to stamp them with 1 click on any document.',
    presetsFullNameLabel: 'Full Legal Name',
    presetsFullNamePlaceholder: 'e.g. Johnathan Doe',
    presetsIdLabel: 'Identity Document / ID / SSN',
    presetsIdPlaceholder: 'e.g. 12345678Z or Passport No.',
    presetsDateFormatLabel: 'Preferred date format',
    presetsSaveBtn: 'Save my data',
    presetsCancelBtn: 'Cancel',

    sigModalTitle: 'Digital Signature Manager',
    sigModalSubtitle: 'Smooth stroke optimized for legal and official documents',
    sigTabDraw: 'Draw by hand',
    sigTabUpload: 'Upload photo / Scan',
    sigTabType: 'Type with font',
    sigInkColorLabel: 'Ink color',
    sigStrokeWidthLabel: 'Stroke width',
    sigClearBtn: 'Clear',
    sigUndoBtn: 'Undo',
    sigSaveBtn: 'Save & Use Signature',
    sigUploadDragText: 'Drop a photo of your paper signature',
    sigUploadBrowseText: 'Browse image file',
    sigUploadThresholdLabel: 'Background white removal',
    sigTypePlaceholder: 'Type your name...',
    sigFontLabel: 'Typography style',
    sigBaselinePrompt: '✍️ Sign here',
    sigDrawPlaceholder: 'Click or use finger/stylus to draw your signature',
    sigUploadTitle: 'Upload photo or scan of your signature (PNG, JPG)',
    sigUploadHelp: 'White paper background will be automatically converted to transparent using our alpha filter.',
    sigChangeImage: 'Change image',
    sigRecolorLabel: 'Recolor stroke to selected ink color',
    sigTypePrompt: 'Name to generate signature for:',
    sigNameLabel: 'Name or label for this signature (optional):',
    sigNamePlaceholder: 'e.g. Primary Signature, Quick Initial',
    sigSavedLibraryTitle: 'Or choose a saved signature from this device:',
    sigUseOnceBtn: 'Use once',
    sigSaveAndUseBtn: 'Save & Use',
    sigCancelBtn: 'Cancel',
    sigStrokeFine: 'Fine',
    sigStrokeMedium: 'Medium',
    sigStrokeThick: 'Thick',
    sigInkNotaryBlue: 'Notary Blue',
    sigInkBlack: 'Black Ink',
    sigInkNavy: 'Navy Blue',

    donationTitle: 'PDF signed and ready!',
    donationSubtitle: '100% processed in your browser without servers',
    donationIntro1:
      'We built this tool so that no one has to pay expensive $15/month subscriptions or upload private contracts to unknown servers just to sign a PDF.',
    donationIntro2:
      'Has this saved you time or money? If you feel like it, buy me a coffee to help keep this tool free and online for everyone:',
    donationTier1Label: '☕ 1 Coffee',
    donationTier1Price: '$2',
    donationTier2Label: '☕☕ 2 Coffees',
    donationTier2Price: '$5',
    donationTier3Label: '🚀 Patron',
    donationTier3Price: '$10',
    donationBuyMeCoffee: 'Buy me a coffee on Buy Me a Coffee',
    donationPaypal: 'Donate with PayPal',
    donationGuarantee: 'Always free and unlimited. Your support is voluntary and 100% secure.',
    donationSharePrompt: "Can't donate? You can also support us by sharing this with friends or colleagues:",
    donationCopyLink: 'Copy web link',
    donationCopied: 'Link copied to clipboard!',
    donationCloseBtn: 'Close and continue editing',

    sampleTextDefault: 'Sample text',
    dateDefaultLabel: 'Date',
    dniDefaultLabel: 'ID',
    signerDefaultLabel: 'Signer',
    combinedBlockGroupName: 'Signature and Data Box',
    dniAndDateLabel: 'ID and Date',
    signatureDefaultLabel: 'Signature',
    zoomInTooltip: 'Zoom in',
    zoomOutTooltip: 'Zoom out',
    fitPageTooltip: 'Reset zoom',
    pageIndicator: 'Page',
    viewerPrevPage: 'Previous page',
    viewerNextPage: 'Next page',
    viewerFitWidth: 'Fit to width',
    viewerRotate: 'Rotate 90°',
    viewerMoveUp: 'Move up',
    viewerMoveDown: 'Move down',
    viewerMoveLeft: 'Move left',
    viewerMoveRight: 'Move right',
    viewerFitBtn: 'Fit',
    viewerRenderError: 'Could not render page',
    viewerReloadBtn: 'Reload viewer',
    viewerRendering: 'Rendering page...',
    canvasMoveEntireBox: '✥ Move whole box',
    canvasMoveBox: 'Move box',
    canvasDateFormat: 'Date Format',
    canvasEditText: 'Edit text',
    canvasReduceFont: 'Smaller text',
    canvasIncreaseFont: 'Larger text',
    canvasDuplicate: 'Duplicate',
    canvasDelete: 'Delete element (Del)',
  },

  zh: {
    brandSubtitle: '零知识安全',
    privacyBadge: '100% 离线与隐私保护：您的文档绝不会离开此设备',
    demoPdfBtn: '试用演示 PDF',
    changePdfBtn: '更换 PDF',
    presetsBtnTooltip: '快速预设（身份证件、姓名）',
    themeLightTooltip: '浅色模式',
    themeDarkTooltip: '深色模式',
    downloadBtn: '下载',
    processingBtn: '处理中...',

    dropzoneTitle: '在完全保护隐私的前提下签署文档',
    dropzoneSubtitle:
      '快速上传、签名并在几秒内下载。所有数学与加密运算均在您的本地设备（客户端）运行。',
    dropzonePrivacyTag: '印章签名、日期和文本，无需将任何内容上传至云端服务器',
    dropzoneDragActive: '将 PDF 文件拖放到此处...',
    dropzoneBrowseBtn: '选择 PDF 文件',
    dropzoneHint: '或将 PDF 文件拖放至此',
    dropzoneDemoHint: '手头没有现成的 PDF？',
    dropzoneFeaturesTitle: '极致隐私与强大功能：',
    dropzoneFeature1: '零服务器上传：您的机密数据绝不接触任何云端服务器',
    dropzoneFeature2: '添加手写签名、实时动态日期、身份证件及复选标记',
    dropzoneFeature3: '采用原生 72 DPI 矢量高保真嵌入导出',
    dropzoneInvalidFile: '请选择有效的 PDF 格式文件。',
    dropzoneInvalidHeader: '该文件不包含有效的 PDF 文件头 (%PDF)，可能已损坏。',
    dropzoneReadError: '在浏览器读取文件时发生错误。',

    toolsHeading: '图章工具箱',
    addSignature: '添加签名',
    signatureDropdownTooltip: '查看已存签名或创建新签名',
    savedSignaturesTitle: '您保存的签名：',
    createScanNewSignature: '创建 / 扫描新签名',
    stampDate: '盖印日期',
    freeText: '自定义文本',
    freeTextSubtitle: '备注、条款、补充说明等',
    quickIdHeading: '快捷身份信息',
    editPresetsBtn: '编辑',
    nameLabel: '姓名',
    idNumberLabel: '证件号码',
    addPresetPrompt: '添加',
    combinedBlockBtn: '完整签名信息组合',
    acceptanceHeading: '勾选与标记',
    tickLabel: '对勾 (✔)',
    crossLabel: '叉号 (✘)',
    elementsPlacedHeading: '已放置元素',
    clearAllBtn: '清空全部',
    clearAllConfirm: '确定要清除此 PDF 上放置的所有元素吗？',
    tipText: '💡 提示：拖动手柄调整大小。按 Delete / Backspace 键可快速删除。',
    downloadSignedPdfDesktop: '下载已签署 PDF',

    mobileSig: '签名',
    mobileDate: '日期',
    mobilePack: '组合包',
    mobileMore: '更多',
    mobileDownload: '下载',
    mobileDrawerTitle: '工具与图章',
    mobileDrawerDownloadBtn: '下载已签署 PDF',
    mobileDrawerQuickData: '快速数据：',
    mobileDrawerCombinedBlock: '盖印完整组合包 (签名 + 姓名 + 证件)',

    exportSuccessMsg: '文档已成功生成并开始下载！',
    downloadAgainBtn: '若未自动开始下载，请点击此处',
    exportErrorMsg: '生成 PDF 失败，请确认文档未设置密码保护。',

    presetsModalTitle: '我的快捷预设',
    presetsModalSubtitle: '配置您的姓名与证件号，以便一键盖印到任何合同中。',
    presetsFullNameLabel: '完整法定姓名',
    presetsFullNamePlaceholder: '例如：张三',
    presetsIdLabel: '证件号码 (身份证 / 护照 / 税号)',
    presetsIdPlaceholder: '例如：110101199001012345',
    presetsDateFormatLabel: '首选日期格式',
    presetsSaveBtn: '保存我的信息',
    presetsCancelBtn: '取消',

    sigModalTitle: '数字签名管理器',
    sigModalSubtitle: '专为法律与正式文件优化的流畅平滑笔触',
    sigTabDraw: '手写绘制',
    sigTabUpload: '拍照 / 上传图片',
    sigTabType: '字体生成',
    sigInkColorLabel: '墨水颜色',
    sigStrokeWidthLabel: '笔触粗细',
    sigClearBtn: '清空',
    sigUndoBtn: '撤消',
    sigSaveBtn: '保存并使用签名',
    sigUploadDragText: '拖入纸质签名照片',
    sigUploadBrowseText: '浏览图片文件',
    sigUploadThresholdLabel: '白底智能去除强度',
    sigTypePlaceholder: '输入您的名字...',
    sigFontLabel: '字体风格',
    sigBaselinePrompt: '✍️ 在此签名',
    sigDrawPlaceholder: '点击或使用手指/手写笔绘制您的签名',
    sigUploadTitle: '上传签名的照片或扫描件 (PNG, JPG)',
    sigUploadHelp: '白纸背景将通过透明度算法自动去除。',
    sigChangeImage: '更换图片',
    sigRecolorLabel: '统一笔触为所选墨水颜色',
    sigTypePrompt: '要转换为签名的姓名：',
    sigNameLabel: '此签名的名称或标签（可选）：',
    sigNamePlaceholder: '例如：主签名、简笔签',
    sigSavedLibraryTitle: '或选择保存在此设备上的签名：',
    sigUseOnceBtn: '仅使用一次',
    sigSaveAndUseBtn: '保存并使用',
    sigCancelBtn: '取消',
    sigStrokeFine: '细',
    sigStrokeMedium: '中',
    sigStrokeThick: '粗',
    sigInkNotaryBlue: '公证蓝',
    sigInkBlack: '墨水黑',
    sigInkNavy: '海军蓝',

    donationTitle: 'PDF已完成签署！',
    donationSubtitle: '100%在您的浏览器本地处理，无服务器上传',
    donationIntro1:
      '我们开发此工具的初衷，是让任何人都不必为了签署一份 PDF 而每月支付高达 100 多元的订阅费，或将机密合同上传至未知的第三方服务器。',
    donationIntro2:
      '如果此工具为您节省了时间或金钱，欢迎请开发者喝杯咖啡，支持我们保持永久免费与无广告：',
    donationTier1Label: '☕ 1杯咖啡',
    donationTier1Price: '¥15',
    donationTier2Label: '☕☕ 2杯咖啡',
    donationTier2Price: '¥35',
    donationTier3Label: '🚀 赞助者',
    donationTier3Price: '¥70',
    donationBuyMeCoffee: '通过 Buy Me a Coffee 支持',
    donationPaypal: '通过 PayPal 捐助',
    donationGuarantee: '始终免费且不限次数。您的赞助纯属自愿，100% 安全。',
    donationSharePrompt: '暂不方便捐赠？您也可以通过分享给朋友或同事来支持我们：',
    donationCopyLink: '复制网站链接',
    donationCopied: '链接已复制到剪贴板！',
    donationCloseBtn: '关闭并继续编辑',

    sampleTextDefault: '示例文本',
    dateDefaultLabel: '日期',
    dniDefaultLabel: '证件号',
    signerDefaultLabel: '签署人',
    combinedBlockGroupName: '签名与身份信息框',
    dniAndDateLabel: '证件号与日期',
    signatureDefaultLabel: '签名',
    zoomInTooltip: '放大',
    zoomOutTooltip: '缩小',
    fitPageTooltip: '自适应页面',
    pageIndicator: '页码',
    viewerPrevPage: '上一页',
    viewerNextPage: '下一页',
    viewerFitWidth: '适合宽度',
    viewerRotate: '旋转 90°',
    viewerMoveUp: '向上移动',
    viewerMoveDown: '向下移动',
    viewerMoveLeft: '向左移动',
    viewerMoveRight: '向右移动',
    viewerFitBtn: '适应',
    viewerRenderError: '无法渲染页面',
    viewerReloadBtn: '重新加载视图',
    viewerRendering: '正在渲染页面...',
    canvasMoveEntireBox: '✥ 移动整个框',
    canvasMoveBox: '移动框',
    canvasDateFormat: '日期格式',
    canvasEditText: '编辑文本',
    canvasReduceFont: '缩小字号',
    canvasIncreaseFont: '放大字号',
    canvasDuplicate: '复制',
    canvasDelete: '删除元素 (Del)',
  },
};
