# 设备树中的功能开关

为了兼容各种版本，且兼容多种屏幕选项，我们改造了部分驱动，在设备树中进行了一些功能开关。

目前是使用dtoverlay来修补。

## srgn,swap-b-r

位置：&tcon0

类型：bool

这个开关用于使能f1c内置的RGB转BGR功能。

因为Layout的关系，通用ST7701屏幕的顺序是RGB，而老五屏幕是BGR，若使用老五屏幕则需要添加这个属性

### 示例用法

```dts
&tcon0 {
	pinctrl-names = "default";
	pinctrl-0 = <&lcd_rgb565_no_de_pins>;
	status = "okay";
    srgn,swap-b-r;
};
```

## srgn,usb-hs-enabled;

位置：&usb_otg

类型：bool

这个开关用于使能f1c内置musb-hdrc的usb 2.0功能。因为0.6之前的USB走线质量都比较差，可能无法稳定运行USB2.0信号，对于这部分用户，可以通过这个开关来禁用USB2.0功能。

### 示例用法

```dts
&usb_otg {
	dr_mode = "otg"; /* otg host peripheral */
	status = "okay";
	srgn,usb-hs-enabled;
};
```

## st7701initseq

位置：/

这个是为了初始化st7701屏幕而单独写的一个驱动。文件位于driver/staging/shirogane下。

因为目前兼容了多个屏幕，不同屏幕之间可能有不同的初始化序列（如：瀚彩与京东方），所以需要在设备树进行修改

此外 不同硬件版本的sda/scl/cs引脚可能不同，需要根据实际情况进行修改

### 属性说明

* compatible: 驱动兼容属性，必须为"lattland,st7701-initseq"（*我知道拉特兰其实是laterano*）
* sda-gpios: sda引脚，需要根据实际情况进行修改
* scl-gpios: scl引脚，需要根据实际情况进行修改
* cs-gpios: cs引脚，需要根据实际情况进行修改
* init-sequence: 初始化序列。类似ArduinoGFX格式，包括以下操作：
  * ST7701INIT_BEGIN_WRITE: 开始写入 (CS拉低)
  * ST7701INIT_END_WRITE: 结束写入 （CS拉高）
  * ST7701INIT_WRITE_COMMAND_8 (command) : 写入8位命令
  * ST7701INIT_WRITE_BYTES (count) (data0) (data1) .... : 写入count个字节的数据
  * ST7701INIT_WRITE_C8_D8 (command) (data) : 写入8位命令和8位数据
  * ST7701INIT_WRITE_C8_D16 (command) (data0) (data1) : 写入8位命令和2个8位数据
  * ST7701INIT_DELAY (delay_ms)：延时delay_ms毫秒

> 上述操作符号位于dt-bindings/display/st7701initseq.h中。需要在dts内include这个文件

### 示例用法
``` dts
st7701initseq: st7701initseq {
    compatible = "lattland,st7701-initseq";
    status = "okay";
    sda-gpios = <&pio 4 4 GPIO_ACTIVE_HIGH>; /* PE4 */
    scl-gpios = <&pio 3 19 GPIO_ACTIVE_HIGH>; /* PD19 */
    cs-gpios = <&pio 4 3 GPIO_ACTIVE_HIGH>; /* PE3 */

    init-sequence = <
        ST7701INIT_BEGIN_WRITE

        ST7701INIT_WRITE_COMMAND_8 0xFF 
        ST7701INIT_WRITE_BYTES 5 0x77 0x01 0x00 0x00 0x13 

        ......
    >;
};
```