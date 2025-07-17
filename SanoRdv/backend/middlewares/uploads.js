import multer from 'multer';
import fs from 'fs';
import path from 'path';

// 📁 Définir le chemin du dossier d’upload
const uploadDir = path.join('uploads');

// 📂 Créer le dossier s’il n’existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎯 Configuration de stockage Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

export const upload = multer({ storage });
