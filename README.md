# markmap

[![Join the chat at https://gitter.im/gera2ld/markmap](https://badges.gitter.im/gera2ld/markmap.svg)](https://gitter.im/gera2ld/markmap?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Visualize your Markdown as mindmaps.

This project is heavily inspired by [dundalek's markmap](https://github.com/dundalek/markmap).

👉 [Try it out](https://markmap.js.org/repl).

## Related Projects

Markmap is also available in:

- [VSCode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) and [Open VSX](https://open-vsx.org/extension/gera2ld/markmap-vscode)
- Vim / Neovim: [coc-markmap](https://github.com/gera2ld/coc-markmap) ![NPM](https://img.shields.io/npm/v/coc-markmap.svg) - powered by [coc.nvim](https://github.com/neoclide/coc.nvim)
- Emacs: [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) -- powered by [EAF](https://github.com/emacs-eaf/emacs-application-framework)

## Usage

👉 [Read the documentation](https://markmap.js.org/docs) for more detail.

## Deploying Packages to GitHub Packages

To deploy the packages to GitHub Packages, follow these steps:

1. Ensure you have the necessary permissions to publish packages to the GitHub repository.
2. Make sure you have the `NODE_AUTH_TOKEN` environment variable set with your GitHub token.
3. Run the following command to publish the packages:

```sh
pnpm publish --access public --registry https://npm.pkg.github.com
```

## Installing Packages in a React Project

To install the packages in your React project, follow these steps:

1. Add the GitHub Packages registry to your `.npmrc` file:

```sh
registry=https://npm.pkg.github.com
```

2. Install the packages using `pnpm`:

```sh
pnpm install @your-username/mdmindmap
pnpm install @your-username/mdmindmap-autoloader
pnpm install @your-username/mdmindmap-cli
pnpm install @your-username/mdmindmap-common
pnpm install @your-username/mdmindmap-html-parser
pnpm install @your-username/mdmindmap-lib
pnpm install @your-username/mdmindmap-render
pnpm install @your-username/mdmindmap-toolbar
pnpm install @your-username/mdmindmap-view
```
