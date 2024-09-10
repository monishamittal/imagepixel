const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceFolder = path.join(__dirname, 'games_images');
const destFolder = path.join(__dirname, 'resized_images');

const desiredWidth = 400;
const uniformQuality = 70; 

if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder);
}

const resizeImage = async (filePath, destPath) => {
    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        let pipeline = image.resize({
            width: desiredWidth,
            height: null,
            fit: 'cover'
        });

        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            pipeline = pipeline.jpeg({ quality: uniformQuality });
        } else if (metadata.format === 'png') {
            pipeline = pipeline.png({ compressionLevel: Math.round(uniformQuality / 10) }); 
        } else {
            console.warn(`Unsupported format ${metadata.format} for ${filePath}`);
            return;
        }

        await pipeline.toFile(destPath);
        console.log(`Resized and saved: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error}`);
    }
};

fs.readdir(sourceFolder, (err, files) => {
    if (err) {
        console.error('Error reading source folder:', err);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(sourceFolder, file);
        const destPath = path.join(destFolder, file);

        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            resizeImage(filePath, destPath);
        }
    });
});
