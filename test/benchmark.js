import FreetypeInit from "../dist/freetype.js";
const Freetype = await FreetypeInit();

async function createFontFromUrl(url) {
    const font = await fetch(url);
    const buffer = await font.arrayBuffer();
    const face = Freetype.LoadFontFromBytes(new Uint8Array(buffer));
    return face;
}

export async function createGoogleFont(fontName) {
    const url = `https://fonts.googleapis.com/css?family=${fontName}`;
    const css = await fetch(url);
    const text = await css.text();
    const urls = [...text.matchAll(/url\(([^\(\)]+)\)/g)].map((m) => m[1]);
    return await createFontFromUrl(urls[0]);
}

const font2 = await createGoogleFont("Roboto");
const setf = Freetype.SetFont("Roboto", "Regular");
const charm = Freetype.SetCharmap(Freetype.FT_ENCODING_UNICODE);
const size = Freetype.SetPixelSize(500, 0);

const start = performance.now();
const chars = Freetype.LoadGlyphsFromCharmap(0, 9999, Freetype.FT_LOAD_RENDER);
console.log(
    `Loading ${chars.size} glyphs took ${performance.now() - start} ms`
);
