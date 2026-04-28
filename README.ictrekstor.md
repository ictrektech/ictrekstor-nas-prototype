# ictrekstor nas 原型界面

## 环境搭建

参考 ./README.md

安装足够新的版本的 nodejs，随后安装 corepack：
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
