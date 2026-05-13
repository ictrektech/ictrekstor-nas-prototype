<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Divider,
} from 'ant-design-vue';
import type { ProtocolData } from './ProtocolCard.vue';

const props = defineProps<{
  visible: boolean;
  protocol: ProtocolData | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'save', data: {
    id: string;
    workgroup?: string;
    serverName?: string;
    bindInterface?: string;
    port?: number;
    enableAFP?: boolean;
    enableBonjour?: boolean;
    ftpMode?: string;
    maxConnections?: number;
    passivePortRange?: string;
    enableAnonymous?: boolean;
    enableFTPS?: boolean;
    webdavHttps?: boolean;
    enableDav?: boolean;
    enableCaldav?: boolean;
    enableCarddav?: boolean;
  }): void;
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);
const form = ref<Record<string, any>>({});

watch(
  () => props.visible,
  (vis) => {
    if (vis && props.protocol) {
      form.value = getDefaultForm(props.protocol.id);
    }
  },
);

function getDefaultForm(id: string) {
  const defaults: Record<string, any> = {
    smb: { workgroup: 'WORKGROUP', serverName: 'NAS-SERVER', bindInterface: '全部接口' },
    afp: { serverName: 'AFP-SERVER', bindInterface: '全部接口', enableAFP: true, enableBonjour: true },
    ftp: { ftpMode: '主动模式', bindInterface: '全部接口', port: 21, maxConnections: 50, passivePortRange: '50000-51000', enableAnonymous: false, enableFTPS: false },
    webdav: { port: 5005, webdavHttps: false, enableDav: true, enableCaldav: false, enableCarddav: false, bindInterface: '全部接口' },
  };
  return defaults[id] || {};
}

function onOk() {
  formRef.value
    ?.validate()
    .then(() => {
      emit('save', { id: props.protocol!.id, ...form.value });
      emit('update:visible', false);
    })
    .catch(() => {});
}

function onCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="`${protocol?.name || ''} 高级配置`"
    width="560px"
    @ok="onOk"
    @cancel="onCancel"
  >
    <Form
      v-if="protocol"
      ref="formRef"
      :model="form"
      layout="vertical"
      class="config-form"
    >
      <!-- SMB -->
      <template v-if="protocol.id === 'smb'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="工作组" name="workgroup">
          <Input v-model:value="form.workgroup" />
        </Form.Item>
        <Form.Item label="服务器名称" name="serverName">
          <Input v-model:value="form.serverName" />
        </Form.Item>
        <Form.Item label="绑定接口" name="bindInterface">
          <Select v-model:value="form.bindInterface">
            <Select.Option value="全部接口">全部接口</Select.Option>
            <Select.Option value="LAN1">LAN1 (192.168.1.0/24)</Select.Option>
            <Select.Option value="LAN2">LAN2 (10.0.0.0/24)</Select.Option>
          </Select>
        </Form.Item>
      </template>

      <!-- AFP -->
      <template v-if="protocol.id === 'afp'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="服务器名称" name="serverName">
          <Input v-model:value="form.serverName" />
        </Form.Item>
        <Form.Item label="绑定接口" name="bindInterface">
          <Select v-model:value="form.bindInterface">
            <Select.Option value="全部接口">全部接口</Select.Option>
            <Select.Option value="LAN1">LAN1 (192.168.1.0/24)</Select.Option>
            <Select.Option value="LAN2">LAN2 (10.0.0.0/24)</Select.Option>
          </Select>
        </Form.Item>
        <h3 class="form-section-title">高级选项</h3>
        <div class="form-switch-row">
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableAFP" />
            <span class="switch-label">启用AFP3协议</span>
          </Form.Item>
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableBonjour" />
            <span class="switch-label">启用Bonjour广播</span>
          </Form.Item>
        </div>
      </template>

      <!-- FTP -->
      <template v-if="protocol.id === 'ftp'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="FTP模式" name="ftpMode">
          <Select v-model:value="form.ftpMode">
            <Select.Option value="主动模式">主动模式</Select.Option>
            <Select.Option value="被动模式">被动模式</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="绑定接口" name="bindInterface">
          <Select v-model:value="form.bindInterface">
            <Select.Option value="全部接口">全部接口</Select.Option>
            <Select.Option value="LAN1">LAN1 (192.168.1.0/24)</Select.Option>
            <Select.Option value="LAN2">LAN2 (10.0.0.0/24)</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="端口号" name="port">
          <InputNumber v-model:value="form.port" :min="1" :max="65535" style="width: 100%;" />
        </Form.Item>
        <h3 class="form-section-title">高级选项</h3>
        <Form.Item label="最大连接数" name="maxConnections">
          <InputNumber v-model:value="form.maxConnections" :min="1" :max="1000" style="width: 100%;" />
        </Form.Item>
        <Form.Item label="被动端口范围" name="passivePortRange">
          <Input v-model:value="form.passivePortRange" placeholder="例如: 50000-51000" />
        </Form.Item>
        <div class="form-switch-row">
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableAnonymous" />
            <span class="switch-label">允许匿名访问</span>
          </Form.Item>
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableFTPS" />
            <span class="switch-label">启用FTPS (SSL/TLS)</span>
          </Form.Item>
        </div>
      </template>

      <!-- WebDAV -->
      <template v-if="protocol.id === 'webdav'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="端口号" name="port">
          <InputNumber v-model:value="form.port" :min="1" :max="65535" style="width: 100%;" />
        </Form.Item>
        <Form.Item label="绑定接口" name="bindInterface">
          <Select v-model:value="form.bindInterface">
            <Select.Option value="全部接口">全部接口</Select.Option>
            <Select.Option value="LAN1">LAN1 (192.168.1.0/24)</Select.Option>
            <Select.Option value="LAN2">LAN2 (10.0.0.0/24)</Select.Option>
          </Select>
        </Form.Item>
        <h3 class="form-section-title">高级选项</h3>
        <div class="form-switch-row">
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.webdavHttps" />
            <span class="switch-label">启用HTTPS</span>
          </Form.Item>
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableDav" />
            <span class="switch-label">启用WebDAV</span>
          </Form.Item>
        </div>
        <div class="form-switch-row">
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableCaldav" />
            <span class="switch-label">启用CalDAV</span>
          </Form.Item>
          <Form.Item class="form-switch-item" label="">
            <Switch v-model:checked="form.enableCarddav" />
            <span class="switch-label">启用CardDAV</span>
          </Form.Item>
        </div>
      </template>
    </Form>
  </Modal>
</template>

<style scoped>
.config-form {
  padding-top: 8px;
}

.form-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  margin: 16px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section-title:first-child {
  margin-top: 0;
}

.form-switch-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.form-switch-item {
  margin-bottom: 0;
}

.switch-label {
  margin-left: 8px;
  font-size: 13px;
  color: #595959;
}
</style>