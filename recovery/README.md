# 历史恢复工具

这些是本次恢复使用的自编脚本，保留用于代码追溯。日常开发请直接导入仓库根目录；这些脚本并非小程序运行依赖。

脚本通常以 recovery/ 为工作根目录，并按原恢复过程读取 packages/、unpacked/、recovered-code/ 等输入或中间目录。这些原始运行包、临时副本和第三方依赖缓存不纳入本仓库。

工具依赖见 tool-dependencies/package.json。模板对照工具还使用 Cheerio，原调用路径指向历史 wxappUnpacker 本地依赖目录；此历史依赖布局未打包上传。原工具参考项目为 https://github.com/qwerty472123/wxappUnpacker 和 https://github.com/BlackTrace/pc_wxapkg_decrypt。

refresh-recovery.cjs 需通过 WECHAT_PACKAGE_CACHE 指定自己电脑的已发布小程序包缓存目录。fetch-sourcemap.cjs 如需使用，需通过 WECHAT_CI_PRIVATE_KEY_PATH 指定本地上传私钥，私钥本身不进入仓库；历史恢复中该请求未能取回 source map，因为上传与下载需要匹配原 CI 机器人。
