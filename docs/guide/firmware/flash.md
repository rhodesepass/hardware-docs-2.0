# 固件烧录

本指南介绍如何将固件烧录到设备。

## 准备工作

### 所需工具

- USB 数据线（Type-C）
- 烧录软件（待补充）

### 所需文件

从 [Release](https://github.com/inapp123/epass_hardware/releases) 下载固件文件。

## 烧录步骤

::: info 待完善
此部分文档正在完善中，敬请期待...
:::

## 烧录问题排查

### 无法进入下载模式

如果烧录过程中中断，导致无法进入下载模式：

参考刷新教程：[BiliBili 视频教程](https://www.bilibili.com/video/BV1Xu28BDEjL/)（1分钟处）

### Flash 不识别

如果提示 `The spi nand flash '0x00000000' is not yet supported`：

检查 NAND 区域引脚是否虚焊，详见 [常见问题](../faq.md#_5-提示-the-spi-nand-flash-0x00000000-is-not-yet-supported)

## 烧录完成后

烧录完成后，请检查：

1. 屏幕是否正常显示
2. 按钮是否正常工作
3. USB 是否正常识别

如果遇到问题，请查看 [常见问题](../faq.md)。
