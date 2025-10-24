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

const upload = multer({ storage: storage });

import { deleteFile } from '../controllers/fileController.js';

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/files', protect, getFiles);
router.get('/files/:fileId', protect, downloadFile);
router.delete('/files/:fileId', protect, deleteFile);
router.delete('/files/delete-all', protect, deleteAllFiles);

export default router;
