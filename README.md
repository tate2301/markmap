# markmap-react

![NPM](https://img.shields.io/npm/v/markmap-react.svg)
![License](https://img.shields.io/npm/l/markmap-react.svg)
![Downloads](https://img.shields.io/npm/dt/markmap-react.svg)

> This package is built on top of some modules from [markmap-js](https://github.com/tate2301/markmap)

## Installation

```bash
npm install markmap-react
# or
yarn add markmap-react
# or
pnpm add markmap-react
```

## Basic Usage

Transform your markdown into mindmap data:

```typescript
import { Transformer } from "markmap-react"

const markdown = `
- Root
    - Child 1
        - GrandChild 1.1
        - GrandChild 1.2
    - Child 2
        - GrandChild 2.1
        - GrandChild 2.2
`
const transformer = new Transformer()
const markdownData = transformer.getMarkdownData(markdown)
```

## Component Usage

### Basic Component Setup

```typescript
import { Mindmap, Direction, MindmapConfig } from 'markmap-react'

const MyMindmap = () => {
  const config: MindmapConfig = {
    initialDirection: Direction.LR,
    controls: {
      show: true,
      showDataControl: false,
    },
  };

  const handleNodeClick = (node: INode, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log({x: event.clientX, y: event.clientY})
  };

  return (
    <div style={{width: '100%', height: '100%'}}>
      <Mindmap 
        data={currentData} 
        config={config} 
        onNodeClick={handleNodeClick}
      />
    </div>
  )
}
```

### Configuration Options

The Mindmap component accepts a configuration object with the following options:

```typescript
interface MindmapConfig {
  initialDirection: Direction;
  backgroundColor?: string;
  controls?: {
    show?: boolean;
    position?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    showDirectionControl?: boolean;
    showDataControl?: boolean;
  };
}
```

### Default Configuration
```typescript
const defaultConfig: MindmapConfig = {
  initialDirection: Direction.LR,
  backgroundColor: '#f5f5f5',
  controls: {
    show: true,
    position: {
      top: '20px',
      right: '20px',
    },
    showDirectionControl: true,
    showDataControl: true,
  },
};
```

### Playground Example
For a more advanced implementation with dynamic data loading and context menus:

```typescript
const MindmapPlayground = ({ controls }) => {
  const config: MindmapConfig = {
    initialDirection: Direction.LR,
    controls: {
      show: controls,
      showDataControl: false,
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Mindmap 
        data={currentData} 
        config={config} 
        onNodeClick={handleNodeClick}
      />
      {/* Additional controls can be added here */}
    </div>
  );
};
```

### Custom Styling
You can customize the appearance using the transformer with custom styles:

```typescript
const transformer = new Transformer([
  {
    name: 'custom',
    transform: () => ({
      styles: [
        {
          type: 'style',
          data: `
          .node-wrapper { 
            display: inline-flex; 
            padding: 4px 8px; 
            border-radius: 6px; 
            transition: all 0.2s ease; 
          }`,
        },
      ],
      scripts: [],
    }),
  },
]);