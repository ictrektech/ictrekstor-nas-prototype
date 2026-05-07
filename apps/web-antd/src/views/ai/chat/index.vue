<script lang="ts" setup>
import { ref } from 'vue';
import {
  Card,
  Input,
  Button,
  Avatar,
  Tag,
  Select,
  Modal,
  Form,
  Tooltip,
} from 'ant-design-vue';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const inputText = ref('');
const currentModel = ref('gpt-4o');
const modelOptions = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
  { label: 'DeepSeek V3', value: 'deepseek-v3' },
  { label: 'DeepSeek R1', value: 'deepseek-r1' },
  { label: '通义千问', value: 'qwen-max' },
];

const configModalVisible = ref(false);
const configForm = ref({
  model: 'gpt-4o',
  temperature: '0.7',
  maxTokens: '4096',
  systemPrompt: '你是 NAS 系统的智能助手，可以帮助用户管理文件、分析存储空间、解答系统问题。',
});

const messages = ref<ChatMessage[]>([
  {
    id: '1',
    role: 'assistant',
    content: '👋 你好！我是你的 NAS 智能助手。\n\n我可以帮你：\n• 📂 查找文件和管理存储空间\n• 📊 分析容量使用情况和性能数据\n• ⚙️ 解答系统配置和使用问题\n• 🔍 智能搜索文件内容\n\n请告诉我你需要什么帮助？',
    time: '10:00',
  },
]);
const loading = ref(false);

function sendMessage() {
  if (!inputText.value.trim()) return;

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText.value,
  time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
  messages.value.push(userMsg);
  inputText.value = '';
  loading.value = true;

  // 模拟AI回复
  setTimeout(() => {
    const replies = [
      '我帮你分析了一下，当前存储空间使用了 50%（2.5TB / 5TB），建议关注存储空间1的使用情况。',
      '根据系统状态，所有存储池运行正常，硬盘健康状态良好。近期没有异常告警。',
      '我找到了你提到的文件：项目计划书.pdf 位于「共享文件/共享文档」目录下。',
      '建议你可以定期清理回收站，目前回收站占用了约 500MB 的空间。',
    ];
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: replies[Math.floor(Math.random() * replies.length)],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    messages.value.push(assistantMsg);
    loading.value = false;
  }, 1500);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

const quickQuestions = [
  '存储空间使用情况如何？',
  '帮我找一下项目计划书',
  '系统运行状态怎么样？',
  '如何设置共享文件夹？',
];

function sendQuickQuestion(q: string) {
  inputText.value = q;
  sendMessage();
}

function openConfigModal() {
  configForm.value = {
    model: currentModel.value,
    temperature: '0.7',
    maxTokens: '4096',
    systemPrompt: '你是 NAS 系统的智能助手，可以帮助用户管理文件、分析存储空间、解答系统问题。',
  };
  configModalVisible.value = true;
}

function handleSaveConfig() {
  currentModel.value = configForm.value.model;
  configModalVisible.value = false;
}
</script>

<template>
  <div class="ai-chat-page">
    <div class="chat-container">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="header-title">
            <span class="header-icon">🤖</span>
            <span>AI 智能助手</span>
            <Tag color="blue" size="small">NAS 管家</Tag>
          </div>
          <div class="header-desc">基于大语言模型的智能文件管理和系统助手</div>
        </div>
        <div class="header-right">
          <Tooltip title="当前模型">
            <Tag color="purple" size="small">{{ (modelOptions.find(m => m.value === currentModel)?.label) || currentModel }}</Tag>
          </Tooltip>
          <Button size="small" @click="openConfigModal">⚙️ 配置</Button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
        >
          <Avatar
            :size="36"
            :style="{
              background: msg.role === 'assistant' ? '#1890ff' : '#52c41a',
              flexShrink: 0,
            }"
          >
            {{ msg.role === 'assistant' ? '🤖' : '👤' }}
          </Avatar>
          <div class="message-body">
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>

        <!-- 快捷问题 -->
        <div v-if="messages.length === 1" class="quick-questions">
          <div class="quick-title">💡 你可以问我：</div>
          <div class="quick-list">
            <Button
              v-for="q in quickQuestions"
              :key="q"
              size="small"
              @click="sendQuickQuestion(q)"
            >
              {{ q }}
            </Button>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="message-item assistant">
          <Avatar :size="36" :style="{ background: '#1890ff', flexShrink: 0 }">🤖</Avatar>
          <div class="message-body">
            <div class="typing">思考中<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="chat-input-area">
        <Input.TextArea
          v-model:value="inputText"
          :rows="2"
          placeholder="输入你的问题，按 Enter 发送..."
          @keydown="handleKeydown"
        />
        <Button type="primary" :disabled="!inputText.trim() || loading" @click="sendMessage">
          发送
        </Button>
      </div>
    </div>

    <!-- 模型配置弹窗 -->
    <Modal
      v-model:open="configModalVisible"
      title="AI 模型配置"
      width="520px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveConfig"
    >
      <Form layout="vertical">
        <Form.Item label="AI 模型">
          <Select v-model:value="configForm.model" :options="modelOptions" />
        </Form.Item>
        <Form.Item label="Temperature">
          <Select v-model:value="configForm.temperature">
            <Select.Option value="0">0 - 最确定</Select.Option>
            <Select.Option value="0.3">0.3 - 较确定</Select.Option>
            <Select.Option value="0.7">0.7 - 平衡</Select.Option>
            <Select.Option value="1">1 - 最创意</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="最大 Token 数">
          <Select v-model:value="configForm.maxTokens">
            <Select.Option value="2048">2048</Select.Option>
            <Select.Option value="4096">4096</Select.Option>
            <Select.Option value="8192">8192</Select.Option>
            <Select.Option value="16384">16384</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="系统提示词">
          <Input.TextArea
            v-model:value="configForm.systemPrompt"
            :rows="3"
            placeholder="设置 AI 的角色和行为..."
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.ai-chat-page {
  padding: 24px;
  height: calc(100vh - 80px);
}

.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.header-icon {
  font-size: 22px;
}

.header-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-body {
  align-items: flex-end;
}

.message-item.user .message-content {
  background: #52c41a;
  color: #fff;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.message-content {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  color: #bfbfbf;
}

.quick-questions {
  margin-top: 8px;
}

.quick-title {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.typing {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #8c8c8c;
}

.dot {
  animation: blink 1.4s infinite both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.chat-input-area :deep(.ant-input) {
  flex: 1;
  resize: none;
}
</style>
