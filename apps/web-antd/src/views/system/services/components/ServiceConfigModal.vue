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
  Tabs,
} from 'ant-design-vue';
import type { ServiceData } from '../types';

const props = defineProps<{
  visible: boolean;
  service: ServiceData | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'save', data: { id: string; config: Record<string, any> }): void;
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);
const form = ref<Record<string, any>>({});
const activeTab = ref('basic');

watch(
  () => props.visible,
  (vis) => {
    if (vis && props.service) {
      form.value = { ...getDefaultForm(props.service.id), ...props.service.config };
      activeTab.value = 'basic';
    }
  },
);

function getDefaultForm(id: string) {
  const defaults: Record<string, any> = {
    smb: {
      workgroup: 'WORKGROUP',
      serverName: 'NAS-SERVER',
      bindInterface: '全部接口',
      enableSmb1: false,
      enableSmb2: true,
      enableSmb3: true,
      guestAccess: false,
      announceService: true,
    },
    afp: {
      serverName: 'AFP-SERVER',
      bindInterface: '全部接口',
      enableAfp3: true,
      enableBonjour: true,
      enableTimeMachine: true,
    },
    ftp: {
      ftpMode: '被动模式',
      bindInterface: '全部接口',
      port: 21,
      maxConnections: 50,
      passivePortRange: '50000-51000',
      enableAnonymous: false,
      enableFtps: false,
    },
    webdav: {
      port: 5005,
      bindInterface: '全部接口',
      enableHttps: false,
      enableDav: true,
      enableCaldav: false,
      enableCarddav: false,
    },
    nfs: {
      bindInterface: '全部接口',
      enableNfsv3: true,
      enableNfsv4: true,
      rootSquash: true,
      allSquash: false,
    },
    'http-mgmt': {
      port: 5000,
      bindInterface: '全部接口',
      enableHttps: false,
      enableHsts: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      allowedIps: '0.0.0.0/0',
      enableCsp: true,
    },
  };
  return defaults[id] || {};
}

function onOk() {
  formRef.value
    ?.validate()
    .then(() => {
      emit('save', { id: props.service!.id, config: form.value });
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
    :title="`${service?.name || ''} 配置`"
    width="640px"
    @ok="onOk"
    @cancel="onCancel"
  >
    <Form
      v-if="service"
      ref="formRef"
      :model="form"
      layout="vertical"
      class="config-form"
    >
      <!-- ===== SMB ===== -->
      <template v-if="service.id === 'smb'">
        <Tabs v-model:activeKey="activeTab">
          <Tabs.TabPane key="basic" tab="基本设置">
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
          </Tabs.TabPane>
          <Tabs.TabPane key="advanced" tab="高级选项">
            <div class="switch-group">
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableSmb2" />
                <span class="switch-label">启用 SMB 2.0</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableSmb3" />
                <span class="switch-label">启用 SMB 3.0</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableSmb1" />
                <span class="switch-label">启用 SMB 1.0（不推荐）</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.guestAccess" />
                <span class="switch-label">允许访客访问</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.announceService" />
                <span class="switch-label">广播服务发现</span>
              </Form.Item>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </template>

      <!-- ===== HTTP 管理 ===== -->
      <template v-if="service.id === 'http-mgmt'">
        <Tabs v-model:activeKey="activeTab">
          <Tabs.TabPane key="basic" tab="基本设置">
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
            <Form.Item label="允许访问 IP" name="allowedIps">
              <Input v-model:value="form.allowedIps" placeholder="例如: 0.0.0.0/0 或 192.168.1.0/24" />
            </Form.Item>
          </Tabs.TabPane>
          <Tabs.TabPane key="security" tab="安全设置">
            <Form.Item label="会话超时（分钟）" name="sessionTimeout">
              <InputNumber v-model:value="form.sessionTimeout" :min="1" :max="1440" style="width: 100%;" />
            </Form.Item>
            <Form.Item label="最大登录尝试次数" name="maxLoginAttempts">
              <InputNumber v-model:value="form.maxLoginAttempts" :min="1" :max="20" style="width: 100%;" />
            </Form.Item>
            <div class="switch-group">
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableHttps" />
                <span class="switch-label">启用 HTTPS</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableHsts" />
                <span class="switch-label">启用 HSTS</span>
              </Form.Item>
              <Form.Item class="switch-row" label="">
                <Switch v-model:checked="form.enableCsp" />
                <span class="switch-label">启用内容安全策略 (CSP)</span>
              </Form.Item>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </template>

      <!-- ===== AFP ===== -->
      <template v-if="service.id === 'afp'">
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
        <div class="switch-group">
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableAfp3" />
            <span class="switch-label">启用 AFP3 协议</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableBonjour" />
            <span class="switch-label">启用 Bonjour 广播</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableTimeMachine" />
            <span class="switch-label">启用 Time Machine 支持</span>
          </Form.Item>
        </div>
      </template>

      <!-- ===== FTP ===== -->
      <template v-if="service.id === 'ftp'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="FTP 模式" name="ftpMode">
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
        <div class="switch-group">
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableAnonymous" />
            <span class="switch-label">允许匿名访问</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableFtps" />
            <span class="switch-label">启用 FTPS (SSL/TLS)</span>
          </Form.Item>
        </div>
      </template>

      <!-- ===== WebDAV ===== -->
      <template v-if="service.id === 'webdav'">
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
        <div class="switch-group">
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableHttps" />
            <span class="switch-label">启用 HTTPS</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableDav" />
            <span class="switch-label">启用 WebDAV</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableCaldav" />
            <span class="switch-label">启用 CalDAV</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableCarddav" />
            <span class="switch-label">启用 CardDAV</span>
          </Form.Item>
        </div>
      </template>

      <!-- ===== NFS ===== -->
      <template v-if="service.id === 'nfs'">
        <h3 class="form-section-title">基本设置</h3>
        <Form.Item label="绑定接口" name="bindInterface">
          <Select v-model:value="form.bindInterface">
            <Select.Option value="全部接口">全部接口</Select.Option>
            <Select.Option value="LAN1">LAN1 (192.168.1.0/24)</Select.Option>
            <Select.Option value="LAN2">LAN2 (10.0.0.0/24)</Select.Option>
          </Select>
        </Form.Item>
        <h3 class="form-section-title">高级选项</h3>
        <div class="switch-group">
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableNfsv3" />
            <span class="switch-label">启用 NFSv3</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.enableNfsv4" />
            <span class="switch-label">启用 NFSv4</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.rootSquash" />
            <span class="switch-label">启用 Root Squash</span>
          </Form.Item>
          <Form.Item class="switch-row" label="">
            <Switch v-model:checked="form.allSquash" />
            <span class="switch-label">启用 All Squash</span>
          </Form.Item>
        </div>
      </template>
    </Form>
  </Modal>
</template>

<style scoped>
.config-form {
  padding-top: 4px;
}

.form-section-title {
  font-size: var(--ict-mark-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 16px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ict-border-light);
}

.form-section-title:first-child {
  margin-top: 0;
}

.switch-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.switch-row {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

.switch-label {
  margin-left: 8px;
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-secondary);
}
</style>
