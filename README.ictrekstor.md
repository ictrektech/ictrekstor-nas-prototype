# ictrekstor nas 原型界面

## 环境搭建

参考 ./README.md

安装足够新的版本（推荐最新版本的 LTS ）的 nodejs，随后安装 corepack：
```
npm install -g corepack
```

设置 npm 的国内镜像：
```
npm config set registry https://registry.npmmirror.com/
```

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

## TIPS

- vscode 在 windows 下使用 cline 时，务必确保在 cline 的 Terminal 设置中：
  - 将 Default Terminal Profile 设置为 Git Bash；
  - 将 Terminal Execution Mode 设置为 VS Code Terminal；
  否则会出现中文乱码。

- vscode 中建议安装官方的 Vue 插件，其中集成的 LSP 可以实时通知 AI 语法错误等问题，提高
  AI 编码效率；

