import FreetypeInit from "./ft.js";

const canvas = document.querySelector("#main");
const ctx = canvas.getContext("2d");
const Freetype = await FreetypeInit();

async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

await createFontFromUrl("OSP-DIN.ttf");
const font = Freetype.SetFont("OSP-DIN", "DIN");
const size = Freetype.SetPixelSize(0, 32);
console.log("Set font", font);
console.log("Set size", size);

let offsetx = 0;
Freetype.LoadChars(
  "The quick brown fox jumps over the lazy dog.",
  // Freetype.FT_LOAD_RENDER
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LIGHT
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD
  // Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_TARGET_LCD_V
  Freetype.FT_LOAD_RENDER,
  (glyph) => {
    const id = ctx.createImageData(1, 1);
    const d = id.data;
    const line_height = size.height >> 6;
    if (offsetx == 0) console.log("glyph", glyph);

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
Freetype.UnloadFont("OSP-DIN");
Freetype.Cleanup();
