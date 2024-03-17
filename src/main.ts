import { createApp } from "vue";
/* 引入 Antd 和 样式 */
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

import router from "@/router";

import "./style.css";
import App from "./App.vue";

const app = createApp(App);
app.use(Antd);
app.use(router);
app.mount("#app");
