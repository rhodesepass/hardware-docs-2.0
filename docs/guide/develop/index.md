# 开发概述

本章节介绍开发相关内容，包括开发环境搭建和开发流程。

本项目采用了“全集成Buildroot”，编译所需的工具链、内核、U-boot、根文件系统，都从同一个buildroot中编译出来。

因此，无论是修改系统固件还是开发新软件，都需要拉取buildroot环境。

## 开发相关链接：

- **软件仓库**：[电子通行证播放器程序 neo版本](https://github.com/rhodesepass/drm_app_neo)
- **Buildroot**: [GitHub - rhodesepass/buildroot](https://github.com/rhodesepass/buildroot)

## 开发环境

作者使用的开发系统为：Ubuntu 24.04。文档中的指令也将以该系统为准。

## 章节导航

| 章节 | 说明 |
| --- | --- |
| [开发环境搭建](./env_setup.md) | 如何搭建开发环境 |
| [定制ioctl文档](./custom_ioctl.md) | 电子通行证中使用的定制ioctl的说明文档 |

## 下一步

前往 [开发环境搭建](./env_setup.md) 了解搭建开发环境步骤。
