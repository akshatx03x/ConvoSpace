import File from "../models/files.js";
import fs from 'fs';
import path from 'path';

export const uploadFile = async (request, response) => {
    if (!request.file) {
        return response.status(400).json({ message: "No file uploaded" });
    }

    const fileObj = {
        path: request.file.path,
        name: request.file.originalname,
        uploader: request.user.email,
        room: request.body.room
    };

    try {
        const file = await File.create(fileObj);
        console.log('File uploaded:', file.name);

        // Emit file shared event to the room
        const io = request.app.get('io');
        io.to(request.body.room).emit('file:shared', {
            fileId: file._id,
            name: file.name,
            uploader: file.uploader
        });

        return response.status(200).json({
            path: `${process.env.VITE_API_BASE_URL}/files/${file._id}`,
            message: "File uploaded successfully",
            filename: file.name
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const getFiles = async (request, response) => {
    try {
        const room = request.query.room;
        if (!room) {
            return response.status(400).json({ message: "Room parameter is required" });
        }
        const files = await File.find({ room });
        return response.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching files:', error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const downloadFile = async (request, response) => {
    try {
        const file = await File.findById(request.params.fileId);
        if (!file) {
            return response.status(404).json({ message: "File not found" });
        }

        file.downloadContent = (file.downloadContent || 0) + 1;
        await file.save();
        response.download(file.path, file.name);
    } catch (error) {
        console.error('Error downloading file:', error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const deleteFile = async (request, response) => {
    try {
        const file = await File.findById(request.params.fileId);
        if (!file) {
            return response.status(404).json({ message: "File not found" });
        }

        // Delete file from file system
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Delete from database
        await File.findByIdAndDelete(request.params.fileId);
        console.log('File deleted:', file.name);

        // Emit file deleted event to the room
        const io = request.app.get('io');
        io.to(file.room).emit('file:deleted', {
            fileId: file._id,
            name: file.name,
            uploader: file.uploader
        });

        return response.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.error('Error deleting file:', error);
        return response.status(500).json({ message: "Internal server error" });
    }
}

export const deleteAllFiles = async (request, response) => {
    try {
        const room = request.query.room;
        if (!room) {
            return response.status(400).json({ message: "Room parameter is required" });
        }
        const files = await File.find({ room });
        for (const file of files) {
            // Delete file from file system
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (fileError) {
                console.error(`Error deleting file ${file.path}:`, fileError);
                // Continue with other files even if one fails
            }
        }
        // Delete all files from database for the room
        await File.deleteMany({ room });
        console.log(`All files deleted for room: ${room}`);
        return response.status(200).json({ message: "All files deleted successfully" });
    } catch (error) {
        console.error('Error deleting files:', error);
        return response.status(500).json({ message: "Internal server error" });
    }
}
