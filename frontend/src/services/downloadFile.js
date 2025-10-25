import axios from 'axios';

export const downloadFile = async (fileId, fileName) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/files/${fileId}`, {
            withCredentials: true,
            responseType: 'blob', // Important for downloading files
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.log('Error while downloading file:', error.message);
    }
};
