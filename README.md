# ChestnutCat

右下角的板栗猫娘桌宠。形象来自家猫板栗的照片，交互参考 [dsh-whale-widget-plus](https://github.com/louke6572/dsh-whale-widget-plus)（MIT）：点、连点、悬停、失落、揉头、台词和菜单。

## 预览

不要直接双击 HTML。在仓库根目录：

```bash
python -m http.server 4173
```

打开 http://127.0.0.1:4173/web/

- 点击：随机台词
- 1.2 秒内连点 5 次：生气
- 悬停约 8 秒：害羞
- 2 分钟不理：失落
- 按住：揉头 + 压扁
- 拖到左半边：水平翻转
- 右上角菜单：大小、锁定表情、自定义台词、音效

## 表情贴图

`assets/expr/` 对齐鲸鱼挂件第一版：

idle、angry、shy、disappointed、exhausted、stroking、close_eyes、half_closed_eyes、ok、sad、quiet、cheer、fatfish、mock、what、scared、greet、thumbsup

照片只用于生成角色，不会出现在桌宠画面里。

## 致谢

- 交互与音效思路来自 [louke6572/dsh-whale-widget-plus](https://github.com/louke6572/dsh-whale-widget-plus)
- 按压缩放音效来自该仓库 `Ya1.mp3` / `Ya2.mp3`

## 许可证

MIT
