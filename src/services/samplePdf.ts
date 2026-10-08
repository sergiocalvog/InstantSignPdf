import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Language } from '../i18n/translations';

interface SampleDocContent {
  title: string;
  subtitle: string;
  dateLoc: string;
  partiesHeading: string;
  party1: string;
  party1Role: string;
  party2: string;
  party2Role: string;
  agreementHeading: string;
  clause1Title: string;
  clause1Body: string;
  clause2Title: string;
  clause2Body1: string;
  clause2Body2: string;
  clause3Title: string;
  check1Text: string;
  check2Text: string;
  box1Title: string;
  box1Entity: string;
  box1SignedText: string;
  box1Date: string;
  box2Title: string;
  box2Hint: string;
  box2Signer: string;
  footerText: string;
}

const DOC_CONTENT: Record<'es' | 'en', SampleDocContent> = {
  es: {
    title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS Y CONFIDENCIALIDAD',
    subtitle: 'DOCUMENTO OFICIAL PARA FIRMA Y RATIFICACIÓN DIGITAL',
    dateLoc: 'En Madrid, a la fecha consignada en el pie de firma del presente documento.',
    partiesHeading: 'REUNIDOS:',
    party1: 'De una parte, SERVICIOS DIGITALES Y CONSULTORÍA TECNOLÓGICA S.L., con NIF B-87654321,',
    party1Role: 'en adelante el "PRESTADOR DEL SERVICIO".',
    party2: 'Y de otra parte, la persona física o jurídica cuyos datos identificativos constan estampados',
    party2Role: 'en la sección de aceptación y firma, en adelante el "CLIENTE".',
    agreementHeading: 'EXPONEN Y ACUERDAN:',
    clause1Title: 'PRIMERO. - OBJETO DEL ACUERDO:',
    clause1Body: 'El Prestador se compromete a suministrar soluciones de gestión documental electrónica conforme a los más altos estándares de privacidad y seguridad.',
    clause2Title: 'SEGUNDO. - PRIVACIDAD ZERO-KNOWLEDGE:',
    clause2Body1: 'Ambas partes reconocen que la presente operación de firma se ejecuta íntegramente',
    clause2Body2: 'en el entorno de ejecución local del dispositivo, garantizando que ningún dato sensible abandona el terminal.',
    clause3Title: 'TERCERO. - RATIFICACIÓN DE CONDICIONES Y CLÁUSULAS ADICIONALES:',
    check1Text: 'He leído y acepto expresamente los términos de servicio y las cláusulas de privacidad.',
    check2Text: 'Deseo recibir una copia digital rubricada en mi buzón de notificaciones.',
    box1Title: 'POR EL PRESTADOR:',
    box1Entity: 'Servicios Digitales S.L.',
    box1SignedText: '[Rubricado Digitalmente]',
    box1Date: 'Fecha: 01/10/2026',
    box2Title: 'POR EL CLIENTE (Estampe su firma aquí):',
    box2Hint: 'Espacio reservado para firma manuscrita, fecha y DNI:',
    box2Signer: 'Nombre, DNI y Firma del Titular',
    footerText: 'Página 1 de 1 — Documento protegido con tecnología InstantSign Zero-Knowledge',
  },
  en: {
    title: 'SERVICES AGREEMENT AND NON-DISCLOSURE CONTRACT',
    subtitle: 'OFFICIAL DOCUMENT FOR DIGITAL SIGNATURE & RATIFICATION',
    dateLoc: 'Executed and effective as of the date recorded in the signature section below.',
    partiesHeading: 'BY AND BETWEEN:',
    party1: 'On the one part, DIGITAL SERVICES & TECHNOLOGY CONSULTING LLC, Tax ID US-87654321,',
    party1Role: 'hereinafter referred to as the "SERVICE PROVIDER".',
    party2: 'And on the other part, the individual or corporate entity whose identifying details appear',
    party2Role: 'stamped in the acceptance and signature area below, hereinafter the "CLIENT".',
    agreementHeading: 'RECITALS & AGREEMENT:',
    clause1Title: 'FIRST. - PURPOSE OF AGREEMENT:',
    clause1Body: 'The Provider agrees to deliver digital document solutions compliant with the highest industry standards of privacy and confidentiality.',
    clause2Title: 'SECOND. - ZERO-KNOWLEDGE PRIVACY:',
    clause2Body1: 'Both parties expressly acknowledge that this signature procedure executes entirely',
    clause2Body2: 'within the local execution environment of the client device, ensuring zero data leakage.',
    clause3Title: 'THIRD. - RATIFICATION OF TERMS & ADDITIONAL PROVISIONS:',
    check1Text: 'I have read and expressly agree to the terms of service and zero-knowledge privacy clauses.',
    check2Text: 'I request a certified digital copy delivered to my secure notification records.',
    box1Title: 'FOR THE SERVICE PROVIDER:',
    box1Entity: 'Digital Services LLC',
    box1SignedText: '[Digitally Signed]',
    box1Date: 'Date: 10/01/2026',
    box2Title: 'FOR THE CLIENT (Stamp your signature here):',
    box2Hint: 'Reserved space for handwritten signature, date and ID:',
    box2Signer: 'Full Name, ID Number and Client Signature',
    footerText: 'Page 1 of 1 — Document protected by InstantSign Zero-Knowledge Technology',
  },
};

/**
 * High-definition Canvas renderer for genuine Chinese legal contract typography.
 * Avoids heavy 20MB CJK font dependencies while guaranteeing 100% offline native rendering.
 */
function renderChineseContractToCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const scale = 2.5; // 2.5x retina resolution for ultra-sharp typography
  const widthPt = 595.28;
  const heightPt = 841.89;

  canvas.width = Math.round(widthPt * scale);
  canvas.height = Math.round(heightPt * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPt, heightPt);

  // Top decorative header bar
  ctx.fillStyle = '#1e488f';
  ctx.fillRect(40, 48, 515.28, 4);

  // Document Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif';
  ctx.fillText('技术服务与保密协议（演示合同样本）', 40, 78);

  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 9.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('用于数字签名、盖章与本地防篡改验证的官方演示文件', 40, 96);

  // Divider line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 108);
  ctx.lineTo(555.28, 108);
  ctx.stroke();

  // Location & Date
  ctx.fillStyle = '#334155';
  ctx.font = '10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('签署地点：北京市海淀区科技园区', 40, 130);
  ctx.fillText('签署日期：以本协议下方客户实际签署时间戳为准', 40, 148);

  // Parties Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('合同双方当事人：', 40, 178);

  ctx.font = '10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('甲方（技术服务商）：数智云端信息科技有限责任公司（统一信用代码：91110108MA019876XX）', 40, 198);
  ctx.fillText('乙方（授权客户方）：本文件下方“客户签署确认区”加盖印章或手写签名之主体', 40, 218);

  // Clauses Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('协议主要条款与保密约定：', 40, 250);

  // Clause 1
  ctx.fillStyle = '#1e488f';
  ctx.font = 'bold 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('第一条【技术服务范围与标准】', 40, 272);
  ctx.fillStyle = '#334155';
  ctx.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('服务方依托自主研发的高效文档引擎，向客户提供安全、高效的电子公文签署与私密文档无纸化管理技术方案。', 40, 290);

  // Clause 2
  ctx.fillStyle = '#1e488f';
  ctx.font = 'bold 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('第二条【零知识本地隐私保障（Zero-Knowledge Privacy）】', 40, 318);
  ctx.fillStyle = '#334155';
  ctx.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('双方一致认可并确认：本系统的全部签名与密码学运算均 100% 在用户端设备本地浏览器内执行。', 40, 336);
  ctx.fillText('任何文件内容、公文原件、手写笔迹及身份识别数据均不出境，绝不上传至任何外部或云端服务器。', 40, 354);

  // Clause 3
  ctx.fillStyle = '#1e488f';
  ctx.font = 'bold 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('第三条【法律效力与确认事项】', 40, 382);
  ctx.fillStyle = '#334155';
  ctx.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('本电子确认件一经签署，双方均认可其具备完整法律效力、不可撤销性及法律凭证效力。', 40, 400);

  // Checkboxes
  const drawCheckbox = (x: number, y: number, text: string) => {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y - 11, 14, 14);
    ctx.fillStyle = '#334155';
    ctx.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(text, x + 22, y);
  };

  drawCheckbox(45, 442, '本人已认真阅读、完全理解并自愿接受上述服务条款及隐私合规说明。');
  drawCheckbox(45, 470, '同意签署完成后在本地直接生成并下载高保真签署版 PDF 凭证。');

  // Signature Boxes at bottom
  const sigBoxY = 560;
  const boxW = 230;
  const boxH = 120;

  // Box 1 (Party A)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(40, sigBoxY, boxW, boxH);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, sigBoxY, boxW, boxH);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('甲方（服务商盖章区）：', 52, sigBoxY + 22);

  ctx.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('数智云端信息科技有限责任公司', 52, sigBoxY + 40);

  ctx.font = 'italic 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.fillText('【已完成官方电子签章】', 65, sigBoxY + 66);

  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(52, sigBoxY + 84);
  ctx.lineTo(250, sigBoxY + 84);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '9.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('签署日期：2026年10月01日', 52, sigBoxY + 104);

  // Box 2 (Party B - Target zone)
  ctx.fillStyle = '#f0f7ff';
  ctx.fillRect(325, sigBoxY, boxW, boxH);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(325, sigBoxY, boxW, boxH);

  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('乙方（客户请在此签署）：', 337, sigBoxY + 22);

  ctx.font = 'italic 9.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('预留手写签名、签署日期与证件号：', 337, sigBoxY + 40);

  // Dashed line
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(337, sigBoxY + 84);
  ctx.lineTo(535, sigBoxY + 84);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#475569';
  ctx.font = '9.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('签署人姓名、身份证号与签名', 360, sigBoxY + 104);

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '9.5px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('第 1 页，共 1 页 — 本文件受 InstantSign 零知识本地隐私保护技术保障', widthPt / 2, 790);

  return canvas;
}

/**
 * Creates an authentic demo contract in memory tailored to the chosen language.
 */
export async function generateSampleContractPDF(language: Language = 'en'): Promise<ArrayBuffer> {
  // Chinese language: render with high-definition Canvas for native CJK glyphs
  if (language === 'zh') {
    const canvas = renderChineseContractToCanvas();
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const pngImage = await pdfDoc.embedPng(dataUrl);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });
    const pdfBytes = await pdfDoc.save();
    return pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
  }

  // Western languages (ES, EN): standard vector fonts
  const content = DOC_CONTENT[language as 'es' | 'en'] || DOC_CONTENT.es;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (pt)

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Top header bar / emblem
  page.drawRectangle({
    x: 40,
    y: 785,
    width: 515.28,
    height: 4,
    color: rgb(0.12, 0.28, 0.55),
  });

  // Document Title
  page.drawText(content.title, {
    x: 40,
    y: 755,
    size: 12.5,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.22),
  });

  page.drawText(content.subtitle, {
    x: 40,
    y: 740,
    size: 8,
    font: fontOblique,
    color: rgb(0.35, 0.4, 0.48),
  });

  page.drawLine({
    start: { x: 40, y: 728 },
    end: { x: 555.28, y: 728 },
    color: rgb(0.85, 0.88, 0.92),
    thickness: 1,
  });

  // Body content
  const startY = 705;
  const lineHeight = 17;

  const introParagraphs = [
    { text: content.dateLoc, isBold: false, isAccent: false },
    { text: '', isBold: false, isAccent: false },
    { text: content.partiesHeading, isBold: true, isAccent: false },
    { text: content.party1, isBold: false, isAccent: false },
    { text: content.party1Role, isBold: false, isAccent: false },
    { text: '', isBold: false, isAccent: false },
    { text: content.party2, isBold: false, isAccent: false },
    { text: content.party2Role, isBold: false, isAccent: false },
    { text: '', isBold: false, isAccent: false },
    { text: content.agreementHeading, isBold: true, isAccent: false },
    { text: content.clause1Title, isBold: true, isAccent: true },
    { text: content.clause1Body, isBold: false, isAccent: false },
    { text: '', isBold: false, isAccent: false },
    { text: content.clause2Title, isBold: true, isAccent: true },
    { text: content.clause2Body1, isBold: false, isAccent: false },
    { text: content.clause2Body2, isBold: false, isAccent: false },
    { text: '', isBold: false, isAccent: false },
    { text: content.clause3Title, isBold: true, isAccent: true },
  ];

  let currentY = startY;
  for (const item of introParagraphs) {
    if (!item.text) {
      currentY -= 6;
      continue;
    }
    page.drawText(item.text, {
      x: 40,
      y: currentY,
      size: item.isBold ? 9 : 8.5,
      font: item.isBold ? fontBold : fontRegular,
      color: item.isAccent ? rgb(0.12, 0.28, 0.55) : rgb(0.2, 0.24, 0.3),
    });
    currentY -= lineHeight;
  }

  // Checkbox boxes for testing checkmark placement
  currentY -= 4;
  page.drawRectangle({
    x: 45,
    y: currentY - 2,
    width: 14,
    height: 14,
    borderColor: rgb(0.3, 0.35, 0.45),
    borderWidth: 1.2,
  });
  page.drawText(content.check1Text, {
    x: 68,
    y: currentY + 1,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.35),
  });

  currentY -= 22;
  page.drawRectangle({
    x: 45,
    y: currentY - 2,
    width: 14,
    height: 14,
    borderColor: rgb(0.3, 0.35, 0.45),
    borderWidth: 1.2,
  });
  page.drawText(content.check2Text, {
    x: 68,
    y: currentY + 1,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.35),
  });

  // Signature Block Areas at bottom
  const sigBoxY = 130;
  const boxWidth = 230;
  const boxHeight = 110;

  // Box 1: Prestador / Service Provider
  page.drawRectangle({
    x: 40,
    y: sigBoxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.8, 0.84, 0.9),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 1.0),
  });
  page.drawText(content.box1Title, {
    x: 50,
    y: sigBoxY + boxHeight - 18,
    size: 8,
    font: fontBold,
    color: rgb(0.25, 0.3, 0.4),
  });
  page.drawText(content.box1Entity, {
    x: 50,
    y: sigBoxY + boxHeight - 32,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45),
  });
  page.drawText(content.box1SignedText, {
    x: 75,
    y: sigBoxY + 45,
    size: 9,
    font: fontOblique,
    color: rgb(0.4, 0.5, 0.65),
  });
  page.drawLine({
    start: { x: 55, y: sigBoxY + 30 },
    end: { x: 255, y: sigBoxY + 30 },
    color: rgb(0.7, 0.75, 0.85),
    thickness: 0.8,
  });
  page.drawText(content.box1Date, {
    x: 55,
    y: sigBoxY + 14,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Box 2: Cliente / Client (Target zone for stamping!)
  page.drawRectangle({
    x: 325,
    y: sigBoxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.2, 0.45, 0.85),
    borderWidth: 1.5,
    color: rgb(0.98, 0.99, 1.0),
  });
  page.drawText(content.box2Title, {
    x: 335,
    y: sigBoxY + boxHeight - 18,
    size: 7.5,
    font: fontBold,
    color: rgb(0.12, 0.3, 0.65),
  });
  page.drawText(content.box2Hint, {
    x: 335,
    y: sigBoxY + boxHeight - 32,
    size: 7.5,
    font: fontOblique,
    color: rgb(0.4, 0.45, 0.55),
  });
  page.drawLine({
    start: { x: 340, y: sigBoxY + 30 },
    end: { x: 540, y: sigBoxY + 30 },
    color: rgb(0.65, 0.75, 0.9),
    thickness: 0.8,
    dashArray: [4, 3],
  });
  page.drawText(content.box2Signer, {
    x: 360,
    y: sigBoxY + 14,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Footer
  page.drawText(content.footerText, {
    x: 130,
    y: 40,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.55, 0.6, 0.68),
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  ) as ArrayBuffer;
  return buffer;
}
