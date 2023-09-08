# Moon style
Moon style is a versatile CSS utility package that helps you quickly and easily generate styles for your web projects. It provides a set of predefined styles and themes that you can customize to match your project's design.

## Installation
You can install Moon style using Yarn:

```bash
yarn add moon-style
```
### Or using NPM
```bash
npm install moon-style
```

## Getting Started
### Configuration
Moon style relies on a configuration file named `moon.config.json` to generate styles. If you don't already have this file in your project, Moon style will create a default configuration for you at `./styles/moon.config.json`.

The default configuration includes predefined styles for properties like `padding`, `margin`, `font-size`, and more. You can customize this configuration to suit your project's needs.

### Customization (Optional)
If you want to customize the default styles or define new ones, open the `moon.config.json` file in your project and modify it according to your requirements. You can specify your own values for various properties, change colors, and define new themes.

### CSS Generation
To generate the CSS based on your configuration, run the following command:

```bash
yarn moon
```

This will generate a `moon.css` file in your project's output directory, applying the styles defined in your `moon.config.json` file.

### Importing CSS
To apply the generated styles to your project, import the `moon.css` file in your main TypeScript (`main.ts`) or JavaScript (`index.js`) file:

```javascript
import './path/to/moon.css'; // Replace with the actual path to moon.css
```

Make sure to replace `./path/to/moon.css` with the correct path to your `moon.css` file.

### Themes
Moon style comes with predefined themes that you can use or modify in your `moon.config.json` file. Themes include color palettes and other design elements to quickly change the look and feel of your project.

### Output Path
By default, the generated `moon.css` file is placed in the `./styles` directory of your project. You can customize the output path in your `moon.config.json` file by modifying the `outputPath` property.

### Example Configuration
Here's an example of a `moon.config.json` file with predefined styles and themes:

```json
{
  "$schema": "./node_modules/moon-style/dist/moon.config.schema.json",
  "styles": [
    {
      "props": { "padding": "p", "margin": "m" },
      "variableName": "spacing",
      "values": { "0": "0", "sm": "4px", "md": "8px" }
    },
    // Add more styles here
  ],
  "themes": {
    "root" :{
      // Define the static colors thats will be applied with all themes
      "red": "#dd3643",
      "cyan": "#63cfc9",
      "nice": "#83d6e1",
      "cute": "#a3e4cb",
    },
    "light":{
      "prim": "#FFFFFF",
      "prince": "#f6f6f6",
      "owl": "#1f1d2b",
      "goat": "#c4c4c7",
    },
    "dark": {
      "prim": "#2d303e",
      "prince": "#393c4a",
      "owl": "#ffffff",
      "goat": "#9e9fa6",
    }
    // Define more themes here
  },
  "useStaticNumbers": false,
  "outputPath": "./styles"
}
```

### Usage
To use a predefined style, add the `moon` class to an HTML element and specify the style name as a class name. For example, to apply the `p-md` style to a `div` element, use the following code:

```js
import React from "react";
import { changeTheme, currentTheme } from "moon-style";

function App() {
  const [theme, setTheme] = React.useState(currentTheme());
  return (
    <div className="inset-0 bg-prim col">
      <div className="bg-prince round-xl p-md shadow-lg size-6x m-auto ">
        <div className="m-auto col items-center p-xl font-mono">
          <p className="text-owl bg-prim round-lg p-xl text-xl text-center">
            Current Theme is <span className="text-nice px-xl">{theme}</span>
          </p>
          <p className="text-owl bg-prim round-lg p-xl text-xl text-center">
            You can change the
            <span className="text-shark px-xl">theme</span>
            by clicking the
            <span className="text-owl px-xl">buttons</span>
            below.
          </p>
          <p className="border-thin border-solid border-lord round-md p-md text-lord">border</p>
          <div className="row gap-lg bg-prim round-xl p-xl">
            <p
              onClick={() => {
                changeTheme("dark");
                setTheme("dark");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              dark
            </p>
            <p
              onClick={() => {
                changeTheme("light");
                setTheme("light");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              light
            </p>
            <p
              onClick={() => {
                changeTheme("great");
                setTheme("great");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              great
            </p>
          </div>
          <p
            onClick={() => {
              const _currentTheme = currentTheme();
              if (_currentTheme === "dark") {
                changeTheme("light");
                setTheme("light");
              }
              if (_currentTheme === "light") {
                changeTheme("great");
                setTheme("great");
              }
              if (_currentTheme === "great") {
                changeTheme("dark");
                setTheme("dark");
              }
            }}
            className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
            Toggle Theme
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

```

### The result should be like this
![1.gif](https://github.com/MorabaaSoftwareSolutions/Moon/blob/master/public/gifs/sample.gif?raw=true)


# API
## `changeTheme(themeName: string)`
Changes the current theme to the specified theme.

### Parameters
| Name | Type | Description |
| --- | --- | --- |
| `themeName` | `string` | The name of the theme to change to. |

### Returns
`void`

### Example
```js
import { changeTheme } from "moon-style";

changeTheme("dark");
```

## `currentTheme()`
Returns the name of the current theme.

### Returns
`string`

### Example
```js
import { currentTheme } from "moon-style";

const theme = currentTheme(); // In our sample it will return one of these values: "light", "dark", "great"

```

## Documentation
coming soon... 😅
<!-- For detailed information on how to customize your `moon.config.json` file and use Moon style effectively, refer to the [documentation](https://moon-style.netlify.app/). -->
