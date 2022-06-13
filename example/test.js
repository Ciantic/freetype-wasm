// @ts-check
import FreetypeInit from "./ft.js";
let Freetype = await FreetypeInit();
console.log("Freetype", Freetype);
async function createFontFromUrl(url) {
  const font = await fetch(url);
  const buffer = await font.arrayBuffer();
  const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
  return face;
}

// TODO: WOFF2 not working?
// const font2 = await createFontFromUrl(
//   "https://fonts.gstatic.com/s/opensans/v29/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0B4gaVI.woff2"
// );
const font = await createFontFromUrl("OSP-DIN.ttf");
console.log("Loaded font", font);
console.log("Next is already loaded error:");
await createFontFromUrl("OSP-DIN.ttf");
Freetype.SetFont("OSP-DIN", "DIN");
Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const size = Freetype.SetPixelSize(0, 32);
console.log("New size", size);
Freetype.LoadChars("iab", Freetype.FT_LOAD_RENDER, (glyph) => {
  console.log("glyph", glyph);
});
Freetype.UnloadFont("OSP-DIN");
console.log("Set should fail");
Freetype.SetFont("OSP-DIN", "DIN");
