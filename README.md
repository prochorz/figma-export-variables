# figma-export-variables

> Command line for export variables

## How it works?
This script initiates the browser and extracts variables from Figma within its interface. A Figma login is required. If it's your initial login using Puppeteer, the script may open the browser with a graphical user interface to facilitate the manual login process into Figma.

## Install

While you can install it globally on your machine, it's much better to install it **locally** project by project.

```sh
npm install --save-dev figma-export-variables
```
```sh
figma-export-variables --help
```

> **Note:** If you do not have a `package.json`, create one before installing or run `npm init -y` to automatically create ones.

## Usage

```sh
npx figma-export-variables COMMAND
```

## Commands

### `interactive`
By default, the browser runs without a graphical user interface (GUI). In case of any issues, you have the option to run it with a GUI.

```sh
npx figma-export-variables --interactive
```

### `use-config`

You must create a configuration file and use a single command *to rule them all* :ring:

Let's create the file `.figmaexportvariablestrc.js` and paste the following:

```js
module.exports = {
    files: [
        {
            id: 'SOME_UNIQ_ID',
            outputters: [outputFn]
        }
    ]
};
```
> :information_source: Take a look at [.figmaexportvariablestrc.js.example](/.figmaexportvariablestrc.js.example) for more details.

now you can update the `package.json`.

```diff
{
  "scripts": {
+   "figma-variables:export": "figma-export-variables use-config"
  }
}
```

If needed you can also provide a different configuration file.

```diff
{
  "scripts": {
+   "figma-variables:export": "figma-export-variables use-config .figmaexportrc.production.js"
  }
}
```