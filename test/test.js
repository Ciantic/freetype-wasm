// @ts-check
import FreetypeInit from "../dist/freetype.js";
const Freetype = await FreetypeInit();

async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

async function createGoogleFont(fontName) {
  const url = `https://fonts.googleapis.com/css?family=${fontName}&text=D`;
  const css = await fetch(url);
  const text = await css.text();
  const urls = [...text.matchAll(/url\(([^\(\)]+)\)/g)].map((m) => m[1]);
  return await createFontFromUrl(urls[0]);
}

/**
 * Draw glyph to console
 * @param {import("../dist/freetype.js").FT_GlyphSlotRec} glyph 
 */
function consoleDrawGlyph(glyph) {
  const pixels = [""];
  const data = glyph.bitmap.imagedata?.data;
  const width = glyph.bitmap.imagedata?.width;
  const height = glyph.bitmap.imagedata?.height;
  if (!data || !width || !height) {
    return;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const element = data[(y*width + x + 1) * 4 - 1];
      if (element === undefined) {
        continue
      } else if (element === 0) {
        pixels.push(" ")
      } else if (element > 200) {
        pixels.push("#")
      } else if (element < 128)  {
        pixels.push(".")
      } else if (element < 200)  {
        pixels.push("o")
      }
    }
    pixels.push("\n");
  }
  console.log(pixels.join(""));
}

const font = await createGoogleFont("Karla");
const emptyarr = await createGoogleFont("Karla");
const setf = Freetype.SetFont("Karla", "Regular");
const charm = Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const size = Freetype.SetPixelSize(16, 0);
const chars = Freetype.LoadGlyphsFromCharmap(0, 9999, Freetype.FT_LOAD_RENDER);
const charsmono = Freetype.LoadGlyphsFromCharmap(0, 9999, Freetype.FT_LOAD_RENDER | Freetype.FT_LOAD_MONOCHROME | Freetype.FT_LOAD_TARGET_MONO);
const monod = charsmono.get(0x44); // 0x33 = letter D
const chard = chars.get(0x44);
if (!chard || !monod) {
  throw new Error("Glyphs not loaded");
}
console.assert(
  charm.encoding === Freetype.FT_ENCODING_UNICODE,
  "Charmap not set",
  charm
);
console.assert(setf.family_name === "Karla", "Font set returned value", setf);
console.assert(font[0].family_name === "Karla", "Font should load", font);
console.assert(emptyarr.length === 0, "Font should not reload", emptyarr);
console.assert(size.x_ppem === 16, "Font size not proper", size);
console.assert(chars.size > 1, "Antialized glyphs not loaded", chars.size);
console.assert(charsmono.size > 1, "Monochrome glyphs not loaded", chars.size);
console.assert(chard?.bitmap.imagedata != null, "Antialiased data does not exist");
console.assert(chard.bitmap.pixel_mode === 2, "Gray mode is not enabled", chard.bitmap.pixel_mode);
console.assert(monod?.bitmap.imagedata != null, "Monochrome data does not exist");
console.assert(monod.bitmap.pixel_mode === 1, "Monochrome data is not monochrome", monod.bitmap.pixel_mode);

console.log("You should see an antialiaised letter D in the console:");
consoleDrawGlyph(chard);

console.log("You should see an monochrome letter D in the console:");
consoleDrawGlyph(monod);

Freetype.UnloadFont("Karla");
console.assert(null === Freetype.SetFont("Karla", "DIN"), "Failure");
Freetype.Cleanup();
console.log("✅ Test finished without assertions");