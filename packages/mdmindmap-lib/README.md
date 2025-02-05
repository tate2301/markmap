# mdmindmap-lib

![NPM](https://img.shields.io/npm/v/mdmindmap-lib.svg)
![License](https://img.shields.io/npm/l/mdmindmap-lib.svg)
![Downloads](https://img.shields.io/npm/dt/mdmindmap-lib.svg)

Visualize your Markdown as mindmaps.

## Install

```sh
$ npm install mdmindmap-lib
```

See [mdmindmap-cli](https://github.com/markmap/markmap/tree/master/packages/mdmindmap-cli) for command-line usage.

See [mdmindmap-view](https://github.com/markmap/markmap/tree/master/packages/mdmindmap-view) for rendering in browser.

## Bidirectional Mindmap

The bidirectional mindmap feature allows you to generate mindmaps with the root node at the center and its children recursively in both the left and right directions. The mindmap tree is balanced by default if no direction for individual children of the root node is specified.

### Usage

To use the bidirectional mindmap feature, you can add direction markers to your Markdown content. The direction markers are `[->]` for right and `[<-]` for left. If no direction marker is specified, the children will alternate directions to balance the tree.

#### Example

```markdown
- Root
  - [->] Child 1
  - [<-] Child 2
    - [->] Grandchild 1
    - [<-] Grandchild 2
  - [->] Child 3
```

If no direction markers are specified, the mindmap will be balanced automatically:

```markdown
- Root
  - Child 1
  - Child 2
    - Grandchild 1
    - Grandchild 2
  - Child 3
```

👉 [Read the documentation](https://markmap.js.org/docs) for more detail.

## Running Tests

To run the tests and check if they pass, use the following command:

```sh
pnpm test
```
