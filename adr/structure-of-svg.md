# Structure of SVG

Markmap will generate an SVG with the following structure:

```tsx
(
  <svg class="markmap">
    <style>{globalCSS + '\n' + customCSS}</style>
    <g>
      {links.map((link) => (
        <path
          class="markmap-link"
          stroke={link.targetNode.color}
          transform={link.transform}
          data-depth={node.depth}
          data-path={node.path}
          data-direction={layoutDirection}
          data-side={layoutDirection === 'center' ? node.direction : null}
        />
      ))}
      {nodes.map((node) => (
        <g
          class="markmap-node"
          transform={node.transform}
          data-depth={node.depth}
          data-path={node.path}
          data-direction={layoutDirection}
          data-side={layoutDirection === 'center' ? node.direction : null}>
          <line stroke={node.color} />
          <circle 
            stroke={node.color}
            data-direction={layoutDirection}
            data-side={layoutDirection === 'center' ? node.direction : null}
          />
          <foreignObject class="markmap-foreign">
            <div xmlns="http://www.w3.org/1999/xhtml">
              {node.htmlContent}
            </div>
          </foreignObject>
        </g>
      ))}
    </g>
  </svg>
)
```

Each `<path>` is a link between a node and its parent. The `<path>` element cannot be grouped with the rest part of the node because when nested the `<path>` element is not smooth and looks aliased.

Each node is grouped in a `<g>` element, except for the link to its parent. Inside this `<g>` element, we have a line below the content (`<line>`), the circle to connect to its children (`<circle>`), and the HTML content wrapped in a `<foreignObject>`.

## Direction Attributes

The SVG structure now includes direction-specific attributes:

- `data-direction`: Indicates the overall layout direction (LR, RL, TB, BT, center)
- `data-side`: Used in center layout to indicate which side of the root a node is on (left/right)

These attributes are applied to:
- Link paths (`<path>`)
- Node groups (`<g>`)
- Node circles (`<circle>`)

## Layout Directions

The mindmap supports five layout directions:

1. **Left to Right (LR)**
   - Root node on the left
   - Children expand rightward
   - Default layout direction

2. **Right to Left (RL)**
   - Root node on the right
   - Children expand leftward
   - Links are mirrored horizontally

3. **Top to Bottom (TB)**
   - Root node at the top
   - Children expand downward
   - Uses vertical link paths

4. **Bottom to Top (BT)**
   - Root node at the bottom
   - Children expand upward
   - Uses inverted vertical link paths

5. **Center**
   - Root node in the center
   - Children alternate between left and right sides
   - Uses direction-specific link paths

## Node Positioning

Node positions are controlled by the `transform` attribute, which varies based on layout direction:

```css
/* LR layout (default) */
transform: translate(x, y);

/* RL layout */
transform: translate(-x, y);

/* TB layout */
transform: translate(x, y);

/* BT layout */
transform: translate(x, -y);

/* Center layout */
transform: translate(x + (direction === 'left' ? -offset : 0), y);
```

## Overriding Styles

You can style nodes and links based on their direction and side:

```css
/* Basic direction-based styling */
.markmap-link[data-direction="LR"],
.markmap-node[data-direction="LR"] > line,
.markmap-node[data-direction="LR"] > circle {
  stroke: #333;
}

/* Center layout side-specific styling */
.markmap-node[data-direction="center"][data-side="left"] .markmap-node-text {
  text-anchor: end;
  transform: translate(-8px, 0);
}

.markmap-node[data-direction="center"][data-side="right"] .markmap-node-text {
  text-anchor: start;
  transform: translate(8px, 0);
}

/* Vertical layout specific styles */
.markmap-node[data-direction="TB"] .markmap-foreign,
.markmap-node[data-direction="BT"] .markmap-foreign {
  text-align: center;
}

/* Highlight specific directions */
.markmap-link[data-direction="TB"],
.markmap-node[data-direction="TB"] > line,
.markmap-node[data-direction="TB"] > circle {
  stroke: blue;
}
```

Note that the `depth` and `path` of each node is still set as data attributes, allowing for depth-based styling to be combined with direction-based styling.
