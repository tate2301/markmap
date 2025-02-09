# markmap-react

![NPM](https://img.shields.io/npm/v/markmap-react.svg)
![License](https://img.shields.io/npm/l/markmap-react.svg)
![Downloads](https://img.shields.io/npm/dt/markmap-react.svg)

> This package is built on top of some modules from [markmap-js](https://github.com/tate2301/markmap)

## Installation

## Getting Started

To get the markdown data, you can you use the transformer like this
```ts
import {Transformer} from "markmap-react"

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

You can initialize the Transformer with custom markdown plugins, for example:

```ts
const transformer = new Transformer([
    {
        name: 'custom',
        transform: () => {
        return {
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
            };
        },
    },
]);
```

To render the mindmap in your app

```tsx
const config: MindmapConfig = {
    initialDirection: Direction.LR,
    controls: {
        show: controls,
        showDataControl: false,
    },
};

const MyMindmap = () => {
    const [currentData, setCurrentData] = useState<INode>(() => {
        return transformer.getMarkdownData(systemDesignMarkdown);
    });

    const handleNodeClick = (node: INode, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // if you want to show a menu you can extract the co-ordinates
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