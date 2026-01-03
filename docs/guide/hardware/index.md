# 硬件概述

本章节将指导您完成硬件部分的制作，包括 PCB 下单、元器件购买和焊接贴装。

## 硬件制作流程

```
PCB下单 → 元器件购买 → 焊接贴装 → 调试验证
```

## 章节导航

| 章节 | 说明 |
| --- | --- |
| [PCB下单指南](./pcb-order.md) | 如何在嘉立创下单 PCB |
| [元器件购买](./components.md) | 元器件购买注意事项 |
| [贴装须知](./assembly-notes.md) | 器件方向等注意事项 |
| [贴装过程](./assembly.md) | 详细的焊接步骤指南 |

## 系统架构

![系统架构](/images/system_diagram.png)

## 电源架构

![电源架构](/images/power_diagram.png)

## PCB分区

![PCB分区](/images/partition.png)

PCB 按功能分为以下区域：

- **绿色区域** - 供电器件（必须首先贴装）
- **浅蓝色区域** - 核心器件（SOC、Flash等）
- **红色区域** - 屏幕连接器和按钮
- **深蓝色区域** - 扩展接口和SD卡槽

## 下一步

开始 [PCB下单](./pcb-order.md)！
