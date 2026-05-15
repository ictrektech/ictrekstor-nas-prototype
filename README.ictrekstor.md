# ictrekstor nas 原型界面

## 环境搭建

参考 ./README.md

设置 npm 的国内镜像：
```
npm config set registry https://registry.npmmirror.com/
```

安装足够新的版本（推荐最新版本的 LTS ）的 nodejs，随后安装 corepack：
```
npm install -g corepack
```

## 启动开发环境

克隆代码：
```
git clone http://gitlab.ictrek.internal/ictrek/ictrekstor-nas-prototype.git
cd ictrekstor-nas-prototype
```
注意：如果你的电脑无法访问 http://gitlab.ictrek.internal/ictrek/ictrekstor-nas-prototype，
可以改成 http://192.168.100.99/ictrek/ictrekstor-nas-prototype

然后安装依赖：
```
pnpm install
```

启动服务：
```
pnpm run dev:antd --port 5666
```
随后访问 http://127.0.0.1:5666 即可访问前端页面。

## 配置 chrome mcp server

参考：
- https://github.com/ChromeDevTools/chrome-devtools-mcp

安装
```
npm install -g chrome-devtools-mcp@latest
```

随后配置 cline 的 mcp server，参考：
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "chrome-devtools-mcp",
      "args": [
        "--accept-insecure-certs=true",
        "--usage-statistics=false"
      ]
    }
  }
}

```

## 如何上传到公网托管页面

首先进行构建：
```
pnpm run build:antd
```

然后将构建结果上传，按提示输入密码：
```
scp -r ./apps/web-antd/dist/* ictrek@192.168.1.199:/home/ictrek/release-build/vst/ictrekstor-nas-prototype/
```

随后可以公网访问：
http://117.139.166.210:1080/vos-release/vst/ictrekstor-nas-prototype/index.html

## TIPS

- vscode 在 windows 下使用 cline 时，务必确保在 cline 的 Terminal 设置中：
  - 将 Default Terminal Profile 设置为 Git Bash；
  - 将 Terminal Execution Mode 设置为 VS Code Terminal；
  否则会出现中文乱码。

- vscode 中建议安装官方的 Vue 插件，其中集成的 LSP 可以实时通知 AI 语法错误等问题，提高
  AI 编码效率；

