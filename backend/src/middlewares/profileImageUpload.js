const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');

const uploadsPath = path.resolve(__dirname, '..', '..', 'uploads');
const acceptedTypes = new Map([
  ['image/jpeg', { extension: '.jpg', matches: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ['image/png', { extension: '.png', matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) }],
  ['image/webp', { extension: '.webp', matches: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }],
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, callback) => {
    if (!acceptedTypes.has(file.mimetype)) {
      return callback(new Error('Las imágenes deben estar en formato JPG, PNG o WEBP.'));
    }
    return callback(null, true);
  },
});

const handleUpload = upload.fields([
  { name: 'foto_perfil', maxCount: 1 },
  { name: 'fotos_trabajo', maxCount: 5 },
]);

const uploadProfileImages = (req, res, next) => {
  handleUpload(req, res, async (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Cada imagen debe pesar 5 MB o menos.' });
      }
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Solo puedes subir una foto de perfil y hasta cinco fotos de trabajo.' });
      }
      return res.status(400).json({ error: error.message });
    }

    const files = Object.values(req.files || {}).flat();
    const savedPaths = [];

    try {
      await fs.mkdir(uploadsPath, { recursive: true });

      for (const file of files) {
        const imageType = acceptedTypes.get(file.mimetype);
        if (!imageType.matches(file.buffer)) {
          await Promise.all(savedPaths.map((savedPath) => fs.unlink(savedPath).catch(() => {})));
          return res.status(400).json({ error: 'El contenido de una imagen no coincide con su formato.' });
        }

        const filename = `${crypto.randomUUID()}${imageType.extension}`;
        const destination = path.join(uploadsPath, filename);
        await fs.writeFile(destination, file.buffer, { flag: 'wx' });
        savedPaths.push(destination);
        file.publicUrl = `/uploads/${filename}`;
      }

      return next();
    } catch (saveError) {
      await Promise.all(savedPaths.map((savedPath) => fs.unlink(savedPath).catch(() => {})));
      console.error('Error al guardar imágenes del perfil:', saveError);
      return res.status(500).json({ error: 'No fue posible guardar las imágenes.' });
    }
  });
};

module.exports = { uploadProfileImages, uploadsPath };
