#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function generateBomHtml(version) {
  // 读取 JSON 数据
  const jsonPath = resolve(__dirname, `../docs/public/bom/${version}.json`)

  let bomData
  try {
    const content = await readFile(jsonPath, 'utf-8')
    bomData = JSON.parse(content)
  } catch (err) {
    console.error(`错误: 无法读取 ${jsonPath}`)
    console.error(`请先确保 ${version}.json 文件存在`)
    process.exit(1)
  }

  const { categories, components, metadata } = bomData

  // 计算汇总数据
  const totalQuantity = components.reduce((sum, c) => sum + c.quantity, 0)
  const totalPrice = components.reduce((sum, c) => sum + c.quantity * c.supplier.unitPrice, 0)

  // 生成表格行
  const tableRows = components.map(comp => {
    const cat = categories.find(c => c.id === comp.category)
    const catColor = cat?.color || '#607D8B'
    const subtotal = (comp.quantity * comp.supplier.unitPrice).toFixed(2)
    const link = comp.supplier.url
      ? `<a href="${comp.supplier.url}" target="_blank" rel="noopener">${comp.supplier.name}</a>`
      : comp.supplier.name

    return `
      <tr data-category="${comp.category}" data-search="${comp.reference} ${comp.value} ${comp.footprint} ${comp.description}".toLowerCase()>
        <td style="border-left: 3px solid ${catColor}"><code>${comp.reference}</code></td>
        <td><code>${comp.value}</code></td>
        <td class="hide-mobile">${comp.footprint}</td>
        <td class="center">${comp.quantity}</td>
        <td class="hide-mobile">${comp.description}</td>
        <td class="right">¥${comp.supplier.unitPrice.toFixed(2)}</td>
        <td class="right highlight">¥${subtotal}</td>
        <td class="hide-mobile">${link}</td>
      </tr>`
  }).join('\n')

  // 生成分类按钮
  const categoryButtons = categories.map(cat => `
    <button class="cat-btn active" data-cat="${cat.id}" style="--cat-color: ${cat.color}">
      <span class="cat-dot"></span>
      ${cat.name}
    </button>
  `).join('\n')

  // 生成完整 HTML
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BOM 清单 - ${version} | 明日方舟电子通行证</title>
  <style>
    :root {
      --primary: #3451b2;
      --primary-light: #5672cd;
      --bg: #ffffff;
      --bg-soft: #f6f6f7;
      --bg-mute: #e9e9eb;
      --text-1: #213547;
      --text-2: #476582;
      --text-3: #90a4ae;
      --divider: #e2e2e3;
      --shadow: rgba(0, 0, 0, 0.08);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --primary: #a8b1ff;
        --primary-light: #5672cd;
        --bg: #1a1a1a;
        --bg-soft: #242424;
        --bg-mute: #2f2f2f;
        --text-1: #ffffff;
        --text-2: #a8b1c5;
        --text-3: #6b7c93;
        --divider: #2e2e32;
        --shadow: rgba(0, 0, 0, 0.3);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg);
      color: var(--text-1);
      line-height: 1.6;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .meta {
      color: var(--text-3);
      font-size: 0.875rem;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      font-size: 0.875rem;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: var(--bg-soft);
      color: var(--text-1);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(52, 81, 178, 0.1);
    }

    .search-box::before {
      content: "🔍";
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.875rem;
      opacity: 0.5;
    }

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .cat-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-2);
      background: var(--bg-soft);
      border: 1px solid var(--divider);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cat-btn:hover {
      border-color: var(--cat-color);
      transform: translateY(-1px);
    }

    .cat-btn.active {
      color: var(--text-1);
      background: color-mix(in srgb, var(--cat-color) 15%, transparent);
      border-color: var(--cat-color);
    }

    .cat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cat-color);
    }

    .table-wrapper {
      overflow-x: auto;
      margin: 0 -1rem;
      padding: 0 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    th {
      padding: 0.75rem 0.5rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-2);
      background: var(--bg);
      border-bottom: 2px solid var(--divider);
      white-space: nowrap;
      position: sticky;
      top: 0;
      cursor: pointer;
      user-select: none;
    }

    th:hover {
      color: var(--primary);
    }

    th .sort-icon {
      margin-left: 0.25rem;
      opacity: 0.4;
      font-size: 0.75rem;
    }

    th.sorted .sort-icon {
      opacity: 1;
      color: var(--primary);
    }

    td {
      padding: 0.625rem 0.5rem;
      border-bottom: 1px solid var(--divider);
      vertical-align: middle;
    }

    tr:hover {
      background: var(--bg-soft);
    }

    tr.hidden {
      display: none;
    }

    code {
      font-family: "SF Mono", Monaco, Consolas, monospace;
      font-size: 0.8125rem;
    }

    .center { text-align: center; }
    .right { text-align: right; }
    .highlight { color: var(--primary); font-weight: 500; }

    a {
      color: var(--primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 1.25rem;
      padding: 1rem;
      background: var(--bg-soft);
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.75rem;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .summary-total .summary-value {
      color: var(--primary);
    }

    .empty {
      text-align: center;
      padding: 3rem;
      color: var(--text-3);
    }

    .export-btns {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
    }

    .export-btn {
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #fff;
      background: var(--primary);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .export-btn:hover {
      background: var(--primary-light);
      transform: translateY(-1px);
    }

    .export-btn.secondary {
      color: var(--text-1);
      background: var(--bg-soft);
      border: 1px solid var(--divider);
    }

    .export-btn.secondary:hover {
      border-color: var(--primary);
    }

    footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--divider);
      text-align: center;
      color: var(--text-3);
      font-size: 0.8125rem;
    }

    footer a {
      color: var(--text-2);
    }

    @media (max-width: 768px) {
      body { padding: 1rem; }
      .hide-mobile { display: none; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { max-width: none; }
      .export-btns { margin-left: 0; justify-content: stretch; }
      .export-btn { flex: 1; text-align: center; }
    }

    @media print {
      .toolbar, .categories, .export-btns { display: none !important; }
      .hide-mobile { display: table-cell !important; }
      body { padding: 0; }
      th { position: static; }
    }
  </style>
</head>
<body>
  <header>
    <h1>BOM 清单 - 明日方舟电子通行证 ${version}</h1>
    <p class="meta">生成时间: ${new Date().toLocaleString('zh-CN')} | 元件种类: ${components.length} | 总数量: ${totalQuantity}</p>
  </header>

  <div class="toolbar">
    <div class="search-box">
      <input type="text" id="search" placeholder="搜索元器件...">
    </div>
    <div class="export-btns">
      <button class="export-btn" onclick="exportCSV()">📥 导出 CSV</button>
      <button class="export-btn secondary" onclick="window.print()">🖨️ 打印</button>
    </div>
  </div>

  <div class="categories">
    ${categoryButtons}
  </div>

  <div class="table-wrapper">
    <table id="bom-table">
      <thead>
        <tr>
          <th data-sort="reference">位号 <span class="sort-icon">↕</span></th>
          <th data-sort="value">值 <span class="sort-icon">↕</span></th>
          <th class="hide-mobile">封装</th>
          <th data-sort="quantity">数量 <span class="sort-icon">↕</span></th>
          <th class="hide-mobile">描述</th>
          <th data-sort="price">单价 <span class="sort-icon">↕</span></th>
          <th>小计</th>
          <th class="hide-mobile">供应商</th>
        </tr>
      </thead>
      <tbody id="bom-body">
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div class="empty" id="empty" style="display: none;">
    🔍 没有找到匹配的元器件
  </div>

  <div class="summary" id="summary">
    <div class="summary-item">
      <span class="summary-label">显示元件</span>
      <span class="summary-value" id="shown-count">${components.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">显示数量</span>
      <span class="summary-value" id="shown-qty">${totalQuantity}</span>
    </div>
    <div class="summary-item summary-total">
      <span class="summary-label">显示总价</span>
      <span class="summary-value" id="shown-price">¥${totalPrice.toFixed(2)}</span>
    </div>
  </div>

  <footer>
    <p>
      项目主页: <a href="https://github.com/rhodesepass/docs" target="_blank">github.com/rhodesepass/docs</a>
    </p>
  </footer>

  <script>
    const bomData = ${JSON.stringify(components)};
    const categories = ${JSON.stringify(categories.map(c => c.id))};
    let activeCategories = new Set(categories);
    let searchQuery = '';
    let sortBy = '';
    let sortDesc = false;

    // 搜索
    document.getElementById('search').addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterTable();
    });

    // 分类筛选
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        if (activeCategories.has(cat)) {
          activeCategories.delete(cat);
          btn.classList.remove('active');
        } else {
          activeCategories.add(cat);
          btn.classList.add('active');
        }
        filterTable();
      });
    });

    // 排序
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (sortBy === field) {
          sortDesc = !sortDesc;
        } else {
          sortBy = field;
          sortDesc = false;
        }
        document.querySelectorAll('th').forEach(h => h.classList.remove('sorted'));
        th.classList.add('sorted');
        th.querySelector('.sort-icon').textContent = sortDesc ? '↓' : '↑';
        sortTable();
      });
    });

    function filterTable() {
      const rows = document.querySelectorAll('#bom-body tr');
      let visibleCount = 0;
      let visibleQty = 0;
      let visiblePrice = 0;

      rows.forEach((row, i) => {
        const cat = row.dataset.category;
        const searchText = row.dataset.search;
        const catMatch = activeCategories.has(cat);
        const searchMatch = !searchQuery || searchText.includes(searchQuery);

        if (catMatch && searchMatch) {
          row.classList.remove('hidden');
          visibleCount++;
          visibleQty += bomData[i].quantity;
          visiblePrice += bomData[i].quantity * bomData[i].supplier.unitPrice;
        } else {
          row.classList.add('hidden');
        }
      });

      document.getElementById('shown-count').textContent = visibleCount;
      document.getElementById('shown-qty').textContent = visibleQty;
      document.getElementById('shown-price').textContent = '¥' + visiblePrice.toFixed(2);
      document.getElementById('empty').style.display = visibleCount === 0 ? 'block' : 'none';
      document.getElementById('summary').style.display = visibleCount === 0 ? 'none' : 'flex';
    }

    function sortTable() {
      const tbody = document.getElementById('bom-body');
      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
        const ai = Array.from(tbody.children).indexOf(a);
        const bi = Array.from(tbody.children).indexOf(b);
        const aData = bomData[ai];
        const bData = bomData[bi];

        let cmp = 0;
        switch (sortBy) {
          case 'reference':
            cmp = aData.reference.localeCompare(bData.reference);
            break;
          case 'value':
            cmp = aData.value.localeCompare(bData.value);
            break;
          case 'quantity':
            cmp = aData.quantity - bData.quantity;
            break;
          case 'price':
            cmp = aData.supplier.unitPrice - bData.supplier.unitPrice;
            break;
        }
        return sortDesc ? -cmp : cmp;
      });

      rows.forEach(row => tbody.appendChild(row));
    }

    function exportCSV() {
      const headers = ['位号', '值', '封装', '数量', '描述', '供应商', '单价', '小计', '链接'];
      const rows = bomData.map(c => [
        c.reference,
        c.value,
        c.footprint,
        c.quantity,
        c.description,
        c.supplier.name,
        c.supplier.unitPrice.toFixed(2),
        (c.quantity * c.supplier.unitPrice).toFixed(2),
        c.supplier.url
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => \`"\${String(cell).replace(/"/g, '""')}"\`).join(','))
      ].join('\\n');

      const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bom-${version}.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`

  // 写入文件
  const outputPath = resolve(__dirname, `../docs/public/bom/electric_pass_baseboard_${version}.BOM.html`)
  await writeFile(outputPath, html, 'utf-8')

  console.log(`✅ 成功生成 HTML BOM 文件`)
  console.log(`   输出: ${outputPath}`)
  console.log(`   版本: ${version}`)
  console.log(`   元件种类: ${components.length}`)
  console.log(`   元件总数: ${totalQuantity}`)
  console.log(`   预估总价: ¥${totalPrice.toFixed(2)}`)
}

// CLI
const args = process.argv.slice(2)
if (args.length < 1) {
  console.log('用法: node scripts/generate-bom-html.js <version>')
  console.log('示例: node scripts/generate-bom-html.js v0.6')
  console.log('')
  console.log('输出: docs/public/bom/electric_pass_baseboard_<version>.BOM.html')
  process.exit(1)
}

generateBomHtml(args[0]).catch(err => {
  console.error('错误:', err.message)
  process.exit(1)
})
