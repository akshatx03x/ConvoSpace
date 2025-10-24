import axios from 'axios';

export const deleteAllFiles = async () => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/files/delete-all`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.log('Error while deleting all files:', error.message);
        return null;
    }
};
