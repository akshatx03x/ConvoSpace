import axios from 'axios';

export const uploadFile = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, data, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error while uploading:', error);
    const message = error.response?.data?.message || error.message || 'File upload failed';
    throw new Error(message);
  }
};

