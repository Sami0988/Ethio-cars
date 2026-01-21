# Guide to Reduce APK Size

## ✅ Already Configured

1. **Hermes Engine** - Enabled in app.json (reduces JS bundle size)
2. **ProGuard/R8** - Enabled for code shrinking
3. **Resource Shrinking** - Enabled to remove unused resources
4. **Minification** - Enabled for code minification
5. **AAB Format** - Production builds use Android App Bundle (smaller than APK)

## 📦 Additional Optimizations

### 1. Optimize Images
- Compress all images in `assets/images/` folder
- Use WebP format instead of PNG where possible
- Remove unused images
- Use vector icons instead of raster images where possible

### 2. Remove Unused Dependencies
Check if you're using all dependencies:
```bash
# Check for unused dependencies
npx depcheck
```

### 3. Optimize Assets
- Remove unused fonts
- Compress images before adding to assets
- Use `expo-optimize` to automatically optimize assets

### 4. Build Commands

**For Production (AAB - Recommended):**
```bash
eas build --platform android --profile production
```

**For APK (if needed):**
```bash
eas build --platform android --profile preview
```

### 5. Check APK Size
After building, check the size:
```bash
# AAB files are typically 20-30% smaller than APK
# They're split by device architecture automatically
```

## 🎯 Expected Results

- **Before optimization**: ~50-80 MB
- **After optimization**: ~20-40 MB (AAB format)
- **Download size**: ~15-25 MB (Google Play splits by device)

## 📝 Additional Tips

1. **Use AAB for Play Store**: Always use AAB for production (smaller)
2. **APK for direct install**: Use APK only for direct distribution
3. **Split builds**: EAS automatically creates split APKs for different architectures
4. **Monitor size**: Check build logs for size information

## 🔍 Check Current Size

After building, the EAS build output will show:
- APK/AAB size
- Download size (for AAB)
- Architecture-specific sizes
