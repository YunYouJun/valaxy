---
title: Custom Post Templates
title_zh: 自定义文章模板
categories:
  - custom
end: false
---

::: zh-CN
Valaxy 使用 [ejs](https://ejs.co/) 作为模板生成助手，你可以按照以下方式定义自己的模板：
:::

::: en
Valaxy uses [ejs](https://ejs.co/) as its template generating helper, you can define your
own templates as below:
:::

## 在项目根目录中创建 scaffold 文件夹 {lang="zh-CN"}

## Create a scaffold folder in your project root {lang="en"}

```shell
$ mkdir scaffolds
```

## 在 scaffolds 文件夹中创建自己的模板 {lang="zh-CN"}

## Create your own template to the scaffolds folder {lang="en"}

<div lang="zh-CN">

> **提示**
> 你要创建的文件名将与使用命令创建文件时所需的布局名称相同：

> `valaxy new --layout [layout] [filename]`

</div>

<div lang="en">

> **Note**
> The filename you are going to create is going to be the same
with the layout name you need when you creating file with command:

> `valaxy new --layout [layout] [filename]`

</div>

```shell
$ touch scaffolds/post.md
$ cat <<EOF > scaffolds/post.md
---
layout: <%=layout%>
title: <%=title%>
date: <%=date%>
---

Some additional descriptions
EOF
```
