<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  Button,
  Input,
  Switch,
  Tag,
  Modal,
  Form,
  Tabs,
  message,
  Card,
  Tooltip,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

const TabPane = Tabs.TabPane;

// ==================== 类型定义 ====================
interface NetworkProtocol {
  id: string;
  name: string;
  protocol: string;
  status: 'active' | 'disabled';
  path: string;
  port: number;
  autoMount: boolean;
  requireAuth: boolean;
  description: string;
  // 协议特有配置
  config: ProtocolConfig;
}

interface ProtocolConfig {
  // SMB
  workgroup?: string;
  enableV1?: boolean;
  // NFS
  squash?: string;
  // WebDAV
  https?: boolean;
  // FTP
  passiveMode?: boolean;
  // AFP
  timeMachine?: boolean;
}

// ==================== 协议数据 ====================
const nasHost = ref('192.168.1.100');

const protocols = ref<NetworkProtocol[]>([
  {
    id: 'smb',
    name: 'SMB 共享',
    protocol: 'SMB',
    status: 'active',
    path: '/share/smb',
    port: 445,
    autoMount: true,
    requireAuth: true,
    description: 'Windows 系统原生支持的文件共享协议，局域网内传输速度快',
    config: { workgroup: 'WORKGROUP', enableV1: false },
  },
  {
    id: 'nfs',
    name: 'NFS 共享',
    protocol: 'NFS',
    status: 'active',
    path: '/share/nfs',
    port: 2049,
    autoMount: false,
    requireAuth: false,
    description: 'Linux / Unix 系统原生支持的文件共享协议，性能优异',
    config: { squash: 'no_root_squash' },
  },
  {
    id: 'webdav',
    name: 'WebDAV',
    protocol: 'WebDAV',
    status: 'active',
    path: '/share/webdav',
    port: 5005,
    autoMount: false,
    requireAuth: true,
    description: '基于 HTTP 的文件共享协议，支持跨平台远程访问',
    config: { https: false },
  },
  {
    id: 'ftp',
    name: 'FTP 共享',
    protocol: 'FTP',
    status: 'disabled',
    path: '/share/ftp',
    port: 21,
    autoMount: false,
    requireAuth: true,
    description: '传统文件传输协议，兼容性好，适合大文件批量传输',
    config: { passiveMode: true },
  },
  {
    id: 'afp',
    name: 'AFP 共享',
    protocol: 'AFP',
    status: 'disabled',
    path: '/share/afp',
    port: 548,
    autoMount: false,
    requireAuth: true,
    description: 'macOS 原生支持的文件共享协议，Apple 设备首选',
    config: { timeMachine: false },
  },
]);

const searchText = ref('');

// ==================== 计算属性 ====================
const filteredProtocols = computed(() => {
  let result = protocols.value;
  if (searchText.value) {
    const kw = searchText.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.protocol.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw),
    );
  }
  return result;
});

const activeCount = computed(
  () => protocols.value.filter((p) => p.status === 'active').length,
);

// ==================== 图标与颜色 ====================
function getProtocolIcon(protocol: string): string {
  const icons: Record<string, string> = {
    SMB: 'lucide:monitor',
    NFS: 'lucide:terminal',
    WebDAV: 'lucide:globe',
    FTP: 'lucide:folder-sync',
    AFP: 'lucide:apple',
  };
  return icons[protocol] || 'lucide:network';
}

function getProtocolColor(protocol: string): string {
  const colors: Record<string, string> = {
    SMB: '#1677ff',
    NFS: '#52c41a',
    WebDAV: '#722ed1',
    FTP: '#fa8c16',
    AFP: '#eb2f96',
  };
  return colors[protocol] || '#8c8c8c';
}

function getProtocolBg(protocol: string): string {
  const bgs: Record<string, string> = {
    SMB: '#e6f4ff',
    NFS: '#f6ffed',
    WebDAV: '#f9f0ff',
    FTP: '#fff7e6',
    AFP: '#fff0f6',
  };
  return bgs[protocol] || '#f5f5f5';
}

function getProtocolGradient(protocol: string): string {
  const gradients: Record<string, string> = {
    SMB: 'linear-gradient(135deg, #1677ff 0%, #36cfc9 100%)',
    NFS: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
    WebDAV: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
    FTP: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)',
    AFP: 'linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%)',
  };
  return gradients[protocol] || 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)';
}

// ==================== 操作 ====================
function toggleStatus(protocol: NetworkProtocol) {
  protocol.status = protocol.status === 'active' ? 'disabled' : 'active';
  message.success(
    `${protocol.name} 已${protocol.status === 'active' ? '启用' : '禁用'}`,
  );
}

// ==================== 配置弹窗 ====================
const configModalVisible = ref(false);
const configFormRef = ref();
const editingProtocol = ref<NetworkProtocol | null>(null);
const configForm = ref({
  path: '',
  port: 0,
  requireAuth: true,
  autoMount: false,
  // 特有配置
  workgroup: '',
  enableV1: false,
  squash: '',
  https: false,
  passiveMode: true,
  timeMachine: false,
});

function openConfigModal(protocol: NetworkProtocol) {
  editingProtocol.value = protocol;
  configForm.value = {
    path: protocol.path,
    port: protocol.port,
    requireAuth: protocol.requireAuth,
    autoMount: protocol.autoMount,
    workgroup: protocol.config.workgroup || '',
    enableV1: protocol.config.enableV1 || false,
    squash: protocol.config.squash || '',
    https: protocol.config.https || false,
    passiveMode: protocol.config.passiveMode !== false,
    timeMachine: protocol.config.timeMachine || false,
  };
  configModalVisible.value = true;
}

function handleSaveConfig() {
  configFormRef.value
    .validate()
    .then(() => {
      if (editingProtocol.value) {
        editingProtocol.value.path = configForm.value.path;
        editingProtocol.value.port = configForm.value.port;
        editingProtocol.value.requireAuth = configForm.value.requireAuth;
        editingProtocol.value.autoMount = configForm.value.autoMount;
        // 保存特有配置
        if (editingProtocol.value.protocol === 'SMB') {
          editingProtocol.value.config.workgroup = configForm.value.workgroup;
          editingProtocol.value.config.enableV1 = configForm.value.enableV1;
        }
        if (editingProtocol.value.protocol === 'NFS') {
          editingProtocol.value.config.squash = configForm.value.squash;
        }
        if (editingProtocol.value.protocol === 'WebDAV') {
          editingProtocol.value.config.https = configForm.value.https;
        }
        if (editingProtocol.value.protocol === 'FTP') {
          editingProtocol.value.config.passiveMode = configForm.value.passiveMode;
        }
        if (editingProtocol.value.protocol === 'AFP') {
          editingProtocol.value.config.timeMachine = configForm.value.timeMachine;
        }
        message.success('配置已保存');
      }
      configModalVisible.value = false;
    })
    .catch(() => {});
}

// ==================== 使用指南弹窗 ====================
const guideModalVisible = ref(false);
const guideProtocol = ref<NetworkProtocol | null>(null);
const guideOs = ref('windows');

function openGuideModal(protocol: NetworkProtocol) {
  guideProtocol.value = protocol;
  guideOs.value = 'windows';
  guideModalVisible.value = true;
}

function getGuideContent(protocol: string, os: string): string {
  const guides: Record<string, Record<string, string>> = {
    SMB: {
      windows: `在 Windows 资源管理器地址栏输入：
\\\\${nasHost.value}\\share

或者在命令提示符中执行：
net use Z: \\\\${nasHost.value}\\share /persistent:yes`,
      linux: `安装 cifs-utils：
sudo apt-get install cifs-utils

创建挂载点并挂载：
sudo mkdir -p /mnt/nas-share
sudo mount -t cifs //${nasHost.value}/share /mnt/nas-share -o username=your_user

添加到 /etc/fstab 实现开机自动挂载：
//${nasHost.value}/share /mnt/nas-share cifs credentials=/root/.smbcred,iocharset=utf8 0 0`,
      mac: `在 Finder 中按 Cmd+K，输入：
smb://${nasHost.value}/share

或者在终端执行：
mount_smbfs //user@${nasHost.value}/share ~/nas-share`,
    },
    NFS: {
      windows: `Windows 10/11 专业版/企业版支持 NFS：
1. 启用 NFS 客户端功能（控制面板 → 程序和功能 → 启用或关闭 Windows 功能）
2. 在 PowerShell 中执行：
mount -o anon \\${nasHost.value}:\share Z:`,
      linux: `安装 NFS 客户端：
sudo apt-get install nfs-common

创建挂载点并挂载：
sudo mkdir -p /mnt/nas-nfs
sudo mount ${nasHost.value}:/share/nfs /mnt/nas-nfs

添加到 /etc/fstab：
${nasHost.value}:/share/nfs /mnt/nas-nfs nfs defaults 0 0`,
      mac: `macOS 内置支持 NFS：

创建挂载点并挂载：
sudo mkdir -p /Volumes/nas-nfs
sudo mount -t nfs ${nasHost.value}:/share/nfs /Volumes/nas-nfs

或者使用 Finder → 前往 → 连接服务器：
nfs://${nasHost.value}/share/nfs`,
    },
    WebDAV: {
      windows: `在 Windows 资源管理器中：
1. 右键"此电脑" → 映射网络驱动器
2. 输入地址：http://${nasHost.value}:5005
3. 勾选"使用其他凭据连接"

或者在命令提示符中：
net use Z: http://${nasHost.value}:5005`,
      linux: `安装 davfs2：
sudo apt-get install davfs2

创建挂载点并挂载：
sudo mkdir -p /mnt/nas-webdav
sudo mount -t davfs http://${nasHost.value}:5005 /mnt/nas-webdav

添加到 /etc/fstab：
http://${nasHost.value}:5005 /mnt/nas-webdav davfs user,noauto,file_mode=0664,dir_mode=0775 0 1`,
      mac: `在 Finder 中：
1. Cmd+K 打开连接服务器
2. 输入：http://${nasHost.value}:5005
3. 输入用户名密码连接

或者在终端使用 cadaver：
cadaver http://${nasHost.value}:5005`,
    },
    FTP: {
      windows: `使用 Windows 资源管理器：
ftp://${nasHost.value}:21

或者在命令提示符中：
ftp ${nasHost.value}

使用 FileZilla 等客户端连接：
主机：${nasHost.value}，端口：21，协议：FTP`,
      linux: `使用命令行 FTP 客户端：
ftp ${nasHost.value}

或者使用 lftp：
lftp -u username,password ${nasHost.value}

使用 curl 上传/下载：
curl -T localfile.txt ftp://${nasHost.value}/remote/path/
curl -O ftp://${nasHost.value}/remote/file.txt`,
      mac: `使用终端 FTP 命令：
ftp ${nasHost.value}

或者在 Finder 中：
Cmd+K → ftp://${nasHost.value}

使用 Cyberduck 等图形客户端连接`,
    },
    AFP: {
      windows: `Windows 不支持 AFP 协议。
建议使用 SMB 协议替代。`,
      linux: `Linux 可通过 netatalk 连接 AFP：
sudo apt-get install afpfs-ng

挂载：
afp_client mount ${nasHost.value}:/share/afp /mnt/nas-afp -u username

建议使用 SMB 或 NFS 替代。`,
      mac: `在 Finder 中：
1. Cmd+K 打开连接服务器
2. 输入：afp://${nasHost.value}/share/afp
3. 输入用户名密码连接

或者在终端：
mount_afp afp://user:pass@${nasHost.value}/share/afp /Volumes/nas-afp`,
    },
  };
  return guides[protocol]?.[os] || '暂无使用指南';
}

// ==================== 特有配置展示 ====================
function getConfigItems(protocol: NetworkProtocol): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const { config, requireAuth, autoMount } = protocol;

  // 通用配置
  items.push({ label: '共享路径', value: protocol.path });
  items.push({ label: '端口', value: String(protocol.port) });
  items.push({ label: '认证', value: requireAuth ? '需要' : '不需要' });
  items.push({ label: '自动挂载', value: autoMount ? '已启用' : '未启用' });

  // 协议特有
  if (protocol.protocol === 'SMB') {
    items.push({ label: '工作组', value: config.workgroup || 'WORKGROUP' });
    items.push({ label: 'SMBv1', value: config.enableV1 ? '已启用' : '已禁用' });
  }
  if (protocol.protocol === 'NFS') {
    items.push({ label: 'Root Squash', value: config.squash || 'no_root_squash' });
  }
  if (protocol.protocol === 'WebDAV') {
    items.push({ label: 'HTTPS', value: config.https ? '已启用' : '未启用' });
  }
  if (protocol.protocol === 'FTP') {
    items.push({ label: '被动模式', value: config.passiveMode !== false ? '已启用' : '已禁用' });
  }
  if (protocol.protocol === 'AFP') {
    items.push({ label: 'Time Machine', value: config.timeMachine ? '已启用' : '未启用' });
  }

  return items;
}

// ==================== 访问地址 ====================
function getAccessUrl(protocol: NetworkProtocol): string {
  const host = nasHost.value;
  switch (protocol.protocol) {
    case 'SMB':
      return `\\\\${host}\\share`;
    case 'NFS':
      return `${host}:/share/nfs`;
    case 'WebDAV':
      return `${protocol.config.https ? 'https' : 'http'}://${host}:${protocol.port}`;
    case 'FTP':
      return `ftp://${host}:${protocol.port}`;
    case 'AFP':
      return `afp://${host}/share/afp`;
    default:
      return '';
  }
}

function copyAccessUrl(protocol: NetworkProtocol) {
  const url = getAccessUrl(protocol);
  navigator.clipboard.writeText(url);
  message.success('访问地址已复制');
}
</script>

<template>
  <div class="network-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:globe" style="font-size: 22px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">网络访问</h1>
          <p class="page-desc">启用文件共享协议，让不同平台的设备通过网络访问您的文件</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:activity" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">运行中协议</span>
            <span class="overview-value">{{ activeCount }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:network" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">总协议数</span>
            <span class="overview-value">{{ protocols.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="network-toolbar">
      <Input
        v-model:value="searchText"
        placeholder="搜索协议..."
        class="search-input"
        allow-clear
      >
        <template #prefix>
          <IconifyIcon icon="lucide:search" style="font-size: 13px; color: #bfbfbf;" />
        </template>
      </Input>
    </div>

    <!-- 协议卡片列表 -->
    <div class="protocol-list">
      <div
        v-for="protocol in filteredProtocols"
        :key="protocol.id"
        class="protocol-card"
        :class="{ 'protocol-card-disabled': protocol.status === 'disabled' }"
      >
        <!-- 启用状态：紧凑上下布局 -->
        <template v-if="protocol.status === 'active'">
          <div class="card-body-active">
            <!-- 第一行：头部信息 + 操作按钮 + Switch -->
            <div class="card-header-row">
              <div class="header-left">
                <div
                  class="protocol-icon-wrap"
                  :style="{ background: getProtocolBg(protocol.protocol) }"
                >
                  <IconifyIcon
                    :icon="getProtocolIcon(protocol.protocol)"
                    class="protocol-icon"
                    :style="{ color: getProtocolColor(protocol.protocol) }"
                  />
                </div>
                <div class="protocol-meta">
                  <div class="protocol-name">
                    {{ protocol.name }}
                    <Tag size="small" color="success" class="status-tag">已启用</Tag>
                  </div>
                  <div class="protocol-desc">{{ protocol.description }}</div>
                </div>
              </div>
              <div class="header-actions">
                <Button size="small" @click="openConfigModal(protocol)">
                  <IconifyIcon icon="lucide:settings" style="font-size: 12px; margin-right: 4px;" />
                  配置
                </Button>
                <Button size="small" type="primary" @click="openGuideModal(protocol)">
                  <IconifyIcon icon="lucide:book-open" style="font-size: 12px; margin-right: 4px;" />
                  使用指南
                </Button>
                <Switch
                  :checked="true"
                  size="small"
                  @change="toggleStatus(protocol)"
                />
              </div>
            </div>

            <!-- 彩色分隔线 -->
            <div
              class="card-divider"
              :style="{ background: getProtocolGradient(protocol.protocol) }"
            />

            <!-- 第二行：访问地址 + 配置 + 操作 -->
            <div class="card-body-row">
              <!-- 左侧：访问地址 -->
              <div class="access-url-section">
                <div class="section-label">
                  <IconifyIcon icon="lucide:link" style="font-size: 11px;" />
                  访问地址
                </div>
                <div class="access-url-bar">
                  <code class="access-url">{{ getAccessUrl(protocol) }}</code>
                  <Tooltip title="复制地址">
                    <Button
                      size="small"
                      type="text"
                      class="copy-btn"
                      @click="copyAccessUrl(protocol)"
                    >
                      <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <!-- 中间：配置信息 -->
              <div class="card-config-area">
                <div class="section-label">
                  <IconifyIcon icon="lucide:settings-2" style="font-size: 11px;" />
                  配置信息
                </div>
                <div class="config-list">
                  <div
                    v-for="item in getConfigItems(protocol)"
                    :key="item.label"
                    class="config-item"
                  >
                    <span class="config-item-label">{{ item.label }}</span>
                    <span class="config-item-value">{{ item.value }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </template>

        <!-- 禁用状态：精简单行 -->
        <template v-else>
          <div class="card-body-disabled">
            <div class="disabled-left">
              <div class="protocol-icon-wrap" style="background: #f5f5f5;">
                <IconifyIcon
                  :icon="getProtocolIcon(protocol.protocol)"
                  class="protocol-icon"
                  style="color: #bfbfbf;"
                />
              </div>
              <div class="protocol-meta">
                <div class="protocol-name">
                  {{ protocol.name }}
                  <Tag size="small" class="status-tag">未启用</Tag>
                </div>
                <div class="protocol-desc">{{ protocol.description }}</div>
              </div>
            </div>
            <Switch
              :checked="false"
              size="small"
              @change="toggleStatus(protocol)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredProtocols.length === 0" class="empty-state">
      <IconifyIcon icon="lucide:search-x" class="empty-icon" />
      <div class="empty-text">未找到匹配的协议</div>
      <Button size="small" @click="searchText = ''">
        <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px; margin-right: 4px;" />
        清除搜索
      </Button>
    </div>

    <!-- ==================== 配置弹窗 ==================== -->
    <Modal
      v-model:open="configModalVisible"
      :title="`配置 - ${editingProtocol?.name}`"
      width="520px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveConfig"
    >
      <Form
        ref="configFormRef"
        :model="configForm"
        layout="vertical"
        :rules="{
          path: [{ required: true, message: '请输入共享路径', trigger: 'blur' }],
          port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        }"
      >
        <div class="form-section-title">基础配置</div>
        <Form.Item label="共享路径" name="path">
          <Input v-model:value="configForm.path" placeholder="/share/xxx" />
        </Form.Item>
        <Form.Item label="端口" name="port">
          <Input v-model:value="configForm.port" type="number" placeholder="端口号" />
        </Form.Item>
        <div class="form-switch-row">
          <Form.Item class="form-switch-item">
            <Switch v-model:checked="configForm.requireAuth" size="small" />
            <span class="switch-label">需要认证</span>
          </Form.Item>
          <Form.Item class="form-switch-item">
            <Switch v-model:checked="configForm.autoMount" size="small" />
            <span class="switch-label">自动挂载</span>
          </Form.Item>
        </div>

        <!-- SMB 特有 -->
        <template v-if="editingProtocol?.protocol === 'SMB'">
          <div class="form-section-title">SMB 特有配置</div>
          <Form.Item label="工作组">
            <Input v-model:value="configForm.workgroup" placeholder="WORKGROUP" />
          </Form.Item>
          <Form.Item>
            <Switch v-model:checked="configForm.enableV1" size="small" />
            <span class="switch-label">启用 SMBv1（不推荐，存在安全风险）</span>
          </Form.Item>
        </template>

        <!-- NFS 特有 -->
        <template v-if="editingProtocol?.protocol === 'NFS'">
          <div class="form-section-title">NFS 特有配置</div>
          <Form.Item label="Root Squash">
            <Input v-model:value="configForm.squash" placeholder="no_root_squash" />
          </Form.Item>
        </template>

        <!-- WebDAV 特有 -->
        <template v-if="editingProtocol?.protocol === 'WebDAV'">
          <div class="form-section-title">WebDAV 特有配置</div>
          <Form.Item>
            <Switch v-model:checked="configForm.https" size="small" />
            <span class="switch-label">启用 HTTPS</span>
          </Form.Item>
        </template>

        <!-- FTP 特有 -->
        <template v-if="editingProtocol?.protocol === 'FTP'">
          <div class="form-section-title">FTP 特有配置</div>
          <Form.Item>
            <Switch v-model:checked="configForm.passiveMode" size="small" />
            <span class="switch-label">被动模式</span>
          </Form.Item>
        </template>

        <!-- AFP 特有 -->
        <template v-if="editingProtocol?.protocol === 'AFP'">
          <div class="form-section-title">AFP 特有配置</div>
          <Form.Item>
            <Switch v-model:checked="configForm.timeMachine" size="small" />
            <span class="switch-label">Time Machine 备份支持</span>
          </Form.Item>
        </template>
      </Form>
    </Modal>

    <!-- ==================== 使用指南弹窗 ==================== -->
    <Modal
      v-model:open="guideModalVisible"
      :title="`使用指南 - ${guideProtocol?.name}`"
      width="720px"
      :footer="null"
    >
      <div class="guide-content">
        <Tabs v-model:active-key="guideOs">
          <TabPane key="windows" tab="Windows">
            <Card size="small" class="guide-card">
              <pre class="guide-code">{{ getGuideContent(guideProtocol?.protocol || '', 'windows') }}</pre>
            </Card>
          </TabPane>
          <TabPane key="linux" tab="Linux">
            <Card size="small" class="guide-card">
              <pre class="guide-code">{{ getGuideContent(guideProtocol?.protocol || '', 'linux') }}</pre>
            </Card>
          </TabPane>
          <TabPane key="mac" tab="macOS">
            <Card size="small" class="guide-card">
              <pre class="guide-code">{{ getGuideContent(guideProtocol?.protocol || '', 'mac') }}</pre>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.network-page {
  padding: 0 0 24px;
}

/* ==================== 页面头部 ==================== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #141414;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.5;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ==================== 搜索栏 ==================== */
.network-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px 12px;
  gap: 12px;
}

.search-input {
  width: 220px;
}

/* ==================== 协议卡片列表 ==================== */
.protocol-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 20px;
}

.protocol-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.protocol-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #d9d9d9;
}

.protocol-card-disabled {
  opacity: 0.65;
  background: #fafafa;
}

.protocol-card-disabled:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ==================== 启用状态：紧凑上下布局 ==================== */
.card-body-active {
  display: flex;
  flex-direction: column;
}

/* 第一行：头部 + 操作按钮 + Switch */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 10px;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.protocol-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.protocol-icon {
  font-size: 22px;
  transition: color 0.3s ease;
}

.protocol-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.protocol-name {
  font-size: 15px;
  font-weight: 600;
  color: #141414;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  font-size: 11px;
  font-weight: 500;
}

.protocol-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

/* 彩色分隔线 */
.card-divider {
  height: 3px;
  transition: all 0.3s ease;
  margin: 0 20px;
  border-radius: 2px;
}

/* 第二行：内容区 + 操作区 */
.card-body-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 10px 20px 14px;
}

/* 访问地址 - 固定宽度 */
.access-url-section {
  width: 320px;
  flex-shrink: 0;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.access-url-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 6px 10px;
}

.access-url {
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  color: #135200;
  background: transparent;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  color: #52c41a;
  padding: 2px 6px;
  height: auto;
  flex-shrink: 0;
}

.copy-btn:hover {
  color: #389e0d;
  background: #d9f7be;
}

/* 配置信息区域 - 固定宽度横排 */
.card-config-area {
  width: 420px;
  flex-shrink: 0;
}

.config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 12px;
  flex-shrink: 0;
}

.config-item-label {
  color: #8c8c8c;
  flex-shrink: 0;
}

.config-item-value {
  color: #262626;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
}

/* 操作按钮区 */
.card-actions-area {
  width: 140px;
  flex-shrink: 0;
  padding-left: 16px;
  border-left: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  margin-left: 16px;
}

/* ==================== 禁用状态：精简单行 ==================== */
.card-body-disabled {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  gap: 16px;
}

.disabled-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

/* ==================== 空状态 ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
}

.empty-text {
  font-size: 14px;
  color: #8c8c8c;
}

/* ==================== 使用指南弹窗 ==================== */
.guide-content {
  padding-top: 8px;
}

.guide-card {
  margin-top: 8px;
  background: #f6ffed;
}

.guide-code {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 16px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #135200;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

/* ==================== 表单样式 ==================== */
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

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .protocol-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-input {
    width: 180px;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
