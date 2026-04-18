# 素材分类剪辑软件：当前可交付说明

## 项目位置
- 源码：`E:/codex/新建文件夹`
- 打包产物：`E:/codex/新建文件夹/release/win-unpacked`

## 当前已打通主链
1. 导入素材：支持传入目录/文件，扫描视频文件。
2. 素材分析：支持基于文件名生成标签，并通过 `ffprobe` 读取元信息、通过 `ffmpeg` 生成缩略图。
3. 素材入库：支持写入本地 SQLite。
4. 脚本生成：支持脚本拆句、候选素材排序、timeline 生成。
5. 版本编辑：支持在版本页替换片段素材。
6. 视频导出：支持导出 `rough-cut.mp4`。
7. 任务反馈：支持导入/生成/导出任务进度更新，并在前端轮询显示。
8. 桌面交付：支持生成 `素材分类剪辑软件.exe`，且已验证 EXE 可启动并保持存活。

## 当前运行状态补充
- `release/win-unpacked/resources/app.asar` 已存在，说明 renderer 与 Electron 主代码已被打入包内。
- 打包后的 `素材分类剪辑软件.exe` 已验证可启动，且进程不会立即退出。
- 当前桌面主链已验证到：导入素材 -> 入库分析 -> 生成 timeline -> 替换片段 -> 导出 rough-cut.mp4。

## 当前工程质量门
- `npm run lint` 通过
- `npm run test` 通过
- `npm run build` 通过
- `npm run build:electron` 通过

## 打包恢复建议
- 若 `release/win-unpacked` 被占用，先执行 `npm run release:unlock`
- 再执行 `npm run dist:fresh`

## 当前已知环境问题
1. 开发态 Electron CLI 运行仍需继续收口，当前已有 `dev:electron:debug` 调试脚本。
2. Windows 文件锁会导致重复打包失败，当前已提供 `release:unlock` 与 `dist:fresh` 作为恢复路径，但如果已有 Electron/runtime 进程持续占用 `release/win-unpacked`，仍会失败。
3. `screenshot-desktop` 在当前系统下依赖 `screenCapture_1.3.2.exe`，本机环境缺失该可执行文件，因此截图链当前属于环境阻塞，不影响主软件功能链。

## 当前推荐使用方式
- 开发：`npm run dev`
- 调试桌面：`npm run dev:electron:debug`
- 质量校验：`npm run lint && npm run test && npm run build && npm run build:electron`
- 打包：`npm run dist`
- 打包前释放占用：`npm run release:unlock`
- 重打包恢复：`npm run dist:fresh`
