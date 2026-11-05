# 上班鼓励器 Electron v0.7.3

Windows 桌面小组件。五主题、连续收入滚动、计时、心愿实物插图、金额门槛离线语音。

v0.7.3：紧凑窗口宽度从 404 缩至 320，展开仍为 404；按请求尺寸计算收起/展开位移，避免 Windows 分数缩放下重复切换累积偏移。

v0.7.2：金额整数部分最少三位，不足补零；两种金额样式共用格式，四位及以上自然扩展。

v0.7.1：紧凑窗口缩至 404 × 200，只保留倒计时、下班时间、今日金额和增长速度，提供独立展开按钮与拖动区域。

v0.7.0：机械显示模式新增时/分/秒三组轻量翻页钟。仅连续倒数一秒时为变化组播放翻页；首次显示、状态切换、时间跳变与减弱动效直接显示结果。下班/周末保留文字，原版数字模式同时恢复平面时间。五主题和紧凑布局已实测，计时计算和收入逻辑不变。

v0.6.0：新增 Windows x64 单文件便携封装。Electron 及运行资源完整内置，免安装、用户权限运行；正常退出清理临时解压目录，个人配置仍使用原目录。

v0.5.1：金额播报去掉重复心愿结尾，重新预录 10 段受影响音频。音频文件名按文案哈希生成，已有旧缓存不会被新版文案选中；默认仍离线播放。

v0.5.0：新增 `moneyStyle` 配置（`mechanical` / `classic`）。缺少该字段的旧配置默认使用机械滚轮；设置可预览、取消和保存。机械滚筒使用 CSS 3D 十面数字环，末位连续旋转、其余位在接近进位时转动；数字由现有计时计算驱动。五主题分别采用黄铜、香槟金、象牙白、柔粉和哑光深绿材质。

v0.4.0 已提供：五主题（新增命令行）、逐档离线试听、主动单档在线生成与缓存、14 类生成式透明 PNG。提示词保存在 `assets/wish-icons/generation.json`。默认 96% 窗口不透明度，可调节并保存；旧配置继续兼容。

## 开发与构建

Node.js 22.12+，Electron 固定 44.4.5。运行期只依赖 Electron，不依赖 Python、前端框架或服务器。

```powershell
npm ci
npm run setup
npm test
npm start
npm run build
```

Electron 44 的运行时需要显式安装；`setup` 调用官方安装脚本并校验发行文件。默认构建为 `../04-output/上班鼓励器-绿色单文件-v0.7.3-win-x64-【codex】.exe`；同版文件已存在时停止，不覆盖旧交付。`npm run build:folder` 可生成原来的目录版。构建中间目录位于项目 `Codex-Temp/portable-build-*`，用户仅需最终 EXE。

构建依赖 electron-builder 26.18.0，源码/图片/预录音频按白名单写入 ASAR；开发依赖、测试、个人设置及凭据不入包。`build-resources/icon.png` 从既有 `assets/app.svg` 等比例栅格化生成。`portable.unpackDirName: true` 在该版本实际生成每次启动独立的 `$PLUGINSDIR`；此版本的 false 分支会使用共用的构建 UUID，与文档描述不一致，升级打包器必须重测重复启动和清理。

## 结构

- `main.cjs`：单实例、窗口/托盘、有限 IPC、配置、金额门槛调度。
- `preload.cjs`：隔离桥接；渲染器无 Node、文件与任意网络权限。
- `lib/core.js`：计时、收入、心愿、金额触发与配置校验的纯逻辑。
- `lib/store.cjs`：原子保存、备份、损坏配置回退。
- `lib/speech.cjs`：百炼合成与 WAV 头规范化，只供明确的预录操作调用。
- `lib/voice-cache.cjs`：按模型、音色、文案哈希复用本地音频；金额触发只读取缓存。
- `ui/`：真实界面、五主题、逐帧数字滚轮和统一物件插图。
- `data/`：原包 403 条文案和 50 条心愿；另在逻辑中加入 5 条日常心愿。
- `assets/voice-cache/`：百炼实调生成的 12 段音频及非敏感清单，可离线分发。
- `electron-builder.cjs`、`tools/package-portable.cjs`：单文件配置、构建及交付哈希；显式禁止自动发布。
- `tests/`：计时、配置、金额触发、接口合同和缓存回归。

## 数据与语音

默认配置目录 `%APPDATA%/WorkCheerWidget/`。`config.json` 不含明文密钥；`voice-key.dat` 仅在用户点击保存密钥后写入，使用 Windows DPAPI 对应的 Electron safeStorage 加密。该保护不隔离同一 Windows 用户下的其他应用。

内置 Cherry（芊悦）音色，门槛为 10、50、100、200、500、1000、2000、5000、10000 元，另有试听、心愿 80% 和心愿达成音频。金额依据今日收入等值，实际计费规则在设置内注明。金额达标不联网；不同音色或门槛缺失音频时提示补录，不偷偷在线合成。用户可使用自己的百炼 Key 显式补录。

内置音频已提前生成，源码、交付包和默认用户配置不包含生成凭据。自行补录时请使用自己的百炼账户。

用户目录可放置 `wish_presets.json`、`encouragements.json` 覆盖内置资料，重启生效；格式无效时回退内置资料。自定义心愿和目标预算可直接在设置里维护。

## 验证边界

本轮面向 Windows x64。默认是本机实际日期，`--demo` 使用标记清晰的 2026-11-05 下午演示时钟，不自动播报、不改真实收入。测试可用 `CHEER_DATA_DIR` 指定隔离数据目录，`CHEER_NO_NETWORK=1` 禁止生成语音和参考估价请求。

金额从真实时间重新计算，动画帧不写入余额；不承诺毫秒级操作系统调度。参考估价是搜索页面的粗略提示，必须用户采纳后才写入预算。未签名的便携构建不包含自动更新与安装器。

## 官方接口依据

- [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage)
- [百炼 Qwen-TTS HTTP API](https://help.aliyun.com/zh/model-studio/qwen-tts-api)
- [百炼 Qwen-TTS 音色列表](https://help.aliyun.com/zh/model-studio/qwen-tts-voice-list)

接口依据核对日期：2026-11-05。预录模型 `qwen3-tts-flash`，音色 `Cherry`；声音喜好最终由用户试听判断。
