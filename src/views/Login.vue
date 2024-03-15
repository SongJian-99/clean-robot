<template>
  <a-layout>
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      :style="siderStyle"
    >
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
      <a-layout-header :style="mainStyle">
        
      </a-layout-header>

      <a-layout-content ref="mainRef" :style="mainStyle">
        <a-list :style="listStyle" item-layout="horizontal" size="small" :data-source="historyChatList" :locale="locale">
          <template #renderItem="{item}">
            <a-list-item>
              <a-list-item-meta>
                <template #description>
                  {{ item.message }}
                </template>
                <template #title>
                  <span>{{ item.author}}</span>
                </template>
                <template #avatar>
                  <a-avatar v-if="item.author === 'You'">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <a-avatar v-if="item.author === 'Friday'">
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
            :auto-size="{minRows: 2, maxRows:5}"
            allowClear
            size='large'
            style="width: 50%"
            @pressEnter="sendMessage"
          />
          <div style="padding-top: 5px">
            <a-button type="link" @click="handleLinkClick">@Cleaner 知识库</a-button>
          </div>
        </div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { ref } from 'vue'
import CryptoJS from 'crypto-js';
import { UserOutlined, RobotOutlined } from '@ant-design/icons-vue';

/* 侧边栏样式 */
const siderStyle = ref<object>({
  'background': '#d5d2bc',
});

/* 主体区域样式 */
const mainStyle = ref<object>({
  'background': '#f0efe2',
  'overflow': 'auto'
});

/* 底部区域样式 */
const footerStyle = ref<object>({
  'background': '#f0efe2',
  'text-align': 'center',
  'padding': '0 50px'
})

/* 列表样式 */
const listStyle = ref<object>({
  'width': '50%',
  'margin': '0 auto'
})

let mainRef = ref()


let userMessage = ref<string>('')

interface chatObject {
  author: string,
  currentTime: object,
  message: string
}
let historyChatList = ref<Array<chatObject>>([])
let locale = ref<object>({
  emptyText: "Friday is a Chat Bot",
})

const appId = '9aa04cee'
const apiKey = '9f945c5b620481993001e8ffdc48f76d'
const apiSecret = 'MGQ3ZDYzYmU2ZDA1ZGQ5NDdlM2IwYjVh'





/* @Cleaner 外链 */
function handleLinkClick() {
  window.open("https://cleaner.love/")
}

/* 发送消息 */
function sendMessage(event: any) {
  // 阻止回车换行
  if (event.keyCode === 13) {
    event.preventDefault()
  }
  // 参数校验
  if (userMessage.value === '') {
    message.warn('用户指令不能为空');
    return;
  }
  getRealUrl().then((url) => {
    let websocket = new WebSocket(url)
    console.log('连接成功')
    websocket.onopen = () => {
      var params = {
        "header": {
          "app_id": appId,
          "uid": "fd3f47e4-d"
        },
        "parameter": {
          "chat": {
            "domain": 'generalv3.5',
            "temperature": 0.5,
            "max_tokens": 1024
          }
        },
        "payload": {
          "message": {
            "text": [{
              "role": "user",
              "content": userMessage.value
            }]
          }
        }
      }
      websocket.send(JSON.stringify(params))
      console.log(JSON.stringify(params))
      let userChat = {
        author: 'You',
        currentTime: new Date(),
        message: userMessage.value
      }
      historyChatList.value?.push(userChat)
      userMessage.value = ''
  
      let aiChat = {
        author: 'Friday',
        currentTime: new Date(),
        message: ''
      }
      historyChatList.value?.push(aiChat)
    }
    websocket.onmessage = (event: MessageEvent) => {
      let data = JSON.parse(event.data)
      scrollToBottom()
      historyChatList.value[historyChatList.value.length - 1].message += data.payload.choices.text[0].content
    }
    websocket.onclose = () => {
      console.log('WebSocket 关闭')
      console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
    }
  })
}

function getRealUrl() {
  return new Promise<string>((resolve) => {
    let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
    var url = 'wss://' + httpUrl.host + httpUrl.pathname

    var algorithm = 'hmac-sha256'
    var headers = 'host date request-line'
    let date = new Date().toUTCString()
    const host = location.host
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    var signature = CryptoJS.enc.Base64.stringify(signatureSha)
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    var authorization = btoa(authorizationOrigin)
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
    console.log(url)
    resolve(url)
  }) 
}

function scrollToBottom() {
  let container = mainRef.value
  container.$el.scrollTop = container.$el.scrollHeight + 10
  console.log(container.$el.scrollTop)
  console.log(container.$el.scrollHeight)
}


</script>
<style scoped>

.ant-layout-content::-webkit-scrollbar{
  width : 8px !important;
  height: 1px !important;
}

.ant-layout-content::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px !important;
  box-shadow : inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
  background : #d5d2bc !important;
}

.ant-layout-content::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow : inset 0 0 5px rgba(0, 0, 0, 0.2) !important;
  border-radius: 5px !important;
  background : #f1efe2 !important;
}
</style>
