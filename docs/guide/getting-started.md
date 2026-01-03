# 快速开始

欢迎来到迷你Linux手持开发板文档！本指南将帮助您快速了解项目并开始复刻。

## 项目简介

这是一款面向折腾与二次开发的迷你 Linux 手持开发板，基于 F1C200S，拥有 ARM926EJ-S CPU、64MB 内存、竖屏高分辨率 LCD、H.264 硬解能力，并保留常用外设接口。便于快速做 UI、媒体展示与各种硬件实验。

## 复刻流程概览

准备工作 → PCB下单 → 购买元器件 → 焊接贴装 → 固件烧录 → 调试验证

### 1. 准备工作

在开始之前，请确保您具备：

- 基本的焊接技能（建议有0603以上贴片焊接经验）
- 必要的焊接工具
- 调试设备

详见 [准备工作](./preparation.md)

### 2. 硬件制作

1. **[PCB下单](./hardware/pcb-order.md)** - 获取PCB板
2. **[元器件购买](./hardware/components.md)** - 购买所需元器件
3. **[贴装须知](./hardware/assembly-notes.md)** - 了解器件方向等注意事项
4. **[贴装过程](./hardware/assembly.md)** - 详细的焊接步骤

### 3. 固件烧录

完成硬件焊接后，需要烧录固件：

- [固件烧录指南](./firmware/flash.md)

### 4. 调试验证

遇到问题？查看：

- [常见问题](./faq.md)
- [调试排障](./debug/)

## 注意事项

::: warning 安全警告
- 在制作本项目的过程中需要用到加热工具，请小心高温
- 在上电之前请务必检查电路（有无连锡、错焊、漏焊等）
:::

## 获取资源

- **硬件仓库**：[GitHub - epass_hardware](https://github.com/inapp123/epass_hardware)
- **软件仓库**：[GitHub - epass_drm_app](https://github.com/inapp123/epass_drm_app)
- **Release下载**：[Releases](https://github.com/inapp123/epass_hardware/releases)

## 下一步

准备好了吗？让我们从 [准备工作](./preparation.md) 开始！
