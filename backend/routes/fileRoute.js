import express from 'express';
import multer from 'multer';
import { uploadFile, downloadFile, getFiles, deleteAllFiles } from '../controllers/fileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: fileFilter
});

import { deleteFile } from '../controllers/fileController.js';

router.post('/upload', protect, upload.single('file'), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.log('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
        }
    } else if (err) {
        console.log('File upload error:', err.message);
        return res.status(400).json({ message: err.message });
    }
    next();
}, uploadFile);
router.get('/files', protect, getFiles);
router.get('/files/:fileId', protect, downloadFile);
router.delete('/files/:fileId', protect, deleteFile);
router.delete('/files/delete-all', protect, deleteAllFiles);

export default router;
