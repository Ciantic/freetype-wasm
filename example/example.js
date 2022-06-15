// @ts-check
import FreetypeInit from "./ft.js";

/**
 * @typedef {Object} DrawCacheEntry
 * @property {import("./ft.js").FT_GlyphSlotRec} glyph
 * @property {ImageBitmap|null} bitmap
 *
 * @typedef {Map<string, DrawCacheEntry>} DrawCache
 */

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const Freetype = await FreetypeInit();

canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.style.width = Math.floor(canvas.width / window.devicePixelRatio) + "px";

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
      console.log("c", c);
      codes.push(c.charCodeAt(0));
    }
  }

  // Populate missing bitmaps
  const newGlyphs = Freetype.LoadCharss(codes, Freetype.FT_LOAD_RENDER);
  for (const [code, glyph] of newGlyphs) {
    const char = String.fromCharCode(code);
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
async function write(ctx, str, offsetx, offsety, cache) {
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

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 64);
const cache = new Map();
const line_height = size.height >> 6;
await write(ctx, "LT. AVIATORS FOR THE WIN!", 0, line_height, cache);
await write(ctx, "Lt. Aviators For The Win!", 0, line_height * 2, cache);

// NOTE: When changing font or size the cache must be cleared

Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
