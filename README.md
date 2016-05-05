# select
自定义下拉框。支持搜索功能和方向键选择。

##使用

```javascript
  module.select({
            dropdown:'dropdown',        // 下拉按钮，非必须
            list : 'list',                  // 下拉列表，必须
            show_input : 'show_input',            //显式输入框，用于搜索、输入、和显示。必须
            real_input : 'real_input',            // 隐式输入框，最终选中数据，必须
        });
  }
```
具体请看demo。