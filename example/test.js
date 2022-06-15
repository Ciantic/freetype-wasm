// @ts-check
import FreetypeInit from "./ft.js";

let Freetype = await FreetypeInit();
async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

const woff = await createFontFromUrl(
  "https://fonts.gstatic.com/s/opensans/v29/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0B4gaVI.woff2"
);
const font = await createFontFromUrl("OSP-DIN.ttf");
const emptyarr = await createFontFromUrl("OSP-DIN.ttf");
const setf = Freetype.SetFont("OSP-DIN", "DIN");
const charm = Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const size = Freetype.SetPixelSize(0, 32);
const chars = Freetype.LoadGlyphsFromCharmap(0, 9999, Freetype.FT_LOAD_RENDER);
console.assert(
  charm.encoding === Freetype.FT_ENCODING_UNICODE,
  "Charmap not set",
  charm
);
console.assert(woff[0].family_name === "Open Sans", "Font not loaded", woff);
console.assert(setf.family_name === "OSP-DIN", "Font set returned value", setf);
console.assert(font[0].family_name === "OSP-DIN", "Font should load", font);
console.assert(emptyarr.length === 0, "Font should not reload", emptyarr);
console.assert(size.height === 2368, "Font size not proper", size);
console.assert(chars.size === 140, "Glyphs not loaded", chars);
Freetype.UnloadFont("OSP-DIN");
console.assert(null === Freetype.SetFont("OSP-DIN", "DIN"), "Failure");
Freetype.Cleanup();
