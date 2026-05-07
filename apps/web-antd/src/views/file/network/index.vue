<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  Button,
  Input,
  Table,
  Tag,
  Switch,
  Modal,
  Form,
  Tabs,
  message,
  Card,
} from 'ant-design-vue';

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
}

const TabPane = Tabs.TabPane;
const searchText = ref('');

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
    description: 'Windows 系统原生支持的文件共享协议',
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
    description: 'Linux/Unix 系统原生支持的文件共享协议',
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
    description: '基于 HTTP 的文件共享协议，支持远程访问',
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
    description: '传统文件传输协议，兼容性好',
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
    description: 'macOS 原生支持的文件共享协议',
  },
]);

const nasHost = ref('192.168.1.100');

// 弹窗状态
const configModalVisible = ref(false);
const configFormRef = ref();
const editingProtocol = ref<NetworkProtocol | null>(null);
const configForm = ref({
  path: '',
  port: 0,
  requireAuth: true,
});

const guideModalVisible = ref(false);
const guideProtocol = ref<NetworkProtocol | null>(null);
const guideOs = ref('windows');

const filteredProtocols = computed(() => {
  let result = protocols.value;
  if (searchText.value) {
    const kw = searchText.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.protocol.toLowerCase().includes(kw),
    );
  }
  return result;
});

const columns = [
  { title: '协议', dataIndex: 'name', key: 'name', width: 160 },
  { title: '状态', key: 'status', width: 100 },
  { title: '共享路径', dataIndex: 'path', key: 'path' },
  { title: '端口', dataIndex: 'port', key: 'port', width: 80 },
  { title: '认证', key: 'auth', width: 80 },
  { title: '自动挂载', key: 'autoMount', width: 100 },
  { title: '操作', key: 'action', width: 180 },
];

function toggleStatus(protocol: any) {
  protocol.status = protocol.status === 'active' ? 'disabled' : 'active';
  message.success(
    `${protocol.name} 已${protocol.status === 'active' ? '启用' : '禁用'}`,
  );
}

function openConfigModal(protocol: any) {
  editingProtocol.value = protocol;
  configForm.value = {
    path: protocol.path,
    port: protocol.port,
    requireAuth: protocol.requireAuth,
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
        message.success('配置已保存');
      }
      configModalVisible.value = false;
    })
    .catch(() => {});
}

function openGuideModal(protocol: any) {
  guideProtocol.value = protocol;
  guideOs.value = 'windows';
  guideModalVisible.value = true;
}

function getGuideContent(protocol: string, os: string): string {
  const guides: Record<string, Record<string, string>> = {
    SMB: {
      windows: `在 Windows 资源管理器地址栏输入：
\\${nasHost.value}\\share

或者在命令提示符中执行：
net use Z: \\${nasHost.value}\\share /persistent:yes`,
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
</script>

<template>
  <div class="network-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="breadcrumb-bar">
          <span class="breadcrumb-icon">🌐</span>
          <span class="breadcrumb-text">网络访问</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索协议"
          class="search-input"
          allow-clear
        />
      </div>
    </div>

    <!-- 协议列表 -->
    <div class="table-wrapper">
      <Table
        :columns="columns"
        :data-source="filteredProtocols"
        row-key="id"
        size="small"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="protocol-name">
              <span class="protocol-icon">🌐</span>
              <div>
                <div class="protocol-title">{{ record.name }}</div>
                <div class="protocol-desc">{{ record.description }}</div>
              </div>
            </div>
          </template>
          <template v-if="column.key === 'status'">
            <Switch
              :checked="record.status === 'active'"
              size="small"
              @change="toggleStatus(record)"
            />
          </template>
          <template v-if="column.key === 'auth'">
            <Tag :color="record.requireAuth ? 'warning' : 'default'" size="small">
              {{ record.requireAuth ? '需要' : '不需要' }}
            </Tag>
          </template>
          <template v-if="column.key === 'autoMount'">
            <Switch :checked="record.autoMount" size="small" />
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <Button size="small" type="link" @click="openConfigModal(record)">
                配置
              </Button>
              <Button size="small" type="link" @click="openGuideModal(record)">
                使用指南
              </Button>
            </div>
          </template>
        </template>
      </Table>
    </div>

    <!-- 配置弹窗 -->
    <Modal
      v-model:open="configModalVisible"
      :title="`配置 - ${editingProtocol?.name}`"
      width="480px"
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
        <Form.Item label="共享路径" name="path">
          <Input v-model:value="configForm.path" placeholder="/share/xxx" />
        </Form.Item>
        <Form.Item label="端口" name="port">
          <Input
            v-model:value="configForm.port"
            type="number"
            placeholder="端口号"
          />
        </Form.Item>
        <Form.Item>
          <Switch
            v-model:checked="configForm.requireAuth"
            size="small"
          />
          <span style="margin-left: 8px;">需要认证</span>
        </Form.Item>
      </Form>
    </Modal>

    <!-- 使用指南弹窗 -->
    <Modal
      v-model:open="guideModalVisible"
      :title="`使用指南 - ${guideProtocol?.name}`"
      width="700px"
      :footer="null"
    >
      <div class="guide-content">
        <Tabs v-model:active-key="guideOs">
          <TabPane key="windows" tab="🪟 Windows">
            <Card size="small" class="guide-card">
              <pre class="guide-code">{{ getGuideContent(guideProtocol?.protocol || '', 'windows') }}</pre>
            </Card>
          </TabPane>
          <TabPane key="linux" tab="🐧 Linux">
            <Card size="small" class="guide-card">
              <pre class="guide-code">{{ getGuideContent(guideProtocol?.protocol || '', 'linux') }}</pre>
            </Card>
          </TabPane>
          <TabPane key="mac" tab="🍎 macOS">
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
  padding: 24px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 4px 12px;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-text {
  font-size: 14px;
  color: #262626;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 220px;
}

/* 表格 */
.table-wrapper {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

.protocol-name {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.protocol-icon {
  font-size: 22px;
  margin-top: 2px;
}

.protocol-title {
  font-weight: 500;
  font-size: 14px;
}

.protocol-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.action-btns {
  display: flex;
  gap: 4px;
}

/* 使用指南 */
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
</style>
