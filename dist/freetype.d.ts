/**
 * Create FreeType library instance.
 * 
 * @param initial Provide locateFile method if you want to load WASM from a CDN, e.g. `locateFile(path) => "https://cdn.jsdelivr.net/npm/freetype-wasm@0/dist/freetype.wasm"`
 */
export default function Freetype(initial?: {
  locateFile: (path: "freetype.wasm") => string,
}): Promise<FreetypeModule>;

interface FreetypeModule {
  LoadFontFromBytes: (bytes: Uint8Array | number[]) => FT_FaceRec[];

  UnloadFont: (familyName: string) => void;

  SetFont: (familyName: string, styleName: string) => FT_FaceRec;

  SetCharSize: (
    char_width: number,
    char_height: number,
    horz_resolution: number,
    vert_resolution: number
  ) => FT_Size_Metrics;

  SetPixelSize: (pixel_width: number, pixel_height: number) => FT_Size_Metrics;

  LoadGlyphs: (
    charcodes: number[],
    load_flags: number
  ) => Map<number, FT_GlyphSlotRec>;

  LoadGlyphsFromCharmap: (
    first_charcode: number,
    last_charcode: number,
    load_flags: number
  ) => Map<number, FT_GlyphSlotRec>;

  GetKerning: (
    left_glyph_index: number,
    right_glyph_index: number,
    kern_mode: number
  ) => FT_Vector;

  SetCharmap: (encoding: number) => FT_CharMapRec;
  SetCharmapByIndex: (index: number) => FT_CharMapRec;

  Cleanup: () => void;

  FT_GLYPH_FORMAT_NONE: number;
  FT_GLYPH_FORMAT_COMPOSITE: number;
  FT_GLYPH_FORMAT_BITMAP: number;
  FT_GLYPH_FORMAT_OUTLINE: number;
  FT_GLYPH_FORMAT_PLOTTER: number;

  // load targets
  FT_LOAD_TARGET_NORMAL: number;
  FT_LOAD_TARGET_LIGHT: number;
  FT_LOAD_TARGET_MONO: number;
  FT_LOAD_TARGET_LCD: number;
  FT_LOAD_TARGET_LCD_V: number;

  // load flags
  FT_LOAD_DEFAULT: number;
  FT_LOAD_NO_SCALE: number;
  FT_LOAD_NO_HINTING: number;
  FT_LOAD_RENDER: number;
  FT_LOAD_NO_BITMAP: number;
  FT_LOAD_VERTICAL_LAYOUT: number;
  FT_LOAD_FORCE_AUTOHINT: number;
  FT_LOAD_CROP_BITMAP: number;
  FT_LOAD_PEDANTIC: number;
  FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH: number;
  FT_LOAD_NO_RECURSE: number;
  FT_LOAD_IGNORE_TRANSFORM: number;
  FT_LOAD_MONOCHROME: number;
  FT_LOAD_LINEAR_DESIGN: number;
  FT_LOAD_SBITS_ONLY: number;
  FT_LOAD_NO_AUTOHINT: number;

  // encoding
  FT_ENCODING_NONE: number;
  FT_ENCODING_UNICODE: number;
  FT_ENCODING_MS_SYMBOL: number;
  FT_ENCODING_ADOBE_LATIN_1: number;
  FT_ENCODING_OLD_LATIN_2: number;
  FT_ENCODING_SJIS: number;
  FT_ENCODING_PRC: number;
  FT_ENCODING_BIG5: number;
  FT_ENCODING_WANSUNG: number;
  FT_ENCODING_JOHAB: number;
  FT_ENCODING_ADOBE_STANDARD: number;
  FT_ENCODING_ADOBE_EXPERT: number;
  FT_ENCODING_ADOBE_CUSTOM: number;
  FT_ENCODING_APPLE_ROMAN: number;

  FT_FACE_FLAG_SCALABLE: number;
  FT_FACE_FLAG_FIXED_SIZES: number;
  FT_FACE_FLAG_FIXED_WIDTH: number;
  FT_FACE_FLAG_SFNT: number;
  FT_FACE_FLAG_HORIZONTAL: number;
  FT_FACE_FLAG_VERTICAL: number;
  FT_FACE_FLAG_KERNING: number;
  FT_FACE_FLAG_FAST_GLYPHS: number;
  FT_FACE_FLAG_MULTIPLE_MASTERS: number;
  FT_FACE_FLAG_GLYPH_NAMES: number;
  FT_FACE_FLAG_EXTERNAL_STREAM: number;
  FT_FACE_FLAG_HINTER: number;
  FT_FACE_FLAG_CID_KEYED: number;
  FT_FACE_FLAG_TRICKY: number;
  FT_FACE_FLAG_COLOR: number;
  FT_FACE_FLAG_VARIATION: number;
  FT_FACE_FLAG_SVG: number;
  FT_FACE_FLAG_SBIX: number;
  FT_FACE_FLAG_SBIX_OVERLAY: number;

  FT_STYLE_FLAG_ITALIC: number;
  FT_STYLE_FLAG_BOLD: number;
}

export interface FT_Glyph_Metrics {
  width: number;
  height: number;
  horiBearingX: number;
  horiBearingY: number;
  horiAdvance: number;
  vertBearingX: number;
  vertBearingY: number;
  vertAdvance: number;
}

export interface FT_GlyphSlotRec {
  linearHoriAdvance: number;
  linearVertAdvance: number;
  glyph_index: number;
  advance: FT_Vector;
  metrics: number;
  format: number;
  bitmap: FT_Bitmap;
  bitmap_left: number;
  bitmap_top: number;
}

export interface FT_Vector {
  x: number;
  y: number;
}

export interface FT_Bitmap {
  rows: number;
  width: number;
  pitch: number;
  imagedata: ImageData | null;
  num_grays: number;
  pixel_mode: number;
}

export interface FT_CharMapRec {
  encoding: number;
  platform_id: number;
  encoding_id: number;
}

export interface FT_Bitmap_Size {
  width: number;
  height: number;
  size: number;
  x_ppem: number;
  y_ppem: number;
}

export interface FT_Size_Metrics {
  x_ppem: number;
  y_ppem: number;
  x_scale: number;
  y_scale: number;
  ascender: number;
  descender: number;
  height: number;
  max_advance: number;
}

export interface FT_BBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface FT_SizeRec {
  metrics: FT_SizeRec;
}

export interface FT_FaceRec {
  face_flags: number;
  style_flags: number;
  ascender: number;
  descender: number;
  height: number;
  bbox: FT_BBox;
  max_advance_width: number;
  max_advance_height: number;
  underline_position: number;
  underline_thickness: number;
  size: FT_SizeRec;
  family_name: string;
  style_name: string;
  charmaps: FT_CharMapRec[];
  available_sizes: FT_Bitmap[];
}
