import Vue from "vue";
import axios from "axios";
import { MessageBox } from "element-ui";

const service = axios.create({
  timeout: 5000,
  baseURL: "api"
});

export default ({ store, redirect }) => {
  // 请求拦截, 主要做 token 的管理
  service.interceptors.request.use(async config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.common["Authorization"] = "Bearer " + token;
    }
    return config;
  });

  // 响应拦截
  service.interceptors.response.use(async response => {
    let { data } = response;

    // 如果 code 是-666，则说明是没有登录的状态
    if (data.code === -666) {
      MessageBox.confirm("登录已过期", "过期", {
        confirmButtonText: "登录",
        showCancelButton: false
      }).then(() => {
        // 移除过期的token
        localStorage.removeItem("token");
        // 跳转到登录页面
        redirect({ path: "login" });
      });
    }

    return data;
  });
};

Vue.prototype.$http = service;
export const http = service;
