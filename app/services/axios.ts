import axios from "axios";

const api = axios.create({
    baseURL: 'https://picsum.photos',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.error || error.message;

            console.error(
                `[Axios Error] ${status || 'Network/Timeout'} | ${error.config?.url}\n` +
                `Message: ${message}`
            );
        } else if (error instanceof Error) {
            console.error(`[Native Error]: ${error.message}`);
        } else {
            console.error('[Unknown Error]: Ha ocurrido algo inesperado', error);
        }

        return Promise.reject(error);
    }
);

export default api;