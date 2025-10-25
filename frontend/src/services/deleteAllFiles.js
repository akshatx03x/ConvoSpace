import axios from 'axios';

export const deleteAllFiles = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/files/delete-all`, {
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error while deleting all files:', error.message);
        return null;
    }
};
