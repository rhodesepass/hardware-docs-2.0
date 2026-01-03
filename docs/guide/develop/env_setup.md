---
title: 开发环境搭建（Ubuntu 24.04）
---

# 开发环境搭建（Ubuntu 24.04）

本页面会带你从 0 开始搭建 **Buildroot 构建环境**，并完成本项目固件的构建与刷写。

文档中的命令与流程 **仅在 Ubuntu 24.04 LTS** 验证通过；如果你使用的是其他发行版/版本，依赖包名字或行为可能会有差异，需要你自行调整。

:::: info 推荐阅读方式
如果你是第一次接触 Buildroot/交叉编译，建议按页面顺序从上到下执行；不要跳着跑命令。
::::

## 0. 在虚拟机中安装 Ubuntu 24.04

本节只做“能装好能用”的最短路径，详细安装体验项（双屏/共享文件夹等）放在后续“安装后必做项”。

### 0.1 下载 Ubuntu 24.04 ISO

打开中科大镜像源：[https://mirrors.ustc.edu.cn/](https://mirrors.ustc.edu.cn/)，点击右边的“获取安装镜像 >”，选择Ubuntu对应版本下载。

> 提示：若没有开发过的话，请下载 **Desktop** 版本的 **amd64** ISO（VMware 在普通 PC 上基本都是 amd64）。

### 0.2 创建虚拟机（建议配置）

建议至少：

- CPU：2 核（推荐 4 核）
- 内存：4 GB（推荐 8 GB）
- 磁盘：40 GB（推荐 60 GB+，编译产物会比较吃空间）
- 网络：NAT（通常最省心）

VMware Workstation 里创建虚拟机时可以按下面做：

1. 选择“创建新的虚拟机”
2. 选择“典型(推荐)”即可
3. 安装来源选择“安装程序光盘映像文件(iso)”并选中你下载的 Ubuntu ISO
4. 客户机操作系统：Linux / Ubuntu 64 位
5. 最后在“自定义硬件”里把 CPU/内存/磁盘调到上面的推荐值

### 0.3 安装 Ubuntu（要点）

在 VMware 新建虚拟机时选择 ISO 启动，按安装向导完成即可。

:::: warning 注意
安装类型里“清除磁盘并安装 Ubuntu”只会影响虚拟机的虚拟硬盘，不会格式化你的 Windows 真实磁盘，但仍建议你确认选中的是虚拟磁盘。
::::

## 1. Ubuntu 安装后必做项

### 1.1 更新系统

进入 Ubuntu 桌面后，打开终端执行：

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 安装 VMware Tools（可选但强烈建议）

安装后可以获得更好的体验（分辨率自适应、剪贴板更顺滑等）：

```bash
sudo apt install -y open-vm-tools open-vm-tools-desktop
```

重启一次更稳妥：

```bash
sudo reboot
```

## 2. 安装构建依赖（Ubuntu 24.04）

Buildroot 的 Host 依赖比较多，下面这套在 Ubuntu 24.04 上通常够用（偏保守，宁可多装一点点工具）：

```bash
sudo apt update
sudo apt install -y \
  build-essential git wget unzip \
  bc swig \
  rsync cpio file \
  flex bison \
  libncurses-dev libssl-dev libelf-dev \
  libpython3-dev \
  fakeroot \
  mtd-utils \
  python3 python3-venv python3-pip python3-setuptools
```

:::: warning 关于 `python3-distutils`
你可能会在旧教程里看到 `python3-distutils`，但在 Ubuntu 24.04（Python 3.12）上这包**可能不存在**。  
如果你执行 `apt install python3-distutils` 时提示“Unable to locate package”，请不要纠结，保持安装 `python3-setuptools` 即可；后续如遇到 Python 相关报错，再按报错信息补包会更可靠。
::::

## 3. 获取源码（buildroot-epass）

克隆仓库：

```bash
git clone https://github.com/rhodesepass/buildroot
```

仓库内有符号链接，请一定要使用clone方法获取仓库，不能下载zip。

## 4. 应用 defconfig（重要）

进入仓库并应用 defconfig：

```bash
cd buildroot-epass
make rhodesisland_epass_defconfig
```

:::: warning 强提醒：defconfig 会覆盖你之前的配置
应用 defconfig 会把 `.config` 覆盖为项目预设配置，等价于“重新从模板生成一份配置”。  
一般来说你只需要在**第一次构建前**执行一次；如果你已经做过自己的配置改动，请在执行前自行备份 `.config`。
::::

## 5. 开始构建

开始构建（第一次会比较久，取决于网络与 CPU）：

```bash
make -j"$(nproc)"
```

构建结果在：

- `output/images/`

其中通常会包含：

- `flash_pack_xxxx.zip`：带 Windows 刷机工具的更新包（可直接交付/分发）

:::: info 小提示（省时间）
如果中途网络波动导致下载失败，重新执行 `make -j"$(nproc)"` 一般会自动继续。
::::

## 6. 重新构建（增量编译入口）

如果你只修改了某一部分（比如 kernel 或 u-boot），不想全量 `make`，可以使用仓库提供的脚本进行增量重建。

### 6.1 重新构建内核及设备树

```bash
cd buildroot-epass
./rebuild-kernel.sh
```

### 6.2 重新构建 U-Boot

```bash
cd buildroot-epass
./rebuild-uboot.sh
```

:::: info 如果脚本提示没有执行权限
你可以先给脚本加执行权限：

```bash
chmod +x rebuild-kernel.sh rebuild-uboot.sh flashsystem.sh
```
::::

## 7. 直接烧录系统到设备

你可以在 Ubuntu 下直接把系统烧录进设备。

### 7.1 前置条件：先安装 XFEL

`./flashsystem.sh` 需要 **XFEL（Allwinner FEL 工具）**。请见：[https://github.com/xboot/xfel](https://github.com/xboot/xfel)
安装方法为：
```bash
git clone https://github.com/xboot/xfel
cd xfel
make
sudo make install
```

### 7.2 执行烧录

```bash
# 烧录设备树
./flashsystem.sh dt
# 烧录内核
./flashsystem.sh linux
# 烧录文件系统
./flashsystem.sh rootfs
# 烧录uboot
./flashsystem.sh uboot
```

:::: warning 权限与连接问题（常见）
- 如果脚本提示 USB 权限不足，可以尝试用 `sudo ./flashsystem.sh` 运行一次验证是否为权限问题。
- 设备识别不到时，先换线/换 USB 口，再检查 `lsusb` 是否能看到设备。
::::

## 8. 常见问题与注意事项

### 8.1 磁盘空间不够

编译/下载会占用较多空间，建议虚拟机磁盘至少 60GB，并确保宿主机磁盘也有余量。

### 8.2 依赖缺失导致构建失败

不同系统的包名可能不同。遇到报错时，优先从错误信息里找出缺失的命令/库，再用 `apt` 补齐即可。

### 8.3 构建时间很长

第一次构建会下载大量源码并编译，属于正常现象。提高虚拟机 CPU/内存配置、以及保持网络稳定，会明显加快进度。

如果网络过慢，请考虑使用科学方法。。或者下载源码包加快下载步骤。