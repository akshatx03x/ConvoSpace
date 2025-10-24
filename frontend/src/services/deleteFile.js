import axios from 'axios';

export const deleteFile = async (fileId) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/files/${fileId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.log('Error while deleting file:', error.message);
        return null;
    }
};
