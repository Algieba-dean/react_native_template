const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      isAxiosError: jest.fn(),
    },
    create: jest.fn(() => instance),
    isAxiosError: jest.fn(),
  };
});

import axios from 'axios';
import { ApiClient } from '../shared/services/api/apiClient';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    client = new ApiClient('https://api.test.com', 5000);
  });

  it('should instantiate with default baseURL and interceptors', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.test.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('should handle get requests successfully', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { success: true, message: 'OK' },
      status: 200,
    });

    const result = await client.get<{ success: boolean; message: string }>('/health');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health', undefined);
    expect(result).toEqual({
      data: { success: true, message: 'OK' },
      status: 200,
    });
  });

  it('should handle post requests successfully', async () => {
    const payload = { username: 'testuser' };
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { id: 1, ...payload },
      status: 201,
    });

    const result = await client.post('/users', payload);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', payload, undefined);
    expect(result).toEqual({
      data: { id: 1, username: 'testuser' },
      status: 201,
    });
  });

  it('should handle put requests successfully', async () => {
    const payload = { username: 'updated' };
    mockAxiosInstance.put.mockResolvedValueOnce({
      data: { id: 1, ...payload },
      status: 200,
    });

    const result = await client.put('/users/1', payload);
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', payload, undefined);
    expect(result.data).toEqual({ id: 1, username: 'updated' });
  });

  it('should handle delete requests successfully', async () => {
    mockAxiosInstance.delete.mockResolvedValueOnce({
      data: null,
      status: 204,
    });

    const result = await client.delete('/users/1');
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', undefined);
    expect(result.status).toBe(204);
  });
});
