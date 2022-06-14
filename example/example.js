// @ts-check
import FreetypeInit from "./ft.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const Freetype = await FreetypeInit();

ctx.globalCompositeOperation = "overlay";
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
  Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
  Freetype.LoadChars(
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LIGHT,
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD,
    // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD_V,
    Freetype.FT_LOAD_RENDER,
    (glyph, charcode) => {
      // const dst = new ArrayBuffer(glyph.bitmap.buffer.byteLength);
      // const newbuf = new Uint8Array(dst);
      // newbuf.set(glyph.bitmap.buffer);
      // glyph.bitmap.buffer = newbuf;
      charmap.set(String.fromCharCode(charcode), glyph);
      if (glyph.bitmap.rows == 0) {
        return;
      }
      // Stop iterating on 90th charcode
      const imagedata = glyphImageData(ctx, glyph);
      ctx.putImageData(
        imagedata,
        offsetx + glyph.bitmap_left,
        0 - glyph.bitmap_top + line_height
      );

      drawGlyph(ctx, pixeldata, glyph, offsetx, line_height * 2);

      offsetx += glyph.advance.x >> 6;
      if (charcode > 89) {
        return false;
      }
    }
  );
  return charmap;
}

/**
 * Draw single glyph to canvas
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./ft.js").FT_GlyphSlotRec} glyph
 */
function glyphImageData(ctx, glyph) {
  const height = glyph.bitmap.rows;
  const width = glyph.bitmap.width;
  const id = ctx.createImageData(width, height);

  for (let y = 0; y < glyph.bitmap.rows; y++) {
    for (let x = 0; x < glyph.bitmap.width; x++) {
      const value = glyph.bitmap.buffer[y * glyph.bitmap.width + x];
      const n = (y * width + x) * 4;

      id.data[n + 0] = 0;
      id.data[n + 1] = 0;
      id.data[n + 2] = 0;
      id.data[n + 3] = value;
    }
  }
  return id;
}

/**
 * Draw single glyph to canvas
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ImageData} pixeldata
 * @param {import("./ft.js").FT_GlyphSlotRec} glyph
 * @param {number} offsetx
 * @param {number} offsety
 */
function drawGlyph(ctx, pixeldata, glyph, offsetx, offsety) {
  for (let y = 0; y < glyph.bitmap.rows; y++) {
    for (let x = 0; x < glyph.bitmap.width; x++) {
      const value = glyph.bitmap.buffer[y * glyph.bitmap.width + x];
      pixeldata.data[0] = 0;
      pixeldata.data[1] = 0;
      pixeldata.data[2] = 0;
      pixeldata.data[3] = value;
      ctx.putImageData(
        pixeldata,
        glyph.bitmap_left + offsetx + x,
        y - glyph.bitmap_top + offsety
      );
    }
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ImageData} pixeldata
 * @param {string} text
 * @param {Map<string, import("./ft.js").FT_GlyphSlotRec>} charmap
 * @param {number} offsety
 */
function drawText(ctx, pixeldata, text, charmap, offsetx, offsety) {
  const chars = [...text];

  let prevGlyph = null;
  let advance = offsetx;
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
      advance += kerning.x >> 6;
    }

    drawGlyph(ctx, pixeldata, currGlyph, advance, offsety);

    // Adavance the pen
    advance += currGlyph.advance.x >> 6;
    prevGlyph = currGlyph;
  }
}

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 64);
const pixeldata = ctx.createImageData(1, 1);
const line_height = size.height >> 6;
const charmap = createCharmap();
drawText(ctx, pixeldata, "AVIATORS FOR THE WIN.", charmap, 0, line_height * 3);
console.log("Set font", font);
console.log("Set size", size);
console.log("Done loading chars");
console.log("Charmap by unicode char", charmap);
console.log("Has kerning", !!(font.face_flags & Freetype.FT_FACE_FLAG_KERNING));
Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
console.log("Cleanup done");
