
# Customize post templates

Valaxy uses [ejs](https://ejs.co/) as its template generating helper, you can define your
own templates as below:

## Create a scaffold folder in your project root

```shell
$ mkdir scaffolds
```

## Create your own template to the scaffolds folder

> **Note**
> The filename you are going to create is going to be the same
with the layout name you need when you creating file with command:

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

## Using Valaxy new to quickly create a new post
