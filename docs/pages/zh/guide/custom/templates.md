---
title: 自定义文章模板
categories:
  - custom
end: false
---

Valaxy 使用 [ejs](https://ejs.co/) 作为模板生成助手，你可以按照以下方式定义自己的模板：


## 在项目根目录中创建 scaffold 文件夹


```shell
$ mkdir scaffolds
```

## 在 scaffolds 文件夹中创建自己的模板



> **提示**
> 你要创建的文件名将与使用命令创建文件时所需的布局名称相同：

> `valaxy new --layout [layout] [filename]`



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

