# 拓展能力

电子通行证本质上是伪装成明日方舟周边的带屏开发板。底部带有两个2x5p排母，引出了部分常用接口（UART/SPI/I2C/I2S/GPIO）。可以用于拓展其他功能。

大多数拓展脚默认功能为GPIO。如果需要配置为其他功能，需要使用“系统底层设置srgn_config"工具。


## 使用srgn_config

srgn_config 是一个类似 raspi-config 的 TUI 配置工具，用来修改 /boot/uEnv.txt 里的两行：interface=（接口配置）和 ext=（拓展功能），它们都是用空格分隔的 token 列表。U-boot根据uEnv.txt文件中的配置修补设备树，实现功能定制的效果。

:::: warning 如果你是通过ssh等方式接入系统
需要先挂载boot分区，再执行srgn_config
```sh
mount_boot
srgn_config
```
::::

srgn_config的界面如下：

![srgn_config](/images/srgn_config.png)

:::: warning 
修改需要在主页手动保存 然后重启系统才能生效
::::

你可以在srgn_config的菜单里选择：

* “Configure interfaces (interface)” 配接口
* “Configure extensions (ext)” 配拓展
* “Save changes” 写回 uEnv.txt（提示会说明需要重启生效）

### 可用的接口（interface）

* adc_pa123 :将PA1/PA2/PA3用作ADC引脚
* adc_pa1 :将PA1用作ADC引脚
* i2c0.dts：启动I2C0，并将PD0 PD12作为I2C引脚
* i2s0_pa :启动I2S0，并将PA1/PA2/PA3/PE3用作I2S引脚。
  * 0.5及以上才可使用
  * 与i2s_pe互斥
* i2s0_pe :启动I2S0，并将PA1/PE5/PE6/PE3用作I2S引脚。
  * 0.5及以上才可使用
  * 与i2s_pa互斥
* spi1 :启动SPI1，并将PE7/PE8/PE9/PE10用作SPI引脚。
* uart1 :启动UART1，并将PA2/PA3用作UART1引脚
* uart2 :启动UART2，并将PA7/PA8用作UART2引脚
* usbhost :将USB模式设置为USB Host
* usbhs :启动USB2.0 High-Speed模式

### 可用的拓展（ext）
* cardkb :支持M5Stack CardKB。需要使能i2c0
* lsm6ds3_pre0.4 :支持0.4及以前的板载IMU，需要使能i2c0，0.4及以上才可使用


## 接口定义

:::: warning PA引脚
PA引脚目前好像有bug，暂且待查，建议先用别的IO。
::::

请见[电子通行证外部接口.xlsx](https://oplst.iccmc.cc/%E7%94%B5%E5%AD%90%E9%80%9A%E8%A1%8C%E8%AF%81%E5%A4%96%E9%83%A8%E6%8E%A5%E5%8F%A3.xlsx)

### 0.3/0.4 接口定义

![V0.3V0.4](/images/ext_v0.3_v0.4.png)

### 0.5及以上 接口定义

![V0.5](/images/ext_v0.5.png)

## 使用GPIO功能

你可以通过gpioset/gpioget命令来读写GPIO引脚。

比如 若想读取PE6引脚上的电平，根据接口定义PE6对应编号134，可以执行：
```sh
gpioget gpiochip0 134
```

若想将PE6引脚设置为高电平，可以执行：
```sh
gpioset -m wait gpiochip0 134=1
```

在程序中可以使用libgpiod库来读写GPIO引脚。

## 使用i2c功能

要在扩展口上使用 I2C，你需要先在 `srgn_config` 里启用 `i2c0.dts`（interface），保存并重启后生效。启用后系统会出现 I2C 设备节点（例如 `/dev/i2c-0`）。

### i2c-tools 常用命令

列出总线信息：

```sh
i2cdetect -l
```

#### 扫描设备地址（i2cdetect）
以 `i2c-0` 为例，扫描 7-bit 地址空间：

```sh
i2cdetect -y 0
```

表格里出现：
- `UU`：通常表示该地址已被内核驱动占用（设备已绑定驱动）。
- 十六进制地址（如 `68`）：表示探测到设备响应。

::: warning 注意
I2C 扫描会对总线发探测请求。一般调试没问题，但极少数设备在“全地址扫描”下可能表现异常；更稳妥的方式是直接对目标地址做读写验证。
:::

#### 读取寄存器（i2cget）
示例：读取设备地址 `0x68` 的寄存器 `0x0f`：

```sh
i2cget -y 0 0x68 0x0f
```

#### 写入寄存器（i2cset）
示例：向设备 `0x68` 的寄存器 `0x10` 写入 `0x01`：

```sh
i2cset -y 0 0x68 0x10 0x01
```

::: warning 注意
`i2cset` 会直接改寄存器/配置，写错可能导致设备进入异常模式（例如休眠/复位/改变地址）。不确定时先只读验证。
:::

#### 导出寄存器表（i2cdump）
用途：快速确认设备响应、对比上电前后配置变化。

```sh
i2cdump -y 0 0x68
```

如果读出来全是 `XX`，常见原因是：总线号不对、连线/供电问题、器件不支持这种读取方式、或该地址被驱动占用导致访问失败。

## 使用uart功能

要在扩展口上使用 UART，你需要先在 `srgn_config` 里启用 `uart1` 或 `uart2`（interface），保存并重启后生效。启用后系统会出现串口设备节点（如 `/dev/ttyS1`、`/dev/ttyS2`）。

### 使用 minicom
先确认 `minicom` 是否存在：

```sh
which minicom || echo "minicom not found"
```

#### 快速打开（115200 8N1 示例）
波特率按你的外设/模块实际配置：

```sh
minicom -D /dev/ttyS1 -b 115200
```

常用快捷键：
- `Ctrl+A` 然后按 `X`：退出
- `Ctrl+A` 然后按 `Z`：帮助

#### 进入配置菜单（关流控/保存配置）

```sh
minicom -s
```

建议检查：
- **Serial port setup**：设备文件、波特率是否正确
- **Hardware Flow Control**：No
- **Software Flow Control**：No

#### 抓日志到文件
在 minicom 里按 `Ctrl+A` 再按 `L`，按提示选择保存路径即可开始/停止捕获日志。

:::: warning 注意
/dev/ttyS1 这个1说的是第二个出现的uart的意思。

单独启动了uart1/uart2功能，那么uart1/uart2的设备文件都是/dev/ttyS1

如果同时启动了uart1和uart2功能，那么uart1的设备文件是/dev/ttyS1，uart2的设备文件是/dev/ttyS2
::::

## 编程使用拓展能力

请参考[c语言二次开发示例](https://github.com/rhodesepass/c_example)