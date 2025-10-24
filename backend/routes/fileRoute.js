import express from 'express';
import multer from 'multer';
import { uploadFile, downloadFile, getFiles, deleteAllFiles } from '../controllers/fileController.js';

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

router.post('/upload', upload.single('file'), uploadFile);
router.get('/files', getFiles);
router.get('/files/:fileId', downloadFile);
router.delete('/files/delete-all', deleteAllFiles);

export default router;
