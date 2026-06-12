# Minecraft Modpack Creator Skills

[English](./README.md) | [简体中文](./README.zh-CN.md)

用 Agent Skills 把 Minecraft 整合包开发变成一套可复用、可追踪、可继续协作的工作流。

这个仓库不是启动器，也不是下载器。它是一组给 AI agent 使用的 skill：让 agent 在开发整合包时记住项目目标、验证 Mod 来源、分析兼容风险、沉淀决策记录，并在下一次对话里继续基于同一份项目状态工作。

适合：

- 从 0 开始规划一个新的 NeoForge / Minecraft 整合包
- 给已有整合包补上“项目状态”和“决策记录”
- 评估候选 Mod 是否真的适合当前包
- 让 AI 不再每次都从一份临时聊天记录重新开始

## 为什么需要它

整合包开发最难的部分通常不是“找 Mod”，而是回答这些问题：

- 这个包到底要解决什么体验？
- 当前目标版本、Loader、服务端/客户端约束是什么？
- 哪些 Mod 已经接受，哪些被拒绝，为什么？
- 新 Mod 会不会和已有世界生成、进度、权限、指令、配置冲突？
- 下载来源是不是官方的，证据在哪里？
- 下一次继续开发时，AI 应该从哪里接上？

这个仓库把这些信息写进 `pack-state`，让整合包开发从“聊天建议”变成“可维护工程”。

## 包含的 Skills

每个 skill 都是一个独立目录，核心文件是 `SKILL.md`。

| Skill | 作用 |
| --- | --- |
| `minecraft-pack-builder` | 主流程编排：理解需求、发现候选 Mod、生成 shortlist、调用分析与兼容评估、更新项目状态。 |
| `mod-analyzer` | 深入分析单个 Mod：来源、别名、版本/Loader、依赖、配置面、实现线索和风险。 |
| `pack-compat` | 判断一个或多个 Mod 是否适合当前整合包，并记录阻塞项、重叠能力和接入条件。 |
| `pack-context` | 维护当前整合包上下文：目标、约束、已选/已拒 Mod、历史分析和风险。 |

共享脚本和模板由 `minecraft-pack-builder` skill 持有，其他 skill 通过资源名引用，不依赖硬编码路径。

## 核心状态目录

在你的整合包工作区里保留一个 `pack-state` 目录：

```text
pack-state/
  project-context.json
  mod-analyses/
  compat-reports/
  integration-docs/
```

最小的 `project-context.json` 可以这样开始：

```json
{
  "packName": "my-pack",
  "minecraftVersion": null,
  "loader": "NeoForge",
  "distribution": "server-first",
  "goals": [],
  "hardConstraints": [],
  "acceptedMods": [],
  "rejectedMods": [],
  "pendingMods": [],
  "openCapabilityGaps": [],
  "knownRisks": [],
  "artifacts": {
    "modAnalyses": [],
    "compatReports": [],
    "integrationDocs": []
  }
}
```

建议把 `pack-state` 提交到 Git。它就是这个整合包的长期记忆。

## 从 0 开始开发一个整合包

创建一个新的整合包工作区：

```text
my-modpack/
  mods/
  config/
  pack-state/
```

然后把本仓库的 `skills/` 提供给你的 agent。具体方式取决于你的环境：可以安装到 agent 的 skills 目录，也可以在支持仓库级 skills 的环境中直接把本仓库作为工作区。

准备好 `pack-state/project-context.json` 后，直接给 agent 一个明确目标：

```text
Use the minecraft-pack-builder skill.

我要从 0 开始做一个 NeoForge 服务端优先的生存整合包。
方向是探索、道路、城镇、轻量自动化和长期成长。
尽量避免强客户端依赖，也不要引入会显著增加世界生成不稳定性的 Mod。
请先帮我整理需求、给出第一批候选 Mod，并在决策稳定后更新 pack-state。
```

推荐的迭代节奏：

1. 描述玩法目标和硬约束。
2. 让 `minecraft-pack-builder` 给出候选列表。
3. 选择候选 Mod。
4. 让 `mod-analyzer` 写入单 Mod 分析。
5. 让 `pack-compat` 判断是否适合当前包。
6. 让 `pack-context` 更新长期项目状态。

一次好的工作流结束时，仓库里应该多出或更新了状态文件，而不只是得到一段建议。

## 让已有整合包接入 Skills

已有整合包不需要重做。你只需要给它补一个状态层。

第一步，把 `skills/` 放到 agent 可用的位置，并在整合包仓库里创建：

```text
pack-state/
  project-context.json
  mod-analyses/
  compat-reports/
  integration-docs/
```

第二步，让 agent 从现有文件建立上下文：

```text
Use the pack-context skill.

这是一个已有 Minecraft 整合包。请扫描当前工作区，创建 pack-state/project-context.json。
重点参考 mods/、config/、defaultconfigs/、kubejs/、datapacks/ 和已有说明文档。
请区分已确认事实和推测，不要编造版本目标或设计目标。
```

第三步，逐步回填关键 Mod 的分析：

```text
Use the mod-analyzer skill.

请先分析这个包里最核心的世界生成、进度和服务端玩法 Mod。
每个重要 Mod 写一个 mod-analyses 记录，然后用 pack-compat 找出重叠能力和风险。
```

以后每次加 Mod，都让 agent 先读 `pack-state`：

```text
Use the minecraft-pack-builder skill.

我想给这个已有整合包加入道路或交通系统。
请先读取 pack-state，复用已有分析，提出候选 Mod。
只有在官方来源和当前包适配性都清楚时，才给出推荐。
```

## 工作流约定

- `project-context.json` 是当前整合包的事实入口。
- `mod-analyses/*.json` 记录单个 Mod 的来源、能力和风险。
- `compat-reports/*.json` 记录适配结论、阻塞项和接入条件。
- `integration-docs/*.md` 记录已选 Mod 的配置、部署和维护说明。

如果一个决策以后还会影响整合包，就不要只把它留在聊天里。

## 这不是

- 不是 Mod 下载站
- 不是自动化启动器
- 不是依赖求解器
- 不是替你决定所有玩法方向的黑箱

它的职责是帮助你更稳地做判断，并把判断沉淀成项目资产。

## 仓库结构

```text
skills/
  minecraft-pack-builder/
    SKILL.md
    scripts/
    references/templates/
  mod-analyzer/
    SKILL.md
  pack-compat/
    SKILL.md
  pack-context/
    SKILL.md
```

## 原则

- 优先使用官方或可信来源。
- 优先写清取舍，而不是给出模糊的“应该没问题”。
- 把已接受决策、候选想法和推测分开。
- 复用已有分析，不重复从零开始。
- 每次工作结束，都让项目比开始时更容易继续。

