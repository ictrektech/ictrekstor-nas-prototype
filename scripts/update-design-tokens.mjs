/**
 * 批量替换页面中硬编码的颜色和字号为 CSS 变量
 * 基于 .agents/skills/visual-design/SKILL.md 规范
 */
import fs from 'fs';
import path from 'path';

const ROOT = 'apps/web-antd/src';

// 排除的文件/目录
const EXCLUDE = ['styles/design-tokens.css', 'bootstrap.ts'];

// 颜色替换映射（按优先级排序，长的先替换）
const COLOR_MAP = [
  // === 品牌色 ===
  { from: /#1677ff/g, to: 'var(--ict-primary)' },
  { from: /#006BE6/g, to: 'var(--ict-primary)' },
  { from: /#E6F2FF/g, to: 'var(--ict-primary-light)' },
  { from: /#e6f4ff/g, to: 'var(--ict-primary-light)' },
  { from: /#e6f7ff/g, to: 'var(--ict-primary-light)' },
  { from: /#E8F7FF/g, to: 'var(--ict-primary-light)' },
  { from: /#91caff/g, to: 'var(--ict-primary-disabled)' },

  // === 成功色 ===
  { from: /#52C41A/g, to: 'var(--ict-success)' },
  { from: /#52c41a/g, to: 'var(--ict-success)' },
  { from: /#10BA64/g, to: 'var(--ict-success)' },
  { from: /#f6ffed/g, to: 'var(--ict-success-light)' },
  { from: /#E8FFF0/g, to: 'var(--ict-success-light)' },
  { from: /#B4F1CA/g, to: 'var(--ict-success-bg)' },
  { from: /#389e0d/g, to: 'var(--ict-success-active)' },
  { from: /#b7eb8f/g, to: 'var(--ict-success-disabled)' },
  { from: /#135200/g, to: 'var(--ict-success-active)' },
  { from: /#84E3AA/g, to: 'var(--ict-success-disabled)' },

  // === 警告色 ===
  { from: /#F77234/g, to: 'var(--ict-warning)' },
  { from: /#FAAD14/g, to: 'var(--ict-warning)' },
  { from: /#faad14/g, to: 'var(--ict-warning)' },
  { from: /#fff7e6/g, to: 'var(--ict-warning-light)' },
  { from: /#FFF3E8/g, to: 'var(--ict-warning-light)' },
  { from: /#FDDDC3/g, to: 'var(--ict-warning-bg)' },
  { from: /#d48806/g, to: 'var(--ict-warning-active)' },
  { from: /#F99057/g, to: 'var(--ict-warning-hover)' },
  { from: /#CC5120/g, to: 'var(--ict-warning-active)' },
  { from: /#fa8c16/g, to: 'var(--ict-warning)' },
  { from: /#FCC59F/g, to: 'var(--ict-warning-disabled)' },

  // === 危险色 ===
  { from: /#F53F3F/g, to: 'var(--ict-danger)' },
  { from: /#FF4D4F/g, to: 'var(--ict-danger)' },
  { from: /#ff4d4f/g, to: 'var(--ict-danger)' },
  { from: /#fff1f0/g, to: 'var(--ict-danger-light)' },
  { from: /#FFECE8/g, to: 'var(--ict-danger-light)' },
  { from: /#FDCDC5/g, to: 'var(--ict-danger-bg)' },
  { from: /#CF1322/g, to: 'var(--ict-danger-active)' },
  { from: /#F76560/g, to: 'var(--ict-danger-hover)' },
  { from: /#CB272D/g, to: 'var(--ict-danger-active)' },
  { from: /#FBACA3/g, to: 'var(--ict-danger-disabled)' },

  // === 信息紫 ===
  { from: /#722ED1/g, to: 'var(--ict-info)' },
  { from: /#722ed1/g, to: 'var(--ict-info)' },
  { from: /#f9f0ff/g, to: 'var(--ict-info-light)' },
  { from: /#F9F0FF/g, to: 'var(--ict-info-light)' },

  // === 中性色 - 文本 ===
  { from: /#0f172a/g, to: 'var(--ict-text-emphasis)' },
  { from: /#262626/g, to: 'var(--ict-text-emphasis)' },
  { from: /#141414/g, to: 'var(--ict-text-emphasis)' },
  { from: /#1e293b/g, to: 'var(--ict-text-primary)' },
  { from: /#434343/g, to: 'var(--ict-text-primary)' },
  { from: /#64748b/g, to: 'var(--ict-text-secondary)' },
  { from: /#8c8c8c/g, to: 'var(--ict-text-secondary)' },
  { from: /#595959/g, to: 'var(--ict-text-secondary)' },
  { from: /#45484B/g, to: 'var(--ict-text-disabled)' },
  { from: /#bfbfbf/g, to: 'var(--ict-text-disabled)' },
  { from: /#BFBFBF/g, to: 'var(--ict-text-disabled)' },
  { from: /#d9d9d9/g, to: 'var(--ict-text-disabled)' },

  // === 中性色 - 边框/背景 ===
  { from: /#E8E8E8/g, to: 'var(--ict-border)' },
  { from: /#e8e8e8/g, to: 'var(--ict-border)' },
  { from: /#E9ECEF/g, to: 'var(--ict-border)' },
  { from: /#F0F0F0/g, to: 'var(--ict-border-light)' },
  { from: /#f0f0f0/g, to: 'var(--ict-border-light)' },
  { from: /#F5F5F5/g, to: 'var(--ict-bg-page)' },
  { from: /#f5f5f5/g, to: 'var(--ict-bg-page)' },
  { from: /#FFFFFF/g, to: 'var(--ict-bg-card)' },
  { from: /#ffffff/g, to: 'var(--ict-bg-card)' },
  { from: /#fff\b/g, to: 'var(--ict-bg-card)' },
  { from: /#FAFAFA/g, to: 'var(--ict-bg-section)' },
  { from: /#fafafa/g, to: 'var(--ict-bg-section)' },

  // === 其他 ===
  { from: /#e0e0e0/g, to: 'var(--ict-border)' },
];

// 字号替换映射（需谨慎，按上下文分类）
const FONT_SIZE_MAP = [
  { from: /font-size: 36px/g, to: 'font-size: var(--ict-headline-large)' },
  { from: /font-size: 28px/g, to: 'font-size: var(--ict-headline-medium)' },
  { from: /font-size: 24px/g, to: 'font-size: var(--ict-headline-small)' },
  { from: /font-size: 22px/g, to: 'font-size: var(--ict-headline-small)' },
  { from: /font-size: 20px/g, to: 'font-size: var(--ict-title-large)' },
  { from: /font-size: 18px/g, to: 'font-size: var(--ict-title-large)' },
  { from: /font-size: 16px/g, to: 'font-size: var(--ict-title-medium)' },
  { from: /font-size: 15px/g, to: 'font-size: var(--ict-title-small)' },
  { from: /font-size: 14px/g, to: 'font-size: var(--ict-body-medium)' },
  { from: /font-size: 13px/g, to: 'font-size: var(--ict-mark-medium)' },
  { from: /font-size: 12px/g, to: 'font-size: var(--ict-body-small)' },
  { from: /font-size: 11px/g, to: 'font-size: var(--ict-mark-small)' },
  { from: /font-size: 10px/g, to: 'font-size: var(--ict-mark-small)' },
];

// 字体栈替换
const FONT_FAMILY_MAP = [
  { from: /font-family: 'SF Mono', 'Fira Code', monospace/g, to: 'font-family: var(--ict-font-family)' },
  { from: /font-family: 'SF Mono', 'Fira Code', Consolas, monospace/g, to: 'font-family: var(--ict-font-family)' },
  { from: /font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace/g, to: 'font-family: var(--ict-font-family)' },
];

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, callback);
    } else if (
      (full.endsWith('.vue') || full.endsWith('.css') || full.endsWith('.scss')) &&
      !EXCLUDE.some((e) => rel.includes(e))
    ) {
      callback(full);
    }
  }
}

let totalFiles = 0;
let changedFiles = 0;

walk(ROOT, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 排除 design-tokens.css 自身和 chart/echarts 配置中的颜色
  const isChartFile = filePath.includes('chart') || filePath.includes('echart');

  // 颜色替换
  if (!isChartFile) {
    for (const rule of COLOR_MAP) {
      content = content.replace(rule.from, rule.to);
    }
  }

  // 字号替换
  for (const rule of FONT_SIZE_MAP) {
    content = content.replace(rule.from, rule.to);
  }

  // 字体栈替换
  for (const rule of FONT_FAMILY_MAP) {
    content = content.replace(rule.from, rule.to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${path.relative('.', filePath)}`);
    changedFiles++;
  }
  totalFiles++;
});

console.log(`\n📊 处理完成：${totalFiles} 个文件，${changedFiles} 个文件已更新`);
