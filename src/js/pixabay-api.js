import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

export function getImagesByQuery(query) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  return axios
    .get(BASE_URL, { params })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      throw error;
    });
}
