// @ts-check
import FreetypeInit from "./freetype.js";
const Freetype = await FreetypeInit();

/**
 * @typedef {Object} DrawCacheEntry
 * @property {import("./freetype.js").FT_GlyphSlotRec} glyph
 * @property {ImageBitmap|null} bitmap
 *
 * @typedef {Map<string, DrawCacheEntry>} DrawCache
 */

/**
 * Create from URL
 *
 * @param {*} url
 * @returns {Promise<import("./freetype.js").FT_FaceRec[]>}
 */
async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

/**
 * Create from Google fonts
 *
 * @param {string} fontName
 * @param {number} index
 * @returns {Promise<import("./freetype.js").FT_FaceRec[]>}
 */
async function createGoogleFont(fontName, index = 0) {
  const url = `https://fonts.googleapis.com/css?family=${fontName}`;
  const css = await fetch(url);
  const text = await css.text();
  const urls = [...text.matchAll(/url\(([^\(\)]+)\)/g)].map((m) => m[1]);
  return await createFontFromUrl(urls[index]);
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
  for (const char of new Set(str)) {
    const point = char.codePointAt(0);
    if (!cache.has(char) && point !== undefined) {
      codes.push(point);
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
  for (const char of str) {
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
const ctx = canvas?.getContext("2d");
if (!canvas || !ctx) {
  throw new Error("No canvas or context found");
}
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.style.width = Math.floor(canvas.width / window.devicePixelRatio) + "px";

await createGoogleFont("Permanent+Marker", 0);
const font = Freetype.SetFont("Permanent Marker", "Regular");
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
