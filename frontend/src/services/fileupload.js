import axios from 'axios'
export const uploadFile = async (data) => {
    try {
      let response= await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, data, { withCredentials: true });
      return response.data;
    } catch (error)
    {
        console.log('Error while Uploading ',error.message);     
    }
}