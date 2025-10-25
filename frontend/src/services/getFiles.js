import axios from 'axios';

export const getFiles = async (room) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/files?room=${room}`, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error while fetching files:', error.message);
        return { files: [] };
    }
};
