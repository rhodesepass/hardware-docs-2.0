# 接入通行证Shell

当你编译好程序后，虽然可以直接通过MTP把程序拷进去，然后用主页的文件功能运行，但这样比较麻烦，而且不能实时调试，看日志什么的。最好还是要接入通行证的Shell。这里介绍几种接入Shell的方式。

通行证的用户名是root 密码为toor

## 你应该选哪一种接入方式？

- **USB 转串口（UART0）**：最推荐做底层调试。能看**开机全量日志**、能进 **U-Boot**、系统起来后还能把 USB 保持在 MTP 方便传文件。
- **USB Shell（串口模拟）**：最省事。适合“只想快速进 shell 看一下”。缺点是一般**不能同时传文件**。
- **RNDIS（USB 网卡）+ SSH**：最适合开发迭代。能 **SSH + SCP/WinSCP 传文件**，但 Windows 驱动/网络配置步骤更多。

## 通过USB转串口接入Shell

你需要一个USB转串口工具，比如CH340，CP2102等。

:::: warning 注意
请把串口调试工具的电平设成3.3V再接
::::

按[接口定义](/guide/develop/extension#接口定义)将USB转串口的TX接入UART0RX，RX接入UART0TX，GND连接GND。

### 串口参数
一般使用下面的串口参数（如遇到输出乱码，再按“常见问题”排查）：

- **波特率**：115200
- **数据位**：8
- **校验位**：None
- **停止位**：1
- **流控**：None（关闭硬件/软件流控）

### Windows（PuTTY / MobaXterm）
1. 把 USB 转串口插到电脑，打开 **设备管理器** → **端口（COM 和 LPT）**，确认出现对应的 COM 号（例如 `COM6`）。
2. 打开 PuTTY：
   - Connection type 选 **Serial**
   - Serial line 填你的 `COMx`
   - Speed 填 `115200`
   - 点击 Open
3. 看到启动日志后，系统起来会出现登录提示；输入用户名 `root`，密码 `toor`。

### Linux / WSL（minicom / screen）
设备名通常形如 `/dev/ttyUSB0` 或 `/dev/ttyACM0`：

```bash
sudo minicom -D /dev/ttyUSB0 -b 115200
```

或：

```bash
sudo screen /dev/ttyUSB0 115200
```

### 与 U-Boot 交互（可选）
看到倒计时（或提示）时按任意键即可打断进入 U-Boot；常用命令例如 `printenv`、`setenv`、`saveenv`、`boot` 等。


## 通过通行证USB Shell（串口模拟）模式接入Shell

通过设置->USB模式 设置为 Shell(串口)

### Windows（PuTTY）
1. 连接通行证后，Windows 会新增一个串口设备（通常也是 `COMx`）。如果没出现，先在设备管理器里确认是否有“未知设备/USB 串行设备”。
2. 用 PuTTY 以 **Serial** 方式连接该 `COMx`，参数建议先用 `115200 8N1`、Flow control 选 **None**。
3. 登录：用户名 `root`，密码 `toor`。

::: warning 提醒
这个模式通常占用了 USB 通道，因此**不适合同时传文件**。要传文件建议切到 RNDIS（SSH/SCP）或保持 USB 在 MTP。
:::

## 通过RNDIS USB网络，并通过ssh接入shell

通过设置->USB模式 设置为 网络(rndis)。在电脑的设备管理器中的“其他设备”里会出现一个RNDIS：
![devmgmt_rndis.png](/images/devmgmt_rndis.png)
右键选更新驱动程序 → 浏览我的电脑 → 从我电脑上的可用驱动程序列表中选取 → 选择“显示所有设备”，厂商选 **Microsoft**，型号选 **远程 NDIS 兼容设备**，按确认安装。

打开网络适配器设置，应该能看到一个新的以太网设备：

![network_interface.png](/images/network_interface.png)

右键->属性，点击Internet协议版本4，点击属性，使用下面的IP地址
```
IP地址：192.168.137.1
子网掩码：255.255.255.0
```
确认关闭。

### 验证链路是否通
1. 在电脑上对 `192.168.137.2` 执行 ping（能通说明链路基本 OK）：

```powershell
ping 192.168.137.2
```

2. 如果 ping 不通，优先按下面“常见问题”排查：RNDIS 驱动、IP 是否设置在同一网段、防火墙是否拦截等。

### 用 SSH 连接（推荐使用系统自带 OpenSSH 或 PuTTY）
- **Windows OpenSSH（PowerShell）**：

```powershell
ssh root@192.168.137.2
```

- **PuTTY**：Host Name 填 `192.168.137.2`，Connection type 选 **SSH**，端口默认 `22`。

用户名 `root`，密码 `toor`。

### 通过 SCP / WinSCP 传文件
- **SCP（PowerShell / Git Bash）**：

```powershell
scp -O .\your_file root@192.168.137.2:/root/
```

- **WinSCP**：
  - File protocol 选 **SCP**
  - Host name：`192.168.137.2`
  - User name：`root`
  - Password：`toor`

::: tip 小技巧
如果你需要频繁部署，可把编译产物传到固定目录（例如 `/root/` 或你项目的工作目录），并写一个简单脚本在通行证端完成覆盖与重启/运行。
:::

## 常用日志与排查命令（进了 Shell 以后）

下面命令不一定所有固件都具备，但大多数 Linux 系统都会有其中一部分。你可以先试最常用的几个：

### 系统日志
- **查看内核日志**：

```sh
dmesg -T | tail -n 200
```

- **持续跟踪内核日志**：

```sh
dmesg -w
```


### 进程与资源

```sh
ps aux | head
top
free -h
df -h
```

### 网络状态（RNDIS/SSH 相关）

```sh
ip a
ip r
ping -c 3 192.168.137.1
```

## 常见问题（快速排查清单）

### 串口看不到输出 / 没反应
可能原因通常是“线没接对 / 流控没关 / 选错 COM / 电平错误”。建议按顺序排查：

1. **TX/RX 是否交叉**：USB 转串口 **TX → UART0RX**，**RX → UART0TX**，GND 必须接。
2. **电平是否 3.3V**：如果用了 5V 可能会导致异常甚至损坏（务必确认）。

### 串口输出乱码
1. 先确认 **波特率** 是否正确（最常见）。
2. 确认 **8N1** 与 **无流控**。
3. 仍不行再考虑接线松动、GND 未共地、转串口质量/驱动问题。

### RNDIS 网卡没出现 / 驱动装不上
1. 确认通行证已切到 **网络(rndis)** 模式。
2. 设备管理器里如果在“其他设备”出现未知 RNDIS，按文档手动选 **Microsoft → 远程 NDIS 兼容设备**。
3. 重新插拔 USB，必要时换 USB 口/线（部分线只充电不传数据）。

### 能看到 RNDIS 网卡但 ping 不通 192.168.137.2
1. 确认电脑端 IPv4 静态地址已设为：`192.168.137.1/255.255.255.0`。
2. 确认没有把 IP 配在别的网段（例如 `192.168.0.x`）。
3. 测试阶段可暂时关闭或放行 Windows 防火墙对该网卡的 ICMP/SSH。
4. 用串口进系统后执行 `ip a`，确认设备端 IP 是否确实为 `192.168.137.2`。
