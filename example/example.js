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

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 64);
console.log("Set font", font);
console.log("Set size", size);

let offsetx = 0;
/**
 * @type {{[k: string] : import("./ft.js").FT_GlyphSlotRec}}
 */
let charmap = {};
Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
Freetype.LoadChars(
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LIGHT,
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD,
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD_V,
  Freetype.FT_LOAD_RENDER,
  (glyph, charcode) => {
    const id = ctx.createImageData(1, 1);
    const d = id.data;
    const line_height = size.height >> 6;
    charmap[String.fromCharCode(charcode)] = glyph;

    // Stop iterating on 90th charcode
    if (charcode > 90) {
      return false;
    }

    // For actual usage, you might want to store the image data slices, since
    // following is slow way to draw canvas.
    for (let y = 0; y < glyph.bitmap.rows; y++) {
      for (let x = 0; x < glyph.bitmap.width; x++) {
        const value = glyph.bitmap.buffer[y * glyph.bitmap.width + x];
        d[0] = 0;
        d[1] = 0;
        d[2] = 0;
        d[3] = value;
        ctx.putImageData(
          id,
          glyph.bitmap_left + offsetx + x,
          y - glyph.bitmap_top + line_height
        );
      }
    }
    offsetx += glyph.advance.x >> 6;
  }
);
console.log("Done loading chars");
console.log("Charmap by unicode char", charmap);
const kern = Freetype.GetKerning(
  charmap["V"].glyph_index,
  charmap["A"].glyph_index,
  0
);
const kern2 = Freetype.GetKerning(
  charmap["T"].glyph_index,
  charmap["."].glyph_index,
  0
);
const kern3 = Freetype.GetKerning(
  charmap["I"].glyph_index,
  charmap["I"].glyph_index,
  0
);
console.log("kern", kern, kern2, kern3);
Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
console.log("Cleanup done");
