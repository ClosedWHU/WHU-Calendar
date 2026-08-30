# 武汉大学 iCalendar 校历

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@closedwhu/calendar.svg)](https://www.npmjs.com/package/@closedwhu/calendar)
[![pub.dev](https://img.shields.io/pub/v/whu_calendar.svg)](https://pub.dev/packages/whu_calendar)
[![Go](https://img.shields.io/badge/Go-reference-blue.svg)](https://github.com/ClosedWHU/WHU-Calendar)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-ES%20Modules-green.svg)](https://nodejs.org/)
[![Build Status](https://github.com/ClosedWHU/WHU-Calendar/workflows/CI/badge.svg)](https://github.com/ClosedWHU/WHU-Calendar/actions)
[![Last commit](https://img.shields.io/github/last-commit/ClosedWHU/WHU-Calendar.svg)](https://github.com/ClosedWHU/WHU-Calendar/commits/main)
[![Issues](https://img.shields.io/github/issues/ClosedWHU/WHU-Calendar.svg)](https://github.com/ClosedWHU/WHU-Calendar/issues)
[![Stars](https://img.shields.io/github/stars/ClosedWHU/WHU-Calendar.svg)](https://github.com/ClosedWHU/WHU-Calendar/stargazers)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FClosedWHU%2FWHU-Calendar.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FClosedWHU%2FWHU-Calendar?ref=badge_shield)

武汉大学校历数据集合，支持导入各种日历应用，轻松管理学校日程。

## 项目简介

本项目提供武汉大学官方校历的 iCalendar 格式数据，目前包含从 2012 年到 2027 年（持续更新中）的完整校历信息。

本项目使用数据驱动架构，所有校历数据均存储在 `data/*.json` 中，通过 TypeScript、Dart、Go 三种语言原生导入，仓库内仅保留一份数据。

> **注意**：本项目仅提供校历数据，不保证数据的绝对实时性。请以武汉大学官方发布的[最新校历](https://uc.whu.edu.cn/xl.htm)为准。

### 主要特性

- **官方数据源**：基于武汉大学本科生院官方校历数据。
- **Sunday-Start 规范**：所有教学周严格从周日开始，到周六结束，完美契合武大作息。
- **多语言支持**：TypeScript/npm、Dart/Flutter、Go 三种语言原生导入，数据零重复。
- **自动更新**：支持在线订阅，校历更新时自动同步。
- **网页预览**：通过 [calendar.whu.sb](https://calendar.whu.sb) 动态加载并提供下载。

## 快速开始

### 在线使用

访问 [项目主页](https://calendar.whu.sb/) 直接预览并下载所需的校历文件。

### TypeScript / npm

```bash
npm install @closedwhu/calendar
# 或
pnpm add @closedwhu/calendar
```

```typescript
import type { CalendarData } from '@closedwhu/calendar';

import allData from '@closedwhu/calendar/data';
import yearsList from '@closedwhu/calendar/years';
import ics2024 from '@closedwhu/calendar/ics/2024-2025.ics';
```

### ESM / CDN（jsDelivr）

无需安装，直接在浏览器中导入。数据内联在 bundle 中，无运行时网络请求：

```html
<script type="module">
  import { loadAllYears, getSemester, getSemesterForDate } from
    'https://cdn.jsdelivr.net/npm/@closedwhu/calendar@latest/dist/browser.js';

  console.log(loadAllYears().length, 'years');
  console.log(getSemester(2024, 1)?.name);          // "2024-2025第一学期"
  console.log(getSemesterForDate(new Date())?.name);  // 当前学期
</script>
```

### Dart / Flutter (pub.dev)

```yaml
dependencies:
  whu_calendar: ^0.3.2
```

```dart
import 'package:whu_calendar/whu_calendar.dart';

final repo = WhuCalendarRepository(rootBundle);
final years = await repo.loadAllYears();
final sem = await repo.getSemester(year: 2024, semester: 1);
```

### Go

```bash
go get github.com/ClosedWHU/WHU-Calendar
```

```go
import "github.com/ClosedWHU/WHU-Calendar"

years, _ := whucalendar.LoadAllYears()
sem, _ := whucalendar.GetSemester(2024, 1)
```

### 本地开发

1. **克隆项目**

```bash
git clone https://github.com/ClosedWHU/WHU-Calendar.git
cd WHU-Calendar
```

2. **安装依赖**

```bash
pnpm install
```

3. **构建项目**

```bash
pnpm run build
```

## 项目结构

```
whu-calendar/
├── data/                   # 结构化 JSON 校历数据（唯一数据源）
├── src/                    # TypeScript 引擎源文件
│   ├── types.ts            # CalendarData / CalendarEvent / Semester 类型定义
│   ├── browser.ts          # 浏览器 ESM 入口（查询 API + 数据内联）
│   ├── engine.ts           # 统一构建引擎（ICS 生成）
│   ├── check-alignment.ts  # 自动对齐校验工具
│   └── check-legacy-parity.ts # 溯源审计工具
├── dart/                   # Dart / Flutter 包
│   ├── pubspec.yaml
│   └── lib/
├── whucalendar.go          # Go 包（//go:embed data/*.json）
├── whucalendar_test.go
├── scripts/                # 构建脚本
│   ├── sync-data.sh        # 同步 data/ 到 dart/assets/data/
│   └── gen-browser-data.mjs # 生成 ESM bundle 数据
├── go.mod                  # module github.com/ClosedWHU/WHU-Calendar
├── functions/              # Cloudflare Worker API
├── dist/                   # 构建输出目录
│   ├── *.ics               # 生成的 ICS 文件
│   ├── browser.js          # 浏览器 ESM bundle（数据内联）
│   └── years.json          # 供前端使用的年份元数据
├── index.html              # 项目主页
└── README.md
```

## 数据说明

自 2026 年起，本项目弃用了 `calendar_YYYY.ts` 脚本方式，转而采用 JSON 数据驱动。

### 格式对比 (Legacy vs Modern)

| 特性         | Legacy (TS)                | Modern (JSON)              |
| :----------- | :------------------------- | :------------------------- |
| **存储方式** | 硬编码脚本 (`legacy/*.ts`) | 结构化数据 (`data/*.json`) |
| **月份索引** | 0-indexed (0=Jan)          | **1-indexed (1=Jan)**      |
| **周起始日** | 视脚本而定                 | **强制 Sunday (周日)**     |
| **校验机制** | 无                         | 自动化脚本审计             |

## 开发指南

### 添加新年度校历

1. 在 `data/` 目录下创建新的 `YYYY-YYYY.json` 文件（参考现有模板）。
2. **日期规范**：
   - 月份使用真实数字（如 9 代表 9 月）。
   - 每个学期的 `start` 日期必须固定为**该周的星期天**。
3. 运行 `pnpm run build` 重新生成资源。
4. 运行 `npx tsx src/check-alignment.ts` 进行审计。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 致谢

- 感谢武汉大学本科生院提供官方校历数据。
- 感谢所有贡献者的支持和建议。

<!--GAMFC--><a href="https://github.com/HsukqiLee" title="Hsukqi Lee"><img src="https://avatars.githubusercontent.com/u/79034142?v=4" width="42;" alt="Hsukqi Lee"/></a>
<a href="https://github.com/ExerciseBook" title="Eric_Lian"><img src="https://avatars.githubusercontent.com/u/6327311?v=4" width="42;" alt="Eric_Lian"/></a>
<a href="https://github.com/little-weakduck" title="Little Weakduck"><img src="https://avatars.githubusercontent.com/u/83490374?v=4" width="42;" alt="Little Weakduck"/></a>
<a href="https://github.com/LeixinSun" title="Leixin Sun"><img src="https://avatars.githubusercontent.com/u/233723091?v=4" width="42;" alt="Leixin Sun"/></a>
<a href="https://github.com/misakayuuki" title="misa想变猫猫娘"><img src="https://avatars.githubusercontent.com/u/45150398?v=4" width="42;" alt="misa想变猫猫娘"/></a>
<a href="https://github.com/stephen-zeng" title="0x535A"><img src="https://avatars.githubusercontent.com/u/47418664?v=4" width="42;" alt="0x535A"/></a>
<a href="https://github.com/LaplaceYoung" title="laplaceyoung"><img src="https://avatars.githubusercontent.com/u/219803883?v=4" width="42;" alt="laplaceyoung"/></a>
<a href="https://github.com/fossabot" title="fossabot"><img src="https://avatars.githubusercontent.com/u/29791463?v=4" width="42;" alt="fossabot"/></a><!--GAMFC-END-->

## 联系方式

- 项目主页：[Calendar by WHU.sb](https://calendar.whu.sb/)
- 问题反馈：[GitHub Issues](https://github.com/ClosedWHU/WHU-Calendar/issues)

## Star History

<a href="https://star-history.tsinbei.com/#ClosedWHU/WHU-Calendar&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://star-history.tsinbei.com/svg?repos=ClosedWHU/WHU-Calendar&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://star-history.tsinbei.com/svg?repos=ClosedWHU/WHU-Calendar&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://star-history.tsinbei.com/svg?repos=ClosedWHU/WHU-Calendar&type=date&legend=top-left" />
  </picture>
</a>

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FClosedWHU%2FWHU-Calendar.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FClosedWHU%2FWHU-Calendar?ref=badge_large)
