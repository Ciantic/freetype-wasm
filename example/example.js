// @ts-check
import FreetypeInit from "./ft.js";
const Freetype = await FreetypeInit();

/**
 * @typedef {Object} DrawCacheEntry
 * @property {import("./ft.js").FT_GlyphSlotRec} glyph
 * @property {ImageBitmap|null} bitmap
 *
 * @typedef {Map<string, DrawCacheEntry>} DrawCache
 */

/**
 *
 * @param {*} url
 * @returns {Promise<import("./ft.js").FT_FaceRec[]>}
 */
async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

/**
 * Update glyph and bitmap caches
 *
 * @param {string} str
 * @param {DrawCache} cache
 */
async function updateCache(str, cache) {
  // Get char codes without bitmaps
  const codes = [];
  for (const c of new Set(str)) {
    if (!cache.has(c)) {
      codes.push(c.codePointAt(0));
    }
  }

  // Populate missing bitmaps
  const newGlyphs = Freetype.LoadGlyphs(codes, Freetype.FT_LOAD_RENDER);
  for (const [code, glyph] of newGlyphs) {
    const char = String.fromCodePoint(code);
    cache.set(char, {
      glyph,
      bitmap: glyph.bitmap.imagedata
        ? await createImageBitmap(glyph.bitmap.imagedata)
        : null,
    });
  }

  // TODO: Is awaiting with Promise.all faster? Is GPU uploading parallelizable?
}
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} str
 * @param {number} offsetx
 * @param {number} offsety
 * @param {DrawCache} cache
 */
export async function write(ctx, str, offsetx, offsety, cache) {
  await updateCache(str, cache);
  let prev = null;
  for (const char of [...str]) {
    const { glyph, bitmap } = cache.get(char) || {};
    if (glyph) {
      // Kerning
      if (prev) {
        const kerning = Freetype.GetKerning(
          prev.glyph_index,
          glyph.glyph_index,
          0
        );
        offsetx += kerning.x >> 6;
      }

      if (bitmap) {
        ctx.drawImage(
          bitmap,
          offsetx + glyph.bitmap_left,
          offsety - glyph.bitmap_top
        );
      }

      offsetx += glyph.advance.x >> 6;
      prev = glyph;
    }
  }
}

// Create pixel perfect canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.style.width = Math.floor(canvas.width / window.devicePixelRatio) + "px";

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 32 * window.devicePixelRatio);
const cmap = Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const cache = new Map();
const line_height = size.height >> 6;
if (!cmap) {
  console.assert(false, "Unicode charmap is not found");
}
console.log("Font", font);
console.log("Size", size);
console.log("Charmap", cmap);
await write(ctx, "LT. AVIATORS FOR THE WIN!", 0, line_height, cache);
await write(ctx, "Lt. Aviators For The Win!", 0, line_height * 2, cache);

// NOTE: When changing font or size the cache must be cleared

Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
