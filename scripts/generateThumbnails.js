const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * 画像のサムネイルを生成する関数
 * @param {string} inputPath - 入力画像のパス
 * @param {string} outputPath - 出力画像のパス
 * @param {Object} options - サムネイル生成オプション
 */
async function generateThumbnail(inputPath, outputPath, options = {}) {
  const {
    width = 20,
    height = 30,
    blur = 5,
    quality = 60
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .blur(blur)
      .jpeg({ quality })
      .toFile(outputPath);
    
    console.log(`✓ Generated thumbnail: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Error generating thumbnail for ${inputPath}:`, error);
  }
}

/**
 * ディレクトリ内の画像からサムネイルを生成する関数
 * @param {string} imageDir - 画像ディレクトリのパス
 */
async function generateThumbnails(imageDir = './public/images') {
  try {
    console.log('Starting thumbnail generation...');
    
    // 画像ディレクトリの存在確認
    await fs.access(imageDir);
    
    // フィルムカテゴリディレクトリの取得
    const films = await fs.readdir(imageDir);
    
    for (const film of films) {
      const filmPath = path.join(imageDir, film);
      const stats = await fs.stat(filmPath);
      
      // ディレクトリの場合のみ処理
      if (stats.isDirectory()) {
        console.log(`\nProcessing film category: ${film}`);
        const images = await fs.readdir(filmPath);
        
        for (const image of images) {
          // サムネイル以外の画像を処理
          if (!image.includes('thumb') && !image.startsWith('.')) {
            const inputPath = path.join(filmPath, image);
            const outputPath = path.join(filmPath, `thumb_${image}`);
            
            // サムネイルの生成
            await generateThumbnail(inputPath, outputPath);
          }
        }
      }
    }
    
    console.log('\n✓ Thumbnail generation completed successfully!');
  } catch (error) {
    console.error('✗ Error during thumbnail generation:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  generateThumbnails()
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = generateThumbnails; 