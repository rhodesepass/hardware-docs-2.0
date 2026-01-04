---
layout: home

hero:
  name: "迷你Linux手持开发板"
  text: "基于F1C200S的开源硬件项目"
  tagline: 一款面向折腾与二次开发的迷你 Linux 手持开发板
  image:
    src: /images/v3.1-0.51.png
    alt: 迷你Linux手持开发板
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/rhodesepass/docs

features:
  - icon: 🚀
    title: 高性能主控
    details: 基于F1C200S (ARM926EJ-S)，默认408MHz，支持超频至720MHz，内置64MB RAM
  - icon: 🖥️
    title: 高清竖屏显示
    details: 3.0英寸 360×640 高分辨率竖屏，ST7701S驱动，支持H.264硬件解码
  - icon: 🔋
    title: 完善供电方案
    details: 1500mAh锂电池，TP4056充电管理，续航持久（大概）
  - icon: 🔌
    title: 丰富扩展接口
    details: I²C、UART×2、SPI、GPIO×3、ADC，满足各种硬件实验需求
  - icon: 🐧
    title: 主线Linux支持
    details: Buildroot构建系统，Linux主线5.4.77内核，完整Linux生态
  - icon: 📖
    title: 完全开源
    details: 硬件/软件资料完全开源，欢迎社区共同完善
---

## 硬件规格

| 项目 | 规格 |
|------|------|
| **主控 SoC** | F1C200S (ARM926EJ-S) |
| **主频** | 408 MHz (可超频至 720 MHz) |
| **内存** | 64 MB RAM |
| **存储** | W25N01 NAND Flash 128MB |
| **扩展存储** | TF卡槽 / Wi-Fi (SDIO) |
| **屏幕** | 3.0英寸 360×640 竖屏 (ST7701S) |
| **电池** | 1500 mAh 锂电池 |
| **充电** | TP4056 |
| **按键** | 4个 (LRADC采样) |
| **接口** | I²C×1, UART×2, SPI×1, GPIO×3, ADC×1 |

## 最新版本

**当前版本：Ver.0.4**

### 相比上一版本的改进

- [x] SOC F1C100S → F1C200S (内存翻倍)
- [x] 增加屏幕支持，可在2种屏幕间自由选择
- [x] 增加SD卡槽

## 加入社区

<div class="community-links">

**QQ交流群**

- 1群：1033668603
- 2群：1072955003

[点击加入QQ群](https://qm.qq.com/q/anjgWYaYdG)

</div>
