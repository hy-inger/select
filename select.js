window.Select = (function(){
    var next = 0,           // 方向键选择下一个元素的坐标
            prev = -1,        // 方向键选择上一个元素的坐标
            now = -1,       // 下拉框当前元素的坐标
            self = {},          
            list_filter = [];   // 输入框过滤的数据列表
    function selectManager(params){
        this.init(params);
        this.handleEvents();
    };
    selectManager.prototype = {
        init : function(params){
            this.dropdown = document.getElementById(params.dropdown?params.dropdown:null),
            this.list_div = document.getElementById(params.list),
            this.list_ul = this.list_div.querySelector('.ul'),
            this.items= this.list_ul.querySelectorAll('.li'),
            this.show_input = document.getElementById(params.show_input),
            this.real_input = document.getElementById(params.real_input);
            self = this;

            var input_height = this.show_input.offsetHeight,
                    input_width = this.show_input.offsetWidth;
            this.list_div.style.top = input_height+'px';
            this.list_div.style.width = input_width + 'px';
            if(dropdown){
                dropdown.style.width = dropdown.style.height = input_height + 'px';
            }
        },

        handleEvents : function(){
            // 下拉按钮点击事件
            if(this.dropdown){
                module.addEvent(this.dropdown,'click',this.showList);
            }
            // 输入框获得焦点和点击事件
            module.addEvent(this.show_input,'focus',this.openSelect);

            // 输入框失去焦点事件
            module.addEvent(this.show_input,'blur',function(){
                // input的blur事件和下拉列表的click事件冲突，将下拉列表延后折叠收起，click事件才能够正常执行。
                setTimeout(function(){              
                    self.closeSelect();
                },200);
            });

            // 使用事件委托选择数据，将数据填入输入框，收起列表。
            module.addEvent(this.list_ul,'click',this.delegateSelect);

            // mouseover事件
            module.addEvent(this.list_ul,'mouseover',function(e){
                if(module.hasClass(e.target,'li')){
                    var active_li = self.list_div.querySelector('.active');
                    module.removeClass(active_li,'active');
                }
            });

            // 使用方向键选择数据
            module.addEvent(this.show_input,'keydown',this.arrowSelect);

            // 输入框搜索过滤功能
            module.addEvent(this.show_input,'keyup',this.inputFilter);
        },

        getEleIndex : function(list,class_name){        // 获取元素下标
            var index = -1;
            for(var i=0;i<list.length;i++){
                if(module.hasClass(list[i],class_name)){
                    index = i;
                    break;
                }
            }
            return index;
        },

        getKeycode : function(event){
            var keycode = -1;
            if(window.event){
                keycode = event.keyCode;
            } else {
               keycode = event.which;
            }
            return keycode;
        },

        openSelect : function(){                            // 展开下拉框
            self.real_input.value = self.show_input.value = '';
            for(var i=0;i<self.items.length;i++){
                module.removeClass(self.items[i],'hide');
            }
            list_filter = self.items;

            module.slideDown(self.list_div,'200',function(){
                module.addClass(self.list_div,'show');
                // 标记已选中的数据，并将滚动条定位到该数据位置
                var selected_index = self.getEleIndex(self.items,'selected');
                var offset_top = self.items[0].offsetHeight*(selected_index-1),
                        scroll_height = self.list_div.scrollHeight;
                self.list_ul.scrollTop = offset_top;
            });
        },
        closeSelect : function(){                           // 关闭下拉框
            var selected_index = this.getEleIndex(this.items,'selected');
            if(selected_index>=0){
                // 如果没有重新选择数据，将标记原先选中的数据，并记录该数据的位置
                var select_value = this.items[selected_index].textContent;
                this.real_input.value =this.show_input.value = select_value;
                next = selected_index+1;
                prev = selected_index-1;
                now = selected_index;
            }
                    
            module.slideUp(self.list_div,'200',function(){
                module.removeClass(self.list_div,'show');
                module.removeClass(self.list_ul.querySelector('.active'),'active');
            });
        },
        showList: function(event){                  
            if(!module.hasClass(self.list_div,'show')){
                self.openSelect();
            } else {
                self.closeSelect();
            }
        },
        delegateSelect : function(e){               // 选中数据的事件委托
            console.log('event');
            if(module.hasClass(e.target,'li')){
                e.stopPropagation();
                self.selectItem(e.target ? e.target: e.srcElement);
            }
        },
        selectItem:function(target){                // 选中数据后的操作，对数据进行标记并关闭下拉框
            //var notice = this.show_input.parentNode.querySelector('.notice');
            var selected =  module.siblings(target,'.selected');
            if(selected){
                module.removeClass(selected[0],'selected');
            }
            module.addClass(target,'selected');
            module.addClass(target,'active');
            //Slider.slideUp(notice,'100');

            this.closeSelect();
        },
        arrowSelect : function(e){                      // 使用键盘方向键选择数据事件
            var target = e.target;
            e.stopPropagation();
            var keycode = self.getKeycode(e);
            switch(keycode){
                case 40:                                        // 向下
                    if(!module.hasClass(self.list_div,'show')){
                        self.openSelect();
                    }
                    if(now >=0 && next!=list_filter.length){
                        module.removeClass(list_filter[now],'active');
                        prev = now;
                    }
                    if(next<list_filter.length){
                        var next_item = list_filter[next];
                        module.addClass(list_filter[next],'active');
                        now = next;
                        next += 1;
                        // 滚动条自动向上滚动
                        self.scrollUp(next_item);
                    }
                    break;
                case 38:                                        // 向上
                    if(now >0){ 
                        module.removeClass(list_filter[now],'active');
                        next = now;
                    }
                    if(prev >=0){
                        var prev_item = list_filter[prev];
                        module.addClass(list_filter[prev],'active');
                        now = prev;
                        prev -=1;
                        // 滚动条自动向下滚动
                        self.scrollDown(prev_item);
                    }
                    break;
                case 13:                                      // 回车选中数据
                    e.preventDefault();
                    self.selectItem(list_filter[now]);
                    self.show_input.blur();
                    break;
            }
        },
        scrollUp : function(next_item){       // 滚动条自动向上滚动
            var next_height = next_item.offsetHeight,
                    offset_top = next_item.offsetTop,
                    scroll_height = this.list_div.scrollHeight,
                    scroll_top = this.list_ul.scrollTop;
            if(offset_top+scroll_top >= scroll_height){
                this.list_ul.scrollTop += next_height;
            }
        },
        scrollDown : function(prev_item){       // 滚动条自动向下滚动
            var prev_height = prev_item.offsetHeight,
                    offset_top = prev_item.offsetTop,
                    scroll_height = this.list_div.scrollHeight,
                    scroll_top = this.list_ul.scrollTop;
            if(scroll_top >= offset_top){
                this.list_ul.scrollTop -= prev_height;
            }
        },
        inputFilter : function(e){
            var keycode = self.getKeycode(e);
            
            if(module.hasClass(self.list_div,'show')&&keycode!=13&&keycode!=37&&keycode!=38&&keycode!=39&&keycode!=40){
                var value = e.target.value,
                        reg = new RegExp(value,'i');
                // 搜索时数据更新，滚动条和方向标记位重置
                list_filter = [];
                self.list_ul.scrollTop = 0;
                next = 0,prev = -1,now = -1;
                // 对数据进行匹配
                for(var i=0;i<self.items.length;i++){
                    var coun = self.items[i].textContent || self.items[i].innerText;
                    if(!reg.test(coun)){
                        module.addClass(self.items[i],'hide');
                    } else {
                        list_filter.push(self.items[i]);
                        module.removeClass(self.items[i],'hide');
                    }
                }
            }
        }
    }
    return {
        select : function(params){
            var action = new selectManager(params);
        }
    };
})();


