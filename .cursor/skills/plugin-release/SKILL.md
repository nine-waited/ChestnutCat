---
name: plugin-release
description: >-
  Package the Chestnut Cat plugin zip, write the bilingual changelog,
  commit/push, then create or replace a GitHub tag and (pre-)release with the
  zip. Use when the user says 出包, 打 zip, 发版, 出版本, release, tag, pre-release,
  插件包, or bump v1.x.0 for ChestnutCat.
---

# Chestnut Cat 插件发版

在 **ChestnutCat 仓库根目录**执行。对照上一版 changelog（如 `v1.0.0-CHANGELOG.md`）与 GitHub tag。

产物是给 Chestnut Editor **导入的 zip**，不是编辑器 NSIS 安装包。桌宠禁止打进 Chestnut Editor 安装包。

## 用户必须先确认

用 AskQuestion（或对话）确认，**不要默认**：

1. **版本号**（如 `1.0.0`）→ tag 为 `v1.0.0`，zip 为 `chestnut-cat-1.0.0.zip`
2. **GitHub 类型**：`pre-release` 或正式 `release`
3. 若该 tag **已存在**且用户要换包：走「替换已发布 zip」，不要另开新版本（除非用户要升号）

未指定类型时：`1.x` 用正式 release，`0.x` 用 pre-release。

## 流程清单

```
- [ ] 1. 升版本（manifest + package.json + README 里的 zip 文件名）
- [ ] 2. 写根目录 vX.Y.Z-CHANGELOG.md
- [ ] 3. python scripts/pack-plugin.py
- [ ] 4. 核对 zip：只有当前 expr/，不含 expr-v1；体积约 18–20 MB
- [ ] 5. commit（changelog + 版本号 + 打包脚本/skill）
- [ ] 6. push main（注意代理）
- [ ] 7. annotated tag 打在刚推送的发版 commit 上 → push tag
- [ ] 8. 系统 Edge + gh（设备码）登录 GitHub
- [ ] 9. 创建或替换 GitHub Release，上传 zip，用 API 核对字节数
```

## 1. 升版本

| 文件 | 字段 |
|------|------|
| `plugin/manifest.json` | `version` |
| `package.json` | `version` |
| `README.md` | `dist/chestnut-cat-X.Y.Z.zip` |

`scripts/pack-plugin.py` 从 `manifest.json` 读版本，输出 `dist/chestnut-cat-X.Y.Z.zip`。

## 2. 更新文档

新建 `vX.Y.Z-CHANGELOG.md`，对照最近一版（中文在前）：

- 标题：`# Chestnut Cat vX.Y.Z`
- **简体中文在前、English 在后**，用 `---` 分隔
- 一段简介：zip 导入到编辑器 `plugins/`，不进安装包、不写笔记库
- `### 下载` 表：zip 名、导入路径、需要的编辑器版本
- **构建产物**：`dist/chestnut-cat-X.Y.Z.zip`
- `### vX.Y.Z 新内容` / `### What's New`：用户能感知的变化，不要堆 commit hash
- `### 从 v{上一版} 升级`：重新导入 zip 即可

内容来源：`git log <上一发版 commit>..HEAD`。用「Release vX.Y.Z」那次 commit，或 `gh release view` 对上的 SHA。

## 3. 打 zip

```powershell
python scripts/pack-plugin.py
```

只打包：

- `manifest.json` / `main.js` / `widget.js` / `widget.css`
- `Ya1.mp3` / `Ya2.mp3`
- `assets/expr/*.png` → zip 内 `expr/`

**禁止**打进 zip：

- `assets/expr-v1/`（来时路归档，运行时不用）
- `assets/refs/`（原猫照片）
- `hatch-run/`、`web/index.html`

脚本会在写出后检查 zip 内没有 `expr-v1/` / `expr-moe/` / `refs/`。

### 体积门禁（必做）

| 现象 | 原因 | 处理 |
|------|------|------|
| **约 18–20 MB** | 当前慵懒套 PNG | 正常 |
| **约 36 MB 或出现 `expr-v1/`** | 两套美术都打进去了 | **禁止上传**，修 `pack-plugin.py` |
| 没有 `expr/close_eyes.png` 或 `expr/idle.png` | 漏文件 | 停，补齐再打 |

`dist/` 已 gitignore，不要把 zip 提交进 git。

**不要**跑 `scripts/sync-to-editor.ps1` 把大 PNG 拷进 `boke/apps/desktop/public/`（会把桌宠打进编辑器安装包）。

## 4. Commit

用户已说发版/出包/打 zip 即视为要求提交。排除 `hatch-run/`、`dist/`、密钥、zip 本身。

```powershell
git add plugin/manifest.json package.json README.md vX.Y.Z-CHANGELOG.md scripts/pack-plugin.py .cursor/skills/plugin-release/SKILL.md .gitignore
git commit -m "Release vX.Y.Z: bump plugin zip version and add changelog."
```

PowerShell 用 `-m "单行"`，不要 bash heredoc。

把 skill 同步拷贝到 `C:\projects\NineeeSkills\ChestnutCat\plugin-release\`（见该仓库 README）。NineeeSkills 的提交单独做，不要混进 ChestnutCat。

## 5. Push（代理）

本机 `git config http.proxy` 常是 `http://127.0.0.1:7890`。**Clash 没开时 git/gh 会立刻失败**。

**不要改 git config。** 本次命令覆盖即可：

```powershell
git -c http.proxy= -c https.proxy= fetch origin
git -c http.proxy= -c https.proxy= pull origin main
git -c http.proxy= -c https.proxy= push origin main
```

`gh` 同样清掉代理环境变量（不要写进仓库）：

```powershell
$env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""; $env:http_proxy = ""; $env:https_proxy = ""
```

直连也超时：让用户打开 Watt Toolkit / 代理后再试。

## 6. Git tag

Annotated tag 打在**刚推送的发版 commit**上。

```powershell
git tag -a vX.Y.Z -m "Chestnut Cat vX.Y.Z"
git -c http.proxy= -c https.proxy= push origin vX.Y.Z
```

新建版本：**不要** force 已有 tag。用户明确说「替换」已发布包时，才走下面替换流程。

## 7–8. GitHub Release（系统 Edge + gh）

仓库：`https://github.com/nine-waited/ChestnutCat`

**必须用系统 Microsoft Edge**（用户配置文件），不要用 Cursor 内嵌浏览器。

### 发布元数据

| 项 | 值 |
|----|-----|
| Tag | `vX.Y.Z` |
| 标题 | `Chestnut Cat vX.Y.Z` |
| 描述 | `vX.Y.Z-CHANGELOG.md` 全文 |
| 类型 | 用户选的 pre-release 或 Latest release |
| 资产 | `dist/chestnut-cat-X.Y.Z.zip` |

### 安装 / 登录 gh

本机常无 `gh`：

```powershell
winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
```

装完**刷新 PATH**。登录走设备码 + Edge（把代码**立刻发给用户**，旧码作废）：

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$env:BROWSER = "msedge"
$env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""; $env:http_proxy = ""; $env:https_proxy = ""
Start-Process msedge "https://github.com/login/device"
"Y" | gh auth login --hostname github.com --git-protocol https --web
```

终端出现 `First copy your one-time code: XXXX-XXXX` 后：**停下来把新码发给用户**。授权成功：`Logged in as nine-waited`。

**不要**把 token 写进对话摘要、仓库或 skill。

### 创建

```powershell
# 正式版（1.x 默认）
gh release create vX.Y.Z "dist/chestnut-cat-X.Y.Z.zip" --repo nine-waited/ChestnutCat --title "Chestnut Cat vX.Y.Z" --notes-file "vX.Y.Z-CHANGELOG.md"

# 预发布：加 --prerelease
```

在仓库根目录跑，或给 zip 绝对路径。

### 替换已发布 zip（用户说「替换」）

在**新 zip 已打好、体积合格、相关代码已 push 到 main** 之后：

```powershell
git tag -f -a vX.Y.Z -m "Chestnut Cat vX.Y.Z"
git -c http.proxy= -c https.proxy= push origin vX.Y.Z --force
gh release upload vX.Y.Z "dist/chestnut-cat-X.Y.Z.zip" --repo nine-waited/ChestnutCat --clobber
gh api repos/nine-waited/ChestnutCat/releases/tags/vX.Y.Z --jq ".assets[] | {name, size}"
```

- `--force` **只用于该版本 tag**，**禁止** force push `main`
- `--clobber` 覆盖同名 zip；用 `size` 确认是新体积

### 核对

打开 `https://github.com/nine-waited/ChestnutCat/releases/tag/vX.Y.Z`：

- Pre-release 标记与用户选择一致
- 描述 = 更新文档全文
- zip 可下载且体积对得上；解压后没有 `expr-v1/`

网页兜底：`https://github.com/nine-waited/ChestnutCat/releases/new?tag=vX.Y.Z`。

## 不要做的事

- 不要把 zip、`dist/`、`hatch-run/` 提交进 git
- 不要把 `expr-v1` 或原猫照片打进 zip
- 不要把桌宠同步进 Chestnut Editor 的 `public/`
- 不要 `git push --force` 到 `main`
- 不要在用户未要求替换时 force 远程 tag
- 不要把 GitHub token 写入仓库或 skill
- 不要用一次性 Chromium profile 代替系统 Edge
- 不要改 `git config` 里的 proxy；用 `-c http.proxy=` 覆盖

## 完成后告诉用户

- 版本 `vX.Y.Z` 与 zip 绝对路径、大约体积
- 是否已排除 `expr-v1`
- commit / tag / GitHub Release URL
- pre-release 还是正式版
- 编辑器里需要重新导入 zip 才会更新
