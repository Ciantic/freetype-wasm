// @ts-check
import FreetypeInit from "./ft.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const Freetype = await FreetypeInit();

canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.style.width = Math.floor(canvas.width / window.devicePixelRatio) + "px";

async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

/**
 * Create charmap
 *
 * @returns {Map<string, import("./ft.js").FT_GlyphSlotRec>}
 */
function createCharmap() {
  /**
   * @type {Map<string, import("./ft.js").FT_GlyphSlotRec>}
   */
  let charmap = new Map();
  let offsetx = 0;
  let offsety = line_height;
  Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
  Freetype.LoadChars(
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LIGHT,
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD,
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD_V,
    Freetype.FT_LOAD_RENDER,
    (glyph, charcode) => {
      charmap.set(String.fromCharCode(charcode), glyph);

      if (glyph.bitmap.imagedata) {
        console.log("imagedata?", glyph.bitmap.imagedata);
        ctx.putImageData(
          glyph.bitmap.imagedata,
          offsetx + glyph.bitmap_left,
          offsety - glyph.bitmap_top
        );
      }

      offsetx += glyph.advance.x >> 6;
      if (charcode > 89) {
        return false;
      }
    }
  );
  return charmap;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {Map<string, import("./ft.js").FT_GlyphSlotRec>} charmap
 * @param {number} offsety
 */
function drawText(ctx, text, charmap, offsetx, offsety) {
  const chars = [...text];

  let prevGlyph = null;
  for (const currChar of chars) {
    // Get glyph from character map
    const currGlyph = charmap.get(currChar);
    if (!currGlyph) {
      console.error(
        `Skipped drawing glyph, characted not found for "${currChar}".`
      );
      continue;
    }

    // Add kerning if previous character exists and kerning exists
    if (prevGlyph && !!(font.face_flags & Freetype.FT_FACE_FLAG_KERNING)) {
      const kerning = Freetype.GetKerning(
        prevGlyph.glyph_index,
        currGlyph.glyph_index,
        0
      );
      console.log("kerning", kerning);
      offsetx += kerning.x >> 6;
    }

    if (currGlyph.bitmap.imagedata) {
      ctx.putImageData(
        currGlyph.bitmap.imagedata,
        offsetx + currGlyph.bitmap_left,
        offsety - currGlyph.bitmap_top
      );
    }

    // Adavance the pen
    offsetx += currGlyph.advance.x >> 6;
    prevGlyph = currGlyph;
  }
}

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 64);
const line_height = size.height >> 6;
const charmap = createCharmap();
drawText(ctx, "AVIATORS FOR THE WIN.", charmap, 0, line_height * 3);
console.log("Set font", font);
console.log("Set size", size);
console.log("Done loading chars");
console.log("Charmap by unicode char", charmap);
console.log("Has kerning", !!(font.face_flags & Freetype.FT_FACE_FLAG_KERNING));
Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
console.log("Cleanup done");
