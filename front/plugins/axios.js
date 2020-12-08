import Vue from "vue";
import axios from "axios";

const server = axios.create({
  timeout: 5000,
  baseURL: "api"
});

// 请求拦截, 主要做 token 的管理

// 响应拦截
server.interceptors.response.use(async response => {
  let { data } = response;
  console.log(data);
  return data;
});

Vue.prototype.$http = server;
export const http = server;
