<template>
  <a-layout>
    <a-layout-sider breakpoint="lg" collapsed-width="0" :style="siderStyle">
      <a-menu theme="light" mode="inline">
        <a-menu-item key="1">
          <user-outlined />
          <span class="nav-text">nav 1aaaaaaaaaaaaaaaaaaaa</span>
        </a-menu-item>
        <a-menu-item key="2">
          <video-camera-outlined />
          <span class="nav-text">nav 2</span>
        </a-menu-item>
        <a-menu-item key="3">
          <upload-outlined />
          <span class="nav-text">nav 3</span>
        </a-menu-item>
        <a-menu-item key="4">
          <user-outlined />
          <span class="nav-text">nav 4</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header :style="mainStyle"> </a-layout-header>

      <a-layout-content ref="mainRef" :style="mainStyle">
        <a-list
          :style="listStyle"
          item-layout="horizontal"
          size="small"
          :data-source="historyChatList"
          :locale="locale"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #description>
                  <span
                    style="white-space: pre-wrap"
                    v-html="item.content"
                  ></span>
                </template>
                <template #title>
                  <span>{{ item.role }}</span>
                </template>
                <template #avatar>
                  <a-avatar v-if="item.role === 'user'">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <a-avatar v-if="item.role === 'assistant'">
                    <template #icon><RobotOutlined /></template>
                  </a-avatar>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-layout-content>
      <a-layout-footer :style="footerStyle">
        <div style="margin-top: 20px">
          <a-textarea
            v-model:value="userMessage"
            placeholder="回车发送信息"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            allowClear
            size="large"
            style="width: 50%"
            @pressEnter="sendMessage"
          />
          <div>
            <a-button type="primary" @click="sendMessage">语音</a-button>
          </div>
          <div style="padding-top: 5px">
            <a-button type="link" @click="handleLinkClick"
              >@Cleaner 知识库</a-button
            >
          </div>
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import CryptoJS from "crypto-js";
import { UserOutlined, RobotOutlined } from "@ant-design/icons-vue";

/* 侧边栏样式 */
const siderStyle = ref<object>({
  background: "#d5d2bc",
});

/* 主体区域样式 */
const mainStyle = ref<object>({
  background: "#f0efe2",
});

/* 底部区域样式 */
const footerStyle = ref<object>({
  background: "#f0efe2",
  "text-align": "center",
  padding: "0 50px",
});

/* 列表样式 */
const listStyle = ref<object>({
  width: "50%",
  margin: "0 auto",
  overflow: "auto",
});

//

let mainRef = ref();

let userMessage = ref<string>("");

interface chatObject {
  role: string;
  content: string;
}
let historyChatList = ref<Array<chatObject>>([]);
let locale = ref<object>({
  emptyText: "Friday is a Chat Bot",
});

const appId = "9aa04cee";
const apiKey = "9f945c5b620481993001e8ffdc48f76d";
const apiSecret = "MGQ3ZDYzYmU2ZDA1ZGQ5NDdlM2IwYjVh";

let resultText = "";
let resultTextTemp = "";

/* @Cleaner 外链 */
function handleLinkClick() {
  window.open("https://cleaner.love/");
}

/* 发送消息 */
function sendMessage(event: any) {
  // // 阻止回车换行
  // if (event.keyCode === 13) {
  //   event.preventDefault()
  // }
  // // 参数校验
  // if (userMessage.value === '') {
  //   message.warn('用户指令不能为空');
  //   return;
  // }
  getWebSocketUrl().then((url) => {
    let websocket = new WebSocket(url);
    websocket.onopen = () => {
      recorder.start({
        sampleRate: 16000,
        frameSize: 1280,
      });
      var params = {
        common: {
          app_id: appId,
        },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          vad_eos: 5000,
          dwa: "wpgs",
        },
        data: {
          status: 0,
          format: "audio/L16;rate=16000",
          encoding: "raw",
        },
      };
      websocket.send(JSON.stringify(params));

      websocket.onmessage = (event: MessageEvent) => {
        let jsonData = JSON.parse(event.data);
        if (jsonData.data && jsonData.data.result) {
          let data = jsonData.data.result;
          let str = "";
          let ws = data.ws;
          for (let i = 0; i < ws.length; i++) {
            str = str + ws[i].cw[0].w;
          }
          // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
          // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
          if (data.pgs) {
            if (data.pgs === "apd") {
              // 将resultTextTemp同步给resultText
              resultText = resultTextTemp;
            }
            // 将结果存储在resultTextTemp中
            resultTextTemp = resultText + str;
          } else {
            resultText = resultText + str;
          }
          let message = resultTextTemp || resultText || "";
          console.log(message);
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
          websocket.close();
        }
        if (jsonData.code !== 0) {
          websocket.close();
          console.error(jsonData);
        }
      };
    };
    websocket.onerror = (event: Event) => {
      console.error(event);
      recorder.stop();
    };
    websocket.onclose = () => {
      recorder.stop();
    };
  });
  return;
  getRealUrl().then((url) => {
    let websocket = new WebSocket(url);
    console.log("连接成功");
    websocket.onopen = () => {
      let userChat = {
        role: "user",
        content: userMessage.value,
      };
      historyChatList.value?.push(userChat);
      var params = {
        header: {
          app_id: appId,
          uid: "fd3f47e4-d",
        },
        parameter: {
          chat: {
            domain: "generalv3.5",
            temperature: 0.5,
            max_tokens: 1024,
          },
        },
        payload: {
          message: {
            text: historyChatList.value,
          },
        },
      };
      websocket.send(JSON.stringify(params));
      console.log(JSON.stringify(params));

      userMessage.value = "";

      let aiChat = {
        role: "assistant",
        content: "",
      };
      historyChatList.value?.push(aiChat);
    };
    websocket.onmessage = (event: MessageEvent) => {
      let data = JSON.parse(event.data);
      scrollToBottom();
      historyChatList.value[historyChatList.value.length - 1].content +=
        data.payload.choices.text[0].content;
      scrollToBottom();
    };
    websocket.onclose = () => {
      console.log("WebSocket 关闭");
      console.error(`详情查看：${encodeURI(url.replace("wss:", "https:"))}`);
    };
  });
}

function getRealUrl() {
  return new Promise<string>((resolve) => {
    let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
    var url = "wss://" + httpUrl.host + httpUrl.pathname;

    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    let date = new Date().toUTCString();
    const host = location.host;
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    console.log(url);
    resolve(url);
  });
}

function getWebSocketUrl() {
  return new Promise<string>((resolve) => {
    // 请求地址根据语种不同变化
    var url = "wss://iat-api.xfyun.cn/v2/iat";
    var host = "iat-api.xfyun.cn";
    var date = new Date().toUTCString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    resolve(url);
  });
}
function scrollToBottom() {
  let container = mainRef.value;
  container.$el.scrollTop = container.$el.scrollHeight;
  console.log(container.$el.scrollTop);
  console.log(container.$el.scrollHeight);
}
</script>
<style scoped>
.ant-layout-content::-webkit-scrollbar {
  width: 8px !important;
  height: 1px !important;
}

.ant-layout-content::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px !important;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
  background: #d5d2bc !important;
}

.ant-layout-content::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
  border-radius: 5px !important;
  background: #f1efe2 !important;
}
</style>
@/assets/ts/index@/assets/ts
