import api from '../../app/services/axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const getResponseInterceptor = () => {
  const handlers = api.interceptors.response.handlers;
  const interceptor = handlers?.[0];

  if (!interceptor) {
    throw new Error('Response interceptor is not registered');
  }

  return interceptor;
};

describe('Axios Instance Configuration', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should have the correct custom defaults', () => {
    expect(api.defaults.baseURL).toBe('https://picsum.photos');
    expect(api.defaults.timeout).toBe(5000);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Response Interceptors', () => {
    it('should return the response directly if successful', () => {
      const responseInterceptor = getResponseInterceptor().fulfilled;
      
      const mockResponse = { 
        data: 'Success', 
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      } as AxiosResponse;
      
      const result = responseInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    });

    it('should log an error properly if it is a native Error', async () => {
        const errorInterceptor = getResponseInterceptor().rejected;
        const mockError = new Error('Network Error');
        
        if(errorInterceptor) {
           await expect(errorInterceptor(mockError)).rejects.toThrow('Network Error');
           expect(console.error).toHaveBeenCalledWith('[Native Error]: Network Error');
        }
      });
  });
});
