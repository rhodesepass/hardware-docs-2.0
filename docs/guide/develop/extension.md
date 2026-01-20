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