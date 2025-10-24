import axios from 'axios';

export const getFiles = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/files`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.log('Error while fetching files:', error.message);
        return { files: [] };
    }
};
