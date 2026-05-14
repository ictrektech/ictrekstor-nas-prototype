# 字体规范

## 1. 字体栈

```css
/* 主字体 — 系统字体回退栈，确保在各平台上都有良好的显示效果 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* 数值/代码等宽字体 — 强制用于所有容量、百分比、序列号等数据内容 */
/* 使用等宽字体可以让数字列对齐，提高数据可读性 */
font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

## 2. 字号层级

| 层级 | 字号 | 字重 | 颜色 | 用途 |
|------|------|------|------|------|
| 页面大标题 | `20px` | `700` | `#141414` | 设备名称（Hero区） |
| 页面标题 | `16px` | `600` | `hsl(var(--foreground))` | 页面头部标题、区域标题 |
| 卡片标题 | `15-16px` | `600-700` | `hsl(var(--foreground))` | 卡片内名称、存储池名 |
| 子标题 | `14px` | `600` | `hsl(var(--foreground))` | 分区标题、表头 |
| 正文 | `13-14px` | `400-500` | `hsl(var(--foreground))` | 普通文字、描述 |
| 描述/辅助 | `12px` | `400` | `hsl(var(--muted-foreground))` | 页面描述、辅助说明 |
| 标签 | `10-11px` | `500` | `hsl(var(--muted-foreground))` | 芯片标签、元数据标签 |
| 极小标签 | `10px` | `500` | `#595959` | 状态徽章内文字、硬盘标签 |

**代码示例 — 页面头部标题样式：**

```css
/* 页面标题使用 CSS 变量 --foreground 作为文字颜色，
   这样当切换到暗色主题时，文字颜色会自动变为浅色。
   字重 600 确保标题有足够的视觉分量。 */
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  line-height: 1.4;
}

/* 页面描述使用 --muted-foreground 作为次要文字颜色，
   形成与标题的层次对比。 */
.page-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin: 2px 0 0;
}
```

## 3. 数值显示规范（等宽字体强制规则）

所有容量、百分比、使用率、序列号、MAC 地址等**纯数据型内容**必须使用等宽字体：

```css
/* 数值等宽字体样式。
   等宽字体（Monospace）每个字符宽度相同，
   可以让容量数值、百分比等数据在表格或卡片中对齐，提高可读性。
   font-weight: 700 让数值更醒目。 */
.numeric-value {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-weight: 700;
}
```

**适用场景**：
- 存储容量（如 `1.81 TB`、`45 GB`）
- 使用率百分比（如 `50%`、`60%`）
- 设备序列号、MAC 地址
- 运行时间、温度数值
- 统计概览数字

**代码示例 — 统计卡片数值（使用等宽字体）：**

```css
/* 统计概览卡片中的数值必须使用等宽字体。
   这样当多个统计卡片并排时，数值在视觉上对齐更整齐。
   字重 600 让数字在卡片中有足够的视觉分量。 */
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  font-family: 'SF Mono', 'Fira Code', monospace;
}
```

**代码示例 — 容量显示（使用等宽字体 + CSS 变量颜色）：**

```css
/* 容量数值使用等宽字体 + CSS 变量语义颜色。
   已用容量使用前景色，总容量使用次要色，形成层次。 */
.capacity-used {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.capacity-total {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: hsl(var(--muted-foreground));
}

.capacity-percent {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  /* 颜色根据使用率动态变化，使用 CSS 变量语义 */
  color: hsl(var(--primary)); /* 或 --warning / --destructive */
}
```

## 4. 行高规范

| 场景 | 行高 | 说明 |
|------|------|------|
| 标题文字 | `1.4` | 紧凑但留有呼吸感 |
| 正文段落 | `1.5-1.6` | 提高可读性 |
| 单行标签 | `1.3` | 标签内文字垂直居中 |

## 5. 文字截断

```css
/* 单行截断 — 当文字超出容器宽度时显示省略号。
   适用于卡片标题、文件名称等场景。 */
.single-line-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行截断 — 当文字超出指定行数时显示省略号。
   -webkit-line-clamp: 2 表示最多显示 2 行。
   适用于卡片描述等场景。 */
.multi-line-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```
