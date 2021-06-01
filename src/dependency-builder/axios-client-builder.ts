import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
  maxAge: 60 * 60 * 1000, // 1 hour
});

export const axiosClient = axios.create();
