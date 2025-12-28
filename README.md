# Ontology Builder - 本体论建模工具

一个现代化的本体论建模工具，灵感来自 Palantir Ontology。支持可视化设计对象类型、属性、关系和接口。

![Ontology Builder](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## ✨ 功能特性

### 核心概念
- **对象类型 (Object Types)** - 定义业务实体，如客户、订单、产品等
- **属性 (Properties)** - 对象的特征和数据字段，支持多种数据类型
- **链接类型 (Link Types)** - 对象之间的关系，支持一对一、一对多、多对多
- **接口 (Interfaces)** - 多态性支持，定义共享的属性结构
- **动作 (Actions)** - 可在对象上执行的操作

### 功能亮点
- 🎨 **可视化画布** - 拖拽式建模，直观编辑对象和关系
- 📦 **属性编辑器** - 完整的属性定义，支持主键、必填、类型验证
- 🔗 **关系建模** - 连线创建关系，自动生成链接类型
- 💾 **本地持久化** - 自动保存到浏览器本地存储
- 📤 **导入/导出** - JSON 格式，方便迁移和备份
- 🌙 **深色主题** - 精心设计的深色界面，减少眼睛疲劳

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 开始使用。

### 构建生产版本

```bash
npm run build
```

## 🎯 使用指南

### 创建对象类型
1. 点击左侧工具栏的 **对象类型** 按钮
2. 填写名称、显示名称、选择颜色和图标
3. 添加属性，设置数据类型和约束
4. 指定主键属性
5. 点击保存

### 创建关系
1. 在画布上连接两个对象类型节点
2. 自动创建链接类型
3. 双击链接编辑详细信息

### 编辑节点
- 双击节点打开编辑面板
- 拖拽节点调整位置
- 单击选中节点

### 导出/导入
- 点击工具栏的导出按钮下载 JSON 文件
- 点击导入按钮粘贴 JSON 数据恢复

## 📁 项目结构

```
src/
├── components/
│   ├── nodes/
│   │   ├── ObjectTypeNode.tsx    # 对象类型节点组件
│   │   └── InterfaceNode.tsx     # 接口节点组件
│   ├── Canvas.tsx                # 可视化画布
│   ├── Header.tsx                # 顶部导航栏
│   ├── Toolbar.tsx               # 左侧工具栏
│   ├── Panel.tsx                 # 右侧编辑面板
│   └── PropertyEditor.tsx        # 属性编辑器
├── store/
│   └── ontologyStore.ts          # Zustand 状态管理
├── types/
│   └── ontology.ts               # TypeScript 类型定义
├── App.tsx                       # 主应用组件
├── main.tsx                      # 入口文件
└── index.css                     # 全局样式
```

## 🛠️ 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Flow** - 流程图/画布组件
- **Zustand** - 状态管理
- **Tailwind CSS 4** - 样式框架
- **Heroicons** - 图标库

## 📖 本体论概念说明

### 什么是本体论？
在信息科学中，本体论是对特定领域内概念和关系的正式表示。它定义了：
- **类/类型** - 事物的种类
- **属性** - 类的特征
- **关系** - 类之间的联系
- **约束** - 规则和限制

### Palantir Ontology 模式
本工具参考 Palantir Foundry 的本体论模式：
- 将数据表映射为对象类型
- 将外键关系映射为链接
- 支持接口实现多态性
- 动作定义业务操作

## 📝 License

MIT License
