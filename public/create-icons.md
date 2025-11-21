# Extension Icons Required

You need to create 4 icon PNG files in the `public/` folder:

- `icon-16.png` - 16x16 pixels (toolbar icon)
- `icon-32.png` - 32x32 pixels (toolbar icon)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store)

## Quick Icon Creation Options

### Option 1: Use Online Generator
1. Create a 128x128 icon with your logo/text
2. Upload to: https://www.favicon-generator.org/
3. Download all sizes
4. Place in `public/` folder

### Option 2: Use Image Editing Software
1. Create 128x128 icon
2. Export/resize to all 4 sizes
3. Save as PNG files

### Option 3: Simple Text Icon
You can create a simple icon with:
- Background color (e.g., blue gradient)
- Text "TC" or "Torque" 
- Simple calculator symbol

### Option 4: Convert Existing Logo
If you have a logo/image:
1. Resize to 128x128
2. Create smaller versions (48, 32, 16)
3. Ensure readable at small sizes

## Icon Design Tips

- Use simple, recognizable symbols
- High contrast colors
- Avoid small text/details (won't show at 16x16)
- Test all sizes to ensure readability

## Temporary Solution

For testing, you can create simple colored square icons using ImageMagick:

```bash
# If ImageMagick is installed:
for size in 16 32 48 128; do
  convert -size ${size}x${size} xc:'#3b82f6' -gravity center \
    -pointsize $((size/2)) -fill white -annotate +0+0 'TC' \
    public/icon-${size}.png
done
```

Or use any image editor to create 4 colored squares with "TC" text.




