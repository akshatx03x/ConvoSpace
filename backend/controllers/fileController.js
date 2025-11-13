import File from '../models/files.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
    try {
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        const { room } = req.body;
        if (!room) {
            return res.status(400).json({ message: 'Room is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newFile = new File({
            path: req.file.path,
            name: req.file.originalname,
            uploader: req.user._id,
            room: room
        });

        await newFile.save();
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

export const getFiles = async (req, res) => {
    try {
        const { room } = req.query;
        if (!room) {
            return res.status(400).json({ message: 'Room is required' });
        }

        const files = await File.find({ room }).populate('uploader', 'name email');
        res.json({ files });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ message: 'Server error fetching files' });
    }
};

export const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Increment download count
        file.downloadContent += 1;
        await file.save();

        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ message: 'File not found on disk' });
        }

        res.download(file.path, file.name);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Server error during download' });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete file from disk
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await File.findByIdAndDelete(req.params.fileId);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ message: 'Server error during deletion' });
    }
};

export const deleteAllFiles = async (req, res) => {
    try {
        const { room } = req.query;
        if (!room) {
            return res.status(400).json({ message: 'Room is required' });
        }

        const files = await File.find({ room });
        for (const file of files) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        await File.deleteMany({ room });
        res.json({ message: 'All files deleted successfully' });
    } catch (error) {
        console.error('Delete all files error:', error);
        res.status(500).json({ message: 'Server error during deletion' });
    }
};
