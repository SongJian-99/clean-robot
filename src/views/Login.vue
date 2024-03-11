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

      <a-layout-content :style="mainStyle">
        <a-list ref="chatList" item-layout="horizontal" size="small" :data-source="historyChatList" :locale="locale">
          <template #renderItem="{item}">
            <a-list-item>
              <a-comment v-if="item.author === 'user'" :author="item.author">
                <a-avatar slot='avatar' style="background:#87d068" icon="user"></a-avatar>
                <h3 style="white-space:pre-wrap;margin: -20px 44px 0 0" v-html="item.message"></h3>
                <span slot="datetime">{{ item.currentTime }}</span>
              </a-comment>
              <a-comment v-if="item.author === 'AI'" :author="item.author">
                <a-avatar slot='avatar' style="background: blue" icon="robot"></a-avatar>
                <h3 style="white-space:pre-wrap;margin: -50px 44px 0 0" v-html="item.message"></h3>
                <span slot="datetime">{{ item.currentTime }}</span>
              </a-comment>
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

/* 侧边栏样式 */
const siderStyle = ref({
  'background': '#d5d2bc',
});

/* 主体区域样式 */
const mainStyle = ref({
  'background': '#f0efe2',
});

/* 底部区域样式 */
const footerStyle = ref({
  'background': '#f0efe2',
  'text-align': 'center',
  'padding': '0 50px'
})

const userMessage = ref<String>('')
const historyChatList = ref<Object>()
const locale = ref<Object>({
  emptyText: "Friday is a Chat Bot",
})


/* @Cleaner 外链 */
function handleLinkClick() {
  window.open("https://cleaner.love/")
}

/* 发送消息 */
async function sendMessage(event: any) {
  // 阻止回车换行
  if (event.keyCode === 13) {
    event.preventDefault()
  }
  // 参数校验
  console.log(userMessage.value)
  if (userMessage.value === '') {
    message.warn('用户指令不能为空');
    return;
  }


}

function getRealUrl() {
  const url = 'spark-api.xf-yun.com'
  // const url = 'wss://spark-api.xf-yun.com/v3.5/chat'
  const date = new Date();
  const method = 'GET'
  let temp = 'host:' + url + '\n' + 'date:' + date + '\n' + method +  '/v3.5/chat'


}

</script>
<style scoped>


</style>
