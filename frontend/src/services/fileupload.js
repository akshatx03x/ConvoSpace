import axios from 'axios'
export const uploadFile = async (data, room) => {
    try {
      const token = localStorage.getItem('token');
      let response= await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, data, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error)
    {
        console.log('Error while Uploading ',error.message);
    }
}
