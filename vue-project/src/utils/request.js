import axios from 'axios'

const instance = axios.create({
    baseURL: '/api/'
    /*  baseURL: 'http://geor.proj.kth.se:3000/api/' */
    /* baseURL: 'http://localhost:3000/api/' */
});

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    const userId = localStorage.getItem('userId');  // 读取 userId
    if (userId) {
        config.headers['Authorization'] = `Bearer ${userId}`;  // 添加到请求头
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default instance;