#include <stdio.h>
#include <string.h>

#include <freetype/freetype.h>

#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <emscripten/fetch.h>
#include <emscripten/bind.h>

FT_Library library;
FT_Face current_face;
bool inited = false;

// FamilyName -> StyleName -> FT_Face
std::map<std::string, std::map<std::string, FT_Face>> face_map;

// FamilyName -> Byte arrays
std::map<std::string, std::vector<FT_Bytes>> face_ptrs;

void Init()
{
    if (!inited)
    {
        FT_Init_FreeType(&library);
        inited = true;
    }
}

void Cleanup()
{
    if (inited)
    {
        FT_Done_FreeType(library);
        // TODO: Clear library and faces
    }
}

std::vector<FT_FaceRec> LoadFontFromBytes(std::vector<unsigned char> font)
{
    FT_Error error;
    FT_Face ft_face;
    std::vector<FT_FaceRec> rtn;

    // Store the font to a wasm memory
    signed long size = font.size();
    FT_Bytes ptr = (FT_Bytes)::malloc(size);
    ::memcpy((void *)ptr, font.data(), size);
    Init();

    // Get num of faces
    error = FT_New_Memory_Face(library, ptr, size, -1, &ft_face);
    if (error)
    {
        ::free((void *)ptr);
        fprintf(stderr, "FreeType: FT_New_Memory_Face (face index -1) failed.\n");
        return rtn;
    }
    int num_faces = ft_face->num_faces;
    FT_Done_Face(ft_face);

    // Iterate faces stored in the font
    for (int i = 0; i < num_faces; i++)
    {
        error = FT_New_Memory_Face(library, ptr, size, i, &ft_face);
        if (error)
        {
            fprintf(stderr, "FreeType: FT_New_Memory_Face (face index %d) failed.\n", i);
            ::free((void *)ptr);
            return rtn;
        }

        // If family and style name is already loaded then bail out
        if (face_map[ft_face->family_name][ft_face->style_name] != 0)
        {
            fprintf(stderr, "FreeType: Font '%s' with style '%s' already loaded.\n", ft_face->family_name, ft_face->style_name);
            FT_Done_Face(ft_face);
            ::free((void *)ptr);
            return rtn;
        }

        // Store the font to memory
        if (i == 0)
        {
            face_ptrs[ft_face->family_name].push_back(ptr);
        }

        printf("Font '%s' with style '%s' loaded.\n", ft_face->family_name, ft_face->style_name);

        face_map[ft_face->family_name][ft_face->style_name] = ft_face;

        rtn.push_back(*ft_face);

        // Note: each face is left in the memory, no FT_Done_Face is called. To
        // free the memory, one must call `UnloadFont` manually.
    }

    return rtn;
}

void UnloadFont(std::string familyName)
{
    // Unset current face if it matches
    if (current_face != NULL)
    {
        if (current_face->family_name == familyName)
        {
            current_face = NULL;
        }
    }

    // Unload faces
    auto &faces = face_map[familyName];
    for (auto it = faces.begin(); it != faces.end(); it++)
    {
        FT_Done_Face(it->second);
    }
    face_map.erase(familyName);

    // Restore font memory
    auto &mems = face_ptrs[familyName];
    for (auto mem : mems)
    {
        ::free((void *)mem);
    }
    face_ptrs.erase(familyName);
}

FT_FaceRec SetFont(std::string faceName, std::string styleName)
{
    current_face = face_map[faceName][styleName];
    if (current_face == NULL)
    {
        // TODO: Return null
    }
    return *current_face;
}

FT_Size_Metrics SetCharSize(FT_F26Dot6 char_width, FT_F26Dot6 char_height, FT_UInt horz_resolution, FT_UInt vert_resolution)
{

    if (current_face == NULL)
    {
        fprintf(stderr, "FreeType: Unable to set size, font is not set. Use `SetFont` first.");
        // TODO: Return null
        return current_face->size->metrics;
    }

    FT_Error error = FT_Set_Char_Size(current_face, char_width, char_height, horz_resolution, vert_resolution);
    if (error)
    {
        fprintf(stderr, "FreeType: Error setting size.\n");
        // TODO: Return null
        return current_face->size->metrics;
    }

    return current_face->size->metrics;
}

FT_Size_Metrics SetPixelSize(
    FT_UInt pixel_width,
    FT_UInt pixel_height)
{

    if (current_face == NULL)
    {
        fprintf(stderr, "FreeType: Unable to set size, font is not set. Use `SetFont` first.");
        // TODO: Return null
        return current_face->size->metrics;
    }

    FT_Error error = FT_Set_Pixel_Sizes(current_face, pixel_width, pixel_height);
    if (error)
    {
        fprintf(stderr, "FreeType: Error setting size.\n");
        // TODO: Return null
        return current_face->size->metrics;
    }

    return current_face->size->metrics;
}

// TODO: Is transform any good? In docs it says:
//
// "Using floating-point computations to perform the transform directly in
// client code instead will always yield better numbers."
//
// Then why even expose this function?
//
// void SetTransform() { if (current_face == NULL)
//     {
//         fprintf(stderr, "FreeType: Current font is not set.`\n");
//         return;
//     }
//     FT_Set_Transform(current_face, NULL, &pen);
// }

// https://freetype.org/freetype2/docs/reference/ft2-base_interface.html#ft_load_xxx

void LoadChars(std::string chars, FT_Int32 load_flags, emscripten::val cb)
{
    if (current_face == NULL)
    {
        fprintf(stderr, "FreeType: Current font is not set, use first `LoadFontFromBytes` and then `LoadChar`\n");
        return;
    }

    for (auto &c : chars)
    {
        FT_Error error = FT_Load_Char(current_face, c, load_flags);
        cb(*current_face->glyph);
    }
}

emscripten::val Size_Getter(const FT_FaceRec &v)
{
    return emscripten::val(*v.size);
}

emscripten::val Encoding_Getter(const FT_CharMapRec &v)
{
    return emscripten::val((unsigned long)v.encoding);
}

emscripten::val StyleName_Getter(const FT_FaceRec &v)
{
    return emscripten::val(std::string(v.style_name));
}

emscripten::val FamilyName_Getter(const FT_FaceRec &v)
{
    return emscripten::val(std::string(v.family_name));
}

emscripten::val CharMaps_Getter(const FT_FaceRec &v)
{
    std::vector<FT_CharMapRec> vec;
    for (int k = 0; k < v.num_charmaps; k++)
    {
        vec.push_back(*v.charmaps[k]);
    }
    return emscripten::val(vec);
}

emscripten::val AvailableSizes_Getter(const FT_FaceRec &v)
{
    std::vector<FT_Bitmap_Size> vec;
    for (int k = 0; k < v.num_fixed_sizes; k++)
    {
        vec.push_back(v.available_sizes[k]);
    }
    return emscripten::val(vec);
}

emscripten::val Buffer_Getter(const FT_Bitmap &v)
{
    return emscripten::val(emscripten::typed_memory_view(v.rows * v.pitch, v.buffer));
}

template <typename T>
void NoOpSetter(T &v, emscripten::val setv) {}

// Disable VSCode error squiggles for next section
#ifndef __INTELLISENSE__

using namespace emscripten;
EMSCRIPTEN_BINDINGS(my_module)
{
    function("LoadFontFromBytes", &LoadFontFromBytes, allow_raw_pointers());
    function("UnloadFont", &UnloadFont);
    function("SetFont", &SetFont);
    function("SetCharSize", &SetCharSize);
    function("SetPixelSize", &SetPixelSize);

    function("LoadChars", &LoadChars, allow_raw_pointers());
    function("Cleanup", &Cleanup);

    value_object<FT_GlyphSlotRec>("FT_GlyphSlotRec")
        .field("linearHoriAdvance", &FT_GlyphSlotRec::linearHoriAdvance)
        .field("linearVertAdvance", &FT_GlyphSlotRec::linearVertAdvance)
        .field("advance", &FT_GlyphSlotRec::advance)
        // .field("format", &FT_GlyphSlotRec::format)
        .field("bitmap", &FT_GlyphSlotRec::bitmap)
        .field("bitmap_left", &FT_GlyphSlotRec::bitmap_left)
        .field("bitmap_top", &FT_GlyphSlotRec::bitmap_top);

    value_object<FT_Vector>("FT_Vector")
        .field("x", &FT_Vector::x)
        .field("y", &FT_Vector::y);

    value_object<FT_Bitmap>("FT_Bitmap")
        .field("rows", &FT_Bitmap::rows)
        .field("width", &FT_Bitmap::width)
        .field("pitch", &FT_Bitmap::pitch)
        .field("buffer", &Buffer_Getter, &NoOpSetter<FT_Bitmap>)
        .field("num_grays", &FT_Bitmap::num_grays)
        .field("pixel_mode", &FT_Bitmap::pixel_mode);

    value_object<FT_CharMapRec>("FT_CharMapRec")
        .field("encoding", &Encoding_Getter, &NoOpSetter<FT_CharMapRec>)
        .field("platform_id", &FT_CharMapRec::platform_id)
        .field("encoding_id", &FT_CharMapRec::encoding_id);

    value_object<FT_Bitmap_Size>("FT_Bitmap_Size")
        .field("width", &FT_Bitmap_Size::width)
        .field("height", &FT_Bitmap_Size::height)
        .field("size", &FT_Bitmap_Size::size)
        .field("x_ppem", &FT_Bitmap_Size::x_ppem)
        .field("y_ppem", &FT_Bitmap_Size::y_ppem);

    value_object<FT_Size_Metrics>("FT_Size_Metrics")
        .field("x_ppem", &FT_Size_Metrics::x_ppem)
        .field("y_ppem", &FT_Size_Metrics::y_ppem)
        .field("x_scale", &FT_Size_Metrics::x_scale)
        .field("y_scale", &FT_Size_Metrics::y_scale)
        .field("ascender", &FT_Size_Metrics::ascender)
        .field("descender", &FT_Size_Metrics::descender)
        .field("height", &FT_Size_Metrics::height)
        .field("max_advance", &FT_Size_Metrics::max_advance);

    value_object<FT_BBox>("FT_BBox")
        .field("xMin", &FT_BBox::xMin)
        .field("yMin", &FT_BBox::yMin)
        .field("xMax", &FT_BBox::xMax)
        .field("yMax", &FT_BBox::yMax);

    value_object<FT_SizeRec>("FT_SizeRec")
        .field("metrics", &FT_SizeRec::metrics);

    value_object<FT_FaceRec>("FT_FaceRec")
        .field("ascender", &FT_FaceRec::ascender)
        .field("descender", &FT_FaceRec::descender)
        .field("height", &FT_FaceRec::height)
        .field("bbox", &FT_FaceRec::bbox)
        .field("max_advance_width", &FT_FaceRec::max_advance_width)
        .field("max_advance_height", &FT_FaceRec::max_advance_height)
        .field("underline_position", &FT_FaceRec::underline_position)
        .field("underline_thickness", &FT_FaceRec::underline_thickness)
        .field("size", &Size_Getter, &NoOpSetter<FT_FaceRec>)
        .field("family_name", &FamilyName_Getter, &NoOpSetter<FT_FaceRec>)
        .field("style_name", &StyleName_Getter, &NoOpSetter<FT_FaceRec>)
        .field("charmaps", &CharMaps_Getter, &NoOpSetter<FT_FaceRec>)
        .field("available_sizes", &AvailableSizes_Getter, &NoOpSetter<FT_FaceRec>);

    // load targets
    constant("FT_LOAD_TARGET_NORMAL", FT_LOAD_TARGET_NORMAL);
    constant("FT_LOAD_TARGET_LIGHT", FT_LOAD_TARGET_LIGHT);
    constant("FT_LOAD_TARGET_MONO", FT_LOAD_TARGET_MONO);
    constant("FT_LOAD_TARGET_LCD", FT_LOAD_TARGET_LCD);
    constant("FT_LOAD_TARGET_LCD_V", FT_LOAD_TARGET_LCD_V);

    // load flags
    constant("FT_LOAD_DEFAULT", FT_LOAD_DEFAULT);
    constant("FT_LOAD_NO_SCALE", FT_LOAD_NO_SCALE);
    constant("FT_LOAD_NO_HINTING", FT_LOAD_NO_HINTING);
    constant("FT_LOAD_RENDER", FT_LOAD_RENDER);
    constant("FT_LOAD_NO_BITMAP", FT_LOAD_NO_BITMAP);
    constant("FT_LOAD_VERTICAL_LAYOUT", FT_LOAD_VERTICAL_LAYOUT);
    constant("FT_LOAD_FORCE_AUTOHINT", FT_LOAD_FORCE_AUTOHINT);
    constant("FT_LOAD_CROP_BITMAP", FT_LOAD_CROP_BITMAP);
    constant("FT_LOAD_PEDANTIC", FT_LOAD_PEDANTIC);
    constant("FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH", FT_LOAD_IGNORE_GLOBAL_ADVANCE_WIDTH);
    constant("FT_LOAD_NO_RECURSE", FT_LOAD_NO_RECURSE);
    constant("FT_LOAD_IGNORE_TRANSFORM", FT_LOAD_IGNORE_TRANSFORM);
    constant("FT_LOAD_MONOCHROME", FT_LOAD_MONOCHROME);
    constant("FT_LOAD_LINEAR_DESIGN", FT_LOAD_LINEAR_DESIGN);
    constant("FT_LOAD_SBITS_ONLY", FT_LOAD_SBITS_ONLY);
    constant("FT_LOAD_NO_AUTOHINT", FT_LOAD_NO_AUTOHINT);

    // encoding
    constant("FT_ENCODING_NONE", FT_ENCODING_NONE);
    constant("FT_ENCODING_UNICODE", FT_ENCODING_UNICODE);
    constant("FT_ENCODING_MS_SYMBOL", FT_ENCODING_MS_SYMBOL);
    constant("FT_ENCODING_ADOBE_LATIN_1", FT_ENCODING_ADOBE_LATIN_1);
    constant("FT_ENCODING_OLD_LATIN_2", FT_ENCODING_OLD_LATIN_2);
    constant("FT_ENCODING_SJIS", FT_ENCODING_SJIS);
    constant("FT_ENCODING_PRC", FT_ENCODING_PRC);
    constant("FT_ENCODING_BIG5", FT_ENCODING_BIG5);
    constant("FT_ENCODING_WANSUNG", FT_ENCODING_WANSUNG);
    constant("FT_ENCODING_JOHAB", FT_ENCODING_JOHAB);
    constant("FT_ENCODING_ADOBE_STANDARD", FT_ENCODING_ADOBE_STANDARD);
    constant("FT_ENCODING_ADOBE_EXPERT", FT_ENCODING_ADOBE_EXPERT);
    constant("FT_ENCODING_ADOBE_CUSTOM", FT_ENCODING_ADOBE_CUSTOM);
    constant("FT_ENCODING_APPLE_ROMAN", FT_ENCODING_APPLE_ROMAN);
}

namespace emscripten
{
    namespace internal
    {
        // Automatic conversion of std::vector<T> to JS array
        // https://github.com/emscripten-core/emscripten/issues/11070#issuecomment-717675128
        template <typename T, typename Allocator>
        struct BindingType<std::vector<T, Allocator>>
        {
            using ValBinding = BindingType<val>;
            using WireType = ValBinding::WireType;

            static WireType toWireType(const std::vector<T, Allocator> &vec)
            {
                return ValBinding::toWireType(val::array(vec));
            }

            static std::vector<T, Allocator> fromWireType(WireType value)
            {
                return vecFromJSArray<T>(ValBinding::fromWireType(value));
            }
        };

        template <typename T>
        struct TypeID<T,
                      typename std::enable_if_t<std::is_same<
                          typename Canonicalized<T>::type,
                          std::vector<typename Canonicalized<T>::type::value_type,
                                      typename Canonicalized<T>::type::allocator_type>>::value>>
        {
            static constexpr TYPEID get() { return TypeID<val>::get(); }
        };

    }
}
#endif