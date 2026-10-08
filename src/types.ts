export type PlacementType = 'signature' | 'text' | 'date' | 'check' | 'cross' | 'id_badge';

export interface Placement {
  id: string;
  type: PlacementType;
  pageNumber: number; // 1-indexed
  x: number; // in rendered CSS pixels relative to top-left of page canvas
  y: number; // in rendered CSS pixels relative to top-left of page canvas
  width: number; // in rendered CSS pixels
  height: number; // in rendered CSS pixels
  content?: string; // Text content or DataURL for signature/image
  color?: string; // Hex color: '#003366', '#000000', etc.
  fontSize?: number; // CSS px font size
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
  isBold?: boolean;
  label?: string; // descriptive tag (e.g., 'Firma', 'DNI', 'Fecha')
  groupId?: string; // connects items in the same box (e.g. combined signature block)
  groupName?: string; // optional name of the group
}

export interface SavedSignature {
  id: string;
  name: string;
  dataUrl: string; // PNG base64 with transparent background
  createdAt: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface UserDataPresets {
  fullName: string;
  idNumber: string; // DNI / NIF / NIE / CIF
  place: string; // e.g. "Madrid", "Barcelona"
  dateFormat: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'LONG_ES';
}

export interface PDFPageDimensions {
  pageNumber: number;
  originalWidth: number; // in points (72pt/inch)
  originalHeight: number; // in points (72pt/inch)
  renderedWidth: number; // in CSS px
  renderedHeight: number; // in CSS px
  scale: number;
  rotation: number;
}

export type ToolType = 'select' | 'signature' | 'text' | 'date' | 'dni' | 'fullname' | 'check' | 'cross';

export interface ActiveToolConfig {
  type: ToolType;
  signature?: SavedSignature;
  defaultText?: string;
  defaultColor?: string;
}
