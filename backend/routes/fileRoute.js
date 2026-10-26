import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { uploadFile, downloadFile, getFiles, deleteAllFiles, deleteFile } from '../controllers/fileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const allowedMimeTypes = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
]);

const allowedExtensions = new Set([
    '.pdf', '.docx', '.doc', '.txt', '.md', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif'
]);

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: PDF, DOCX, DOC, TXT, MD, CSV, PNG, JPG, WEBP, GIF.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: fileFilter
});

router.post('/upload', protect, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
            }
            return res.status(400).json({ message: `Multer upload error: ${err.message}` });
        } else if (err) {
            console.error('File upload error:', err.message);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, uploadFile);

router.get('/files', protect, getFiles);
router.get('/files/:fileId', protect, downloadFile);
router.delete('/files/:fileId', protect, deleteFile);
router.delete('/files/delete-all', protect, deleteAllFiles);

export default router;
