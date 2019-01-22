# D2M
一个 electron 开发的数据结构管理工具

<br><br>

# 项目简介
首先向开源致敬，这个项目的完成，离不开开源给予启发与参考<br><br>
除了一众项目依赖库，不得不提的是 pdman（pdman码云地址：https://gitee.com/robergroup/pdman）<br><br>
这个项目直接借鉴了 pdman，通过分析其功能，阅读其源码，从而对该项目的技术栈有了一定了解后，再根据公司内部的需求与技术资源才开发出了 D2M<br><br>
从功能上看，D2M 和 pdman 几乎一模一样，但是由于 pdman 有部分功能并未开源，所以没能移植过来<br><br>
甚至一些核心脚本，也是直接从 pdman 上搬过来的<br><br>
但是操作界面，和业务实现却是完全重新写了一遍，pdman 是以 react 作为业务实现主框架，而 D2M 则是以 vue 作为 业务实现主框架<br><br>
操作界面也是截然不同，D2M 的操作界面是借鉴了 Webstorm 而来的<br><br>
也正因如此，我给了这个项目一个新的名字 —— D2M<br><br>
看到这里，可能有人不禁吐槽，这个项目山寨成分未免太过<br><br>
这里只能坦然接受这般评价，毕竟这个项目的开发者只有一人，很多东西如果不用拿来主义得之，成本太高，怕时日一长，项目胎死腹中<br><br>

<br><br>

# 项目说明
首先在项目根目录执行
```
npm install
```
安装项目依赖包<br><br><br>

然后下面是一些常用命令及其说明：
```
npm run dev
```
运行开发模式客户端<br><br>

```
npm run package-win
```
windows 平台客户端打包<br><br>

```
npm run package-linux
```
linux 平台客户端打包<br><br>

```
npm run package-mac
```
mac 平台客户端打包<br><br>
