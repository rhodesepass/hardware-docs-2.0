# 第一个应用程序

本章节将介绍如何开发一个能在通行证中运行的应用程序。

通行证本质上就是一个arm926ejs处理器的linux开发板，程序的开发也和常规的Linux嵌入式开发没有太多的区别。这里介绍一下如何在我们的环境中快速拉起编译。

开始本章节前，你需要先[搭建好开发环境](./env_setup.md)，并完成一次Buildroot的构建。

::: details

我们的Buildroot SDK默认只开启了C/C++的编译支持，编译基础的程序，并自带有一些库。如果你有别的软件/语言/库需求，可以打开Buildroot的配置:

```bash
make menuconfig
```

在Target packages 中勾选你需要的软件，然后进行一次构建即可。
:::

## 配置交叉编译环境变量

Buildroot中默认编译了 host environment-setup脚本，使用这个脚本可以一键快速导出所需的环境变量。在Buildroot目录中运行：
```bash
source output/host/environment-setup
```

你会看到如下提示：
```
shirogane@pwn:~/Desktop/liulianpai/buildroot-tiny200$ source output/host/environment-setup
 _           _ _     _                 _
| |__  _   _(_) | __| |_ __ ___   ___ | |_
| '_ \| | | | | |/ _` | '__/ _ \ / _ \| __|
| |_) | |_| | | | (_| | | | (_) | (_) | |_
|_.__/ \__,_|_|_|\__,_|_|  \___/ \___/ \__|

       Making embedded Linux easy!

Some tips:
* PATH now contains the SDK utilities
* Standard autotools variables (CC, LD, CFLAGS) are exported
* Kernel compilation variables (ARCH, CROSS_COMPILE, KERNELDIR) are exported
* To configure do "./configure $CONFIGURE_FLAGS" or use
  the "configure" alias
* To build CMake-based projects, use the "cmake" alias
```

环境变量就导出完成了。可以通过指令查询gcc版本，以确定确实导出成功：

```bash
arm-buildroot-linux-gnueabi-gcc -v
```

样例输出为：
```
Using built-in specs.
COLLECT_GCC=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/bin/arm-buildroot-linux-gnueabi-gcc.br_real
COLLECT_LTO_WRAPPER=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/libexec/gcc/arm-buildroot-linux-gnueabi/8.4.0/lto-wrapper
Target: arm-buildroot-linux-gnueabi
Configured with: ./configure --prefix=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host --sysconfdir=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/etc --enable-static --target=arm-buildroot-linux-gnueabi --with-sysroot=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/arm-buildroot-linux-gnueabi/sysroot --enable-__cxa_atexit --with-gnu-ld --disable-libssp --disable-multilib --disable-decimal-float --with-gmp=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host --with-mpc=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host --with-mpfr=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host --with-pkgversion='Buildroot -g672cc14-dirty' --with-bugurl=http://bugs.buildroot.net/ --disable-libquadmath --enable-tls --enable-plugins --enable-lto --enable-threads --without-isl --without-cloog --with-float=soft --with-abi=aapcs-linux --with-cpu=arm926ej-s --with-float=soft --with-mode=arm --enable-languages=c,c++ --with-build-time-tools=/home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/arm-buildroot-linux-gnueabi/bin --enable-shared --disable-libgomp
Thread model: posix
gcc version 8.4.0 (Buildroot -g672cc14-dirty)
```

## Hello World

可以先通过编写一个简单的Hello World程序，来验证一下交叉编译环境是否配置正确。

先新建一个文件夹，并新建一个hello_world.c文件，内容如下：

```c
#include <stdio.h>
int main() {
    printf("Hello World\n");
    return 0;
}
```

打开终端，进入你创建的文件夹，通过以下指令编译：

```bash
arm-buildroot-linux-gnueabi-gcc -o hello_world hello_world.c
```

将程序复制到通行证的app目录下，使用串口调试工具打开通行证的终端，使用用户名:root 密码:toor 登录。

然后给hello_world赋予执行权限，并执行：

```
Welcome to Rhodes Island Electronic Pass
epass login: root
Password:
Welcome to Rhodes Island Pass Debug Shell!
You are in Terminal /dev/ttyS0.
# chmod +x hello_world
# ./hello_world
Hello World
#
```

> 提示:
> 1. 带有#号的是终端提示符，这一行代表你的输入。
> 2. 输入密码的时候不会有反应，直接输入完按回车就可以了。

如果你能看到Hello World的输出，说明你的程序已经成功运行了。

## 使用CMake构建系统

当你的程序比较复杂(涉及到多个文件)时，使用CMake构建系统会非常方便。

cmake的一般组织方式是：

```
项目目录
├── CMakeLists.txt # 构建配置文件
├── src  # 源代码目录
│   └── main.c
|   └── ...
├── build # 构建目录
│   └── ...
```

假设我们现在要编写一个多文件的程序，包括main.c,hello.c,hello.h，内容如下:

main.c:

```c
#include "hello.h"
int main() {
    hello();
    return 0;
}
```

hello.c:
```c
#include "hello.h"
#include <stdio.h>
void hello() {
    printf("Hello World\n");
}
```

hello.h:
```c
#ifndef HELLO_H
#define HELLO_H
void hello();
#endif
```

由main.c调用hello.c中的hello函数，打印出一条hello world消息。

我们先新建源码目录src，然后将这些代码分别放入src目录下。

```bash
mkdir src
nano src/main.c # 输入main.c内容
nano src/hello.c # 输入hello.c内容
nano src/hello.h # 输入hello.h内容
```

然后新建CMakeLists.txt文件，这里提供一个模板，如下：

```cmake
cmake_minimum_required(VERSION 3.10)
project(hellocmake)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

# 在下面添加源代码文件，一行一个
add_executable(hellocmake
  src/main.c
  src/hello.c
)

# 在下面添加头文件目录，一行一个
target_include_directories(hellocmake PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/src
)

```

保存文件。然后创建build构建目录，进入开始编译：

::: warning
每次打开一个新的终端后，都需要重新导出环境变量。否则交叉编译不会生效，你会编译出你开发机的可执行程序，而不是通行证的。

请参考上方的[配置交叉编译环境变量](#配置交叉编译环境变量)。
:::

```bash
mkdir build
cd build
cmake ..
make -j$(nproc)
```

样例输出：

```
shirogane@pwn:~/Desktop/liulianpai/first_app$ mkdir build
shirogane@pwn:~/Desktop/liulianpai/first_app$ cd build
shirogane@pwn:~/Desktop/liulianpai/first_app/build$ cmake ..
-- The C compiler identification is GNU 8.4.0
-- The CXX compiler identification is GNU 8.4.0
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Check for working C compiler: /home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/bin/arm-buildroot-linux-gnueabi-gcc - skipped
-- Detecting C compile features
-- Detecting C compile features - done
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /home/shirogane/Desktop/liulianpai/buildroot-tiny200/output/host/bin/arm-buildroot-linux-gnueabi-g++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Configuring done (0.9s)
-- Generating done (0.0s)
-- Build files have been written to: /home/shirogane/Desktop/liulianpai/first_app/build
shirogane@pwn:~/Desktop/liulianpai/first_app/build$ make -j$(nproc)
[ 66%] Building C object CMakeFiles/hellocmake.dir/src/main.c.o
[ 66%] Building C object CMakeFiles/hellocmake.dir/src/hello.c.o
[100%] Linking C executable hellocmake
[100%] Built target hellocmake
shirogane@pwn:~/Desktop/liulianpai/first_app/build$
```

build目录下会出现一个hellocmake文件，此文件就是编译出的可执行程序。

当你的项目文件增加时，只需要编辑CMakelists.txt文件，添加新的源代码文件和头文件目录，然后重新执行make命令即可。