<h1 align="center">njk</h1>

<p align="center">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/mohitsinghs/njk/ci">
  <a href="https://www.npmjs.com/package/njk"><img src="https://img.shields.io/npm/v/njk.svg" alt="npm version"></a>
  <a href="https://david-dm.org/mohitsinghs/njk"><img src="https://img.shields.io/david/mohitsinghs/njk" alt="dependencies Status"></a>
  <a href="https://david-dm.org/mohitsinghs/njk?type=dev"><img src="https://img.shields.io/david/dev/mohitsinghs/njk" alt="devDependencies Status"></a>
  <img alt="node-current" src="https://img.shields.io/node/v/njk">
  <img alt="npm" src="https://img.shields.io/npm/dt/njk">
  <a href="https://github.com/mohitsinghs/njk/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="license MIT"></a>
</p>

<p align="center">
  <b>Render nunjucks templates with markdown and front-matter</b><br/>
  <sub>generate ( and minify ) html based on nunjucks templates, markdown, front-matter and json/yml data</sub>
</p>

<br />

## Install

Install with [npm](https://npm.im/njk)

```sh
npm i -g njk
```

## Usages

```sh
njk <files|dirs|globs> [options]
```

## CLI Flags

- **`-V`** prints version
- **`-h or --help`** prints help text
- **`-v or --verbose`** includes additional logging
- **`-b or --block`** wraps a content block by default. This is convenient when you you want to extend just one block. This helps you avoid writing extends tag in child template
- **`-c or --clean`** uses clean urls (urls with forward slash) for output files.
- **`-q or --quiet`** silences the output until any error ocours.
- **`-w or --watch`** runs everything in watch mode. HTML is not minified in this mode.

## CLI Options

- **`-d or --data`** pass either json file path of yaml directory path containing data.
- **`-t or --template`** pass template directories (nunjucks searchPaths). Multiple template directories can be passed, separated by comma `,`
- **`-o or --out`** pass output directory

## File Options

Following options can be configured through front-matter of individual files.

- **`layout`** parent layout/template to use for rendering a file. This inserts a `extends` tag automatically.
- **`block`** Wraps a content block around a page. If enabled, an empty content block is required in parent template where content will be inserted.
- **`clean`** Uses clean urls while writing files. For example `file.html` will be written as `file/index.html`

## Contributing

You can help improving njk in following ways -

- Found a bug, create an issue with relevant information.
- Want a feature to be added, A pull request is always welcome.

---

<h2>Examples</h2>
<details>
  <summary>
    <b>1. Rendering a template using block flag and layout option in front matter</b>
  </summary>
  <br/>

We can avoid wrapping `extends` tags and overriding `block` tags, If we need to inject single block in parent template.

**Step 1**

Consider we have a nunjucks template with single block.

_`default.njk`_

```nunjucks
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
</head>
<body>
  {% block content %}{% endblock %}
  <!-- The block name content is important -->
</body>
</html>
```

and a simple html page

_`index.html`_

```nunjucks
---
layout: default
---
</head>
<h1>On Laughing</h1>
</header>
<main>
<p>A laugh draws a lot of painful lines.</p>
</main>
<footer>
<small>Copyright &copy; Creator Inc.</small>
</footer>
```

**Step 2**

Now, Let's run njk.

```bash
njk index.html -b
```

> The current directory will be used for templates.

**Result**

The result will be something like

_`dist/index.html`_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Page Title</title>
  </head>
  <body>
    <header>
      <h1>On Laughing</h1>
    </header>
    <main>
      <p>A laugh draws a lot of painful lines.</p>
    </main>
    <footer>
      <small>Copyright © Creator Inc.</small>
    </footer>
  </body>
</html>
```

</details>

<details>
  <summary>
    <b>2. Rendering a template using layout option in front matter</b>
  </summary>
  <br/>

Wrapping `extends` tag in each of our file isn't super cool,

and we can avoid this by using `layout` option in front-matter.

### Example

**Step 1**

Consider we have a nunjucks template with 3 blocks.

_`default.njk`_

```nunjucks
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
</head>
<body>
  <header>
    {% block header %}{% endblock %}
  </header>
  <main>
    {% block main %}{% endblock %}
  </main>
  <footer>
    {% block footer %}{% endblock %}
  </footer>
</body>
</html>
```

and a simple html page with content for these 3 blocks

_`index.html`_

```nunjucks
---
layout: default
---
{% block header %}
<h1>On Laughing</h1>
{% endblock %}
{% block main %}
<p>A laugh draws a lot of painful lines.</p>
{% endblock %}
{% block footer %}
<small>Copyright &copy; Creator Inc.</small>
{% endblock %}
```

**Step 2**

Now, Let's run njk.

```bash
njk index.html
```

> The current directory will be used for templates.

**Result**

The result will be something like

_`dist/index.html`_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Page Title</title>
  </head>
  <body>
    <header><h1>On Laughing</h1></header>
    <main><p>A laugh draws a lot of painful lines.</p></main>
    <footer><small>Copyright © Creator Inc.</small></footer>
  </body>
</html>
```

</details>

<details>
  <summary>
    <b>Extra : Configuring layout through data passed</b>
  </summary>
  <br/>

We can go one step further and configure layout it in the data passed with `-d` or `--data`

**Step 1**

Remove front-matter from _`index.html`_

_`index.html`_

```nunjucks
{% block header %}
<h1>On Laughing</h1>
{% endblock %}
{% block main %}
<p>A laugh draws a lot of painful lines.</p>
{% endblock %}
{% block footer %}
<small>Copyright &copy; Creator Inc.</small>
{% endblock %}
```

**Step 2 ( using yml )**

_`data/page.yml`_

```yml
layout: default
```

We need to run

```bash
njk index.html -d data
```

Note that file name is important here, as we need `page.layout` property.

**Step 2 ( using json )**

We can pass a single json file instead of `data` folder

_`data.json`_

```json
{
  "page": {
    "layout": "default"
  }
}
```

We need to run

```bash
njk index.html -d data.json
```

**Result**

The result will be same as our previous run (Example 2).

</details>

