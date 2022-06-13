export default function Freetype(): Promise<FreetypeModule>;

interface FreetypeModule {
  LoadFontFromBytes: (bytes: Uint8Array | number[]) => FT_FaceRec;

  UnloadFont: (familyName: string) => void;

  SetFont: (familyName: string, styleName: string) => void;

  SetCharSize: (
    char_width: number,
    char_height: number,
    horz_resolution: number,
    vert_resolution: number
  ) => FT_Size_Metrics;

  SetPixelSize: (pixel_width: number, pixel_height: number) => FT_Size_Metrics;

  LoadChars: (
    chars: string,
    load_flags: number,
    cb: (glyph: FT_GlyphSlotRec) => void
  ) => void;

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
}

interface FT_Glyph_Metrics {
  width: number;
  height: number;
  horiBearingX: number;
  horiBearingY: number;
  horiAdvance: number;
  vertBearingX: number;
  vertBearingY: number;
  vertAdvance: number;
}

interface FT_GlyphSlotRec {
  linearHoriAdvance: number;
  linearVertAdvance: number;
  advance: FT_Vector;
  metrics: number;
  format: number;
  bitmap: FT_Bitmap;
  bitmap_left: number;
  bitmap_top: number;
}

interface FT_Vector {
  x: number;
  y: number;
}

interface FT_Bitmap {
  rows: number;
  width: number;
  pitch: number;
  buffer: Uint8Array;
  num_grays: number;
  pixel_mode: number;
}

interface FT_CharMapRec {
  encoding: number;
  platform_id: number;
  encoding_id: number;
}

interface FT_Bitmap_Size {
  width: number;
  height: number;
  size: number;
  x_ppem: number;
  y_ppem: number;
}

interface FT_Size_Metrics {
  x_ppem: number;
  y_ppem: number;
  x_scale: number;
  y_scale: number;
  ascender: number;
  descender: number;
  height: number;
  max_advance: number;
}

interface FT_BBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

interface FT_SizeRec {
  metrics: FT_SizeRec;
}

interface FT_FaceRec {
  ascender: number;
  descender: number;
  height: number;
  bbox: FT_BBox;
  max_advance_width: number;
  max_advance_height: number;
  underline_position: number;
  underline_thickness: number;
  size: number;
  family_name: string;
  style_name: string;
  charmaps: FT_CharMapRec[];
  available_sizes: FT_Bitmap[];
}
