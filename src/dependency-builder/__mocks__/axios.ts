import axios from 'axios';

const mockAxios = jest.genMockFromModule('axios');

// this is the key to fix the axios.create() undefined error!
(<any>mockAxios).create = jest.fn(() => mockAxios);

export default mockAxios as jest.Mocked<typeof axios>;
