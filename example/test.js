// @ts-check
import FreetypeInit from "./ft.js";

let Freetype = await FreetypeInit();
async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

async function createGoogleFont(fontName) {
  const url = `https://fonts.googleapis.com/css?family=${fontName}`;
  const css = await fetch(url);
  const text = await css.text();
  const urls = [...text.matchAll(/url\(([^\(\)]+)\)/g)].map((m) => m[1]);
  return await createFontFromUrl(urls[0]);
}

const font = await createGoogleFont("Karla");
const emptyarr = await createGoogleFont("Karla");
const setf = Freetype.SetFont("Karla", "Regular");
const charm = Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const size = Freetype.SetPixelSize(0, 32);
const chars = Freetype.LoadGlyphsFromCharmap(0, 9999, Freetype.FT_LOAD_RENDER);
console.assert(
  charm.encoding === Freetype.FT_ENCODING_UNICODE,
  "Charmap not set",
  charm
);
console.assert(setf.family_name === "Karla", "Font set returned value", setf);
console.assert(font[0].family_name === "Karla", "Font should load", font);
console.assert(emptyarr.length === 0, "Font should not reload", emptyarr);
console.assert(size.height === 2368, "Font size not proper", size);
console.assert(chars.size === 113, "Glyphs not loaded", chars);
Freetype.UnloadFont("Karla");
console.assert(null === Freetype.SetFont("Karla", "DIN"), "Failure");
Freetype.Cleanup();
