(function($,global,undefined) {
	var body = $("body"),
		window = $(global),
		head= $("#head"),
		content = $("#content"),
		foot = $("#foot"),
		response,
		search_text = $("#search_text"),
		search_result = $("#search_result"),
		student_list = $('#student_list_ul'),
		student_list_api,
		student_sign_message_tabs = $("#student_sign_message_tabs"),
		student_sign_message_content = $("#student_sign_message_content"),
		scoreSpinOpts = {
			max:100,
			min:1
		},
		appendUserTab,
		UserInfoModelView = $("#sign_message"),
		setUserInfo;

	appendUserTab = function(id,title,active){
		id = 'sign_message_'+id;
		var newTab = $("a[href$=#"+id+"]");
		// alert("a[href=#"+id+"]");
		if (!newTab.length) {
			newTab = student_sign_message_tabs.append('<li><a href="#'+id+'">'+title+'</a><span class="colse">*</span></li>');
			student_sign_message_content.append('<div class="student-sign-message-content" id="'+id+'"></div>');
		
			if (active) {
				newTab.find("li:last-child a").click();
			};
		}else{
			newTab.click();
		};	
		return id;
	};
	setUserInfo = function(DOM,Data){
		Data = Data||{
			/*Default info*/
		}
		DOM.html(UserInfoModelView.html());
		var userInfo = DOM.find(".student_info");


		userInfo.find("img").attr("src",Data.img);
		userInfo.find(".name").html(Data.name);
		userInfo.find(".department").html(Data.department);
		userInfo.find(".major").html(Data.major);
		userInfo.find(".student-id").html(Data.studentId);
		userInfo.find(".content").html(Data.content);

		scoreList = DOM.find(".score-list");
		scoreList.jScrollPane({showArrows: true});
		scoreList_api = scoreList.data('jsp');
		window.resize(function(){
			scoreList_api.reinitialise();
		});
	};
	search_result.refresh = function(){
		var listext = "";
		var filter = $.trim(search_text.val());
		$.each(student_list.find("li"),function(i,n){
			n = $(n);
			var name = $.trim(n.find(".name").html()).split(""),is;
			$.each(name,function(i,key){
				if (filter.indexOf(key) !== -1) {
					is = true;
					name[i] = '<b>'+key+'</b>';
				};
			});
			if (is||filter==="") {
				listext+='<li title="'+n.find("img").attr("title")+'">'+name.join("")+'</li>';
			};
		});
		this.html(listext);
	};
	search_result.out = function(time){
		if (time) {
			this.animate({
				opacity:0,
				zIndex:-1
			},time);
		}else{
			this.css({
				opacity:0,
				zIndex:-1
			})
		};
	};
	search_result.into = function (time){
		if (time) {
			this.animate({
				opacity:1,
				zIndex:1
			},time);
		}else{
			this.css({
				opacity:1,
				zIndex:1
			})
		};
	};

	/*+init*/
	search_result.out();
	(function(){
		var search_text_offset = search_text.offset();

		search_result.css({
			left:search_text_offset.left-80,
			top:search_text_offset.top+30//不能有逗号，IE6 会报错
		});
		search_result.refresh();
	})();
	/*-init*/
	search_text.on("focus",function(event){
		search_text.stop().css({
			width:"120px"
		})
		var search_text_offset = search_text.offset();
		search_text.animate({
			width:"200px"
		});
		search_result.stop().into(200);
		search_result.css({
			left:search_text_offset.left-80,
			top:search_text_offset.top+30//不能有逗号，IE6 会报错
		});
		search_result.refresh();
	});
	search_text.on("blur",function(event){
		search_text.stop().animate({
			width:"120px"
		});
		setTimeout(function(){
			search_result.stop().out(200);
		},0);
	});
	search_text.time = 0;
	search_text.on("keydown",function(){
		clearTimeout(search_text.time);
		search_text.time = setTimeout(function(){
			search_result.refresh();
		},200);
	});
	// search_result.on("mouseover",function(){
	// 	search_result.addClass("seleting");
	// });
	// search_result.on("mouseout",function(){
	// 	search_result.removeClass("seleting");
	// 	search_result.hide(200);
	// });
	search_result.on("click","li",function(){
		var self = $(this);
		var userName = self.text();
		var id = self.attr("title");
		search_text.val(userName);
		var content = $("#"+appendUserTab(id,userName,true));
		setUserInfo(content);
	});
	search_result.on("mouseover","li",function(){
		$(this).addClass("hover");
	}).on("mouseout","li",function(){
		$(this).removeClass("hover");
	})
	/*+student_list*/
	student_list.jScrollPane({showArrows: true});
	student_list_api = student_list.data('jsp');
	window.resize(function(){
		student_list_api.reinitialise();
	});
	student_list.on("dblclick","li",function(){
		var self = $(this),
			// head,
			userName,
			id;
		id = self.find("img").attr("title");
		userName = self.find(".name").html();
		var content = $("#"+appendUserTab(id,userName,true));
		//set User Data;
		//content.html("???????");
		setUserInfo(content);
	})
	/*-student_list*/

	/*+time select*/
	student_sign_message_content.on("click",".time-text",function(event){
		var self = $(this).parent(),
			time;
			self;
		time = self.attr("title");
		if (self.hasClass("seleting")) {
			self.datepicker("destroy");
			self.removeClass("seleting");
			self.html('<span class="time-text">'+time+'</span>');
		}else{
			self.datepicker({
				"dateFormat":"yy-mm-dd",
				"defaultDate":time,
				"monthNames":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
				"dayNamesMin":["日","一","二","三","四","五","六"],
				"buttonImageOnly":true,
				"prevText":"",
				"nextText":"",
				"onSelect":function(event){
					var currentDate = self.datepicker( "getDate" );
					time = (currentDate.getYear()+1900) + '-' + (currentDate.getMonth()+1) + '-' + currentDate.getDate()
					self.attr("title",time);
					self.datepicker("destroy");
					self.removeClass("seleting");
					self.html('<span class="time-text">'+time+'</span>');
				}
			});
			global.widget =  self.find(".ui-datepicker-inline").draggable();//.datepicker("widget");
			self.addClass("seleting");
		};
	});

	student_sign_message_content.on("click",".date-control",function(){
		var self = $(this),
			column_chart,
			date = new Date,
			time_star,
			time_end,
			time_star_text,
			time_end_text,
			y,
			m,
			d;

		column_chart = self.parent()
		time_star = column_chart.find(".time-star");
		time_end = column_chart.find(".time-end");
		time_star_text = time_star.attr("title").split("-");
		time_end_text = time_end.attr("title").split("-");


		if (self.hasClass("advance")) {

			y = time_star_text[0];
			m = time_star_text[1];
			d = time_star_text[2];
			date.setYear(y);
			date.setMonth(m-1);
			date.setDate(d-(-7));
			time_star_text = (date.getYear()+1900) + '-' + (date.getMonth()+1) + '-' + date.getDate();
			
			y = time_end_text[0];
			m = time_end_text[1];
			d = time_end_text[2];
			date.setYear(y);
			date.setMonth(m-1);
			date.setDate(d-(-7));
			time_end_text = (date.getYear()+1900) + '-' + (date.getMonth()+1) + '-' + date.getDate();

		}else if(self.hasClass("postpone")){

			y = time_star_text[0];
			m = time_star_text[1];
			d = time_star_text[2];
			date.setYear(y);
			date.setMonth(m-1);
			date.setDate(d-7);
			time_star_text = (date.getYear()+1900) + '-' + (date.getMonth()+1) + '-' + date.getDate();
			
			y = time_end_text[0];
			m = time_end_text[1];
			d = time_end_text[2];
			date.setYear(y);
			date.setMonth(m-1);
			date.setDate(d-7);
			time_end_text = (date.getYear()+1900) + '-' + (date.getMonth()+1) + '-' + date.getDate();
			
		};
		time_star.attr("title",time_star_text);
		time_star.find(".time-text").html(time_star_text);
		time_end.attr("title",time_end_text);
		time_end.find(".time-text").html(time_end_text);

	});
	/*-time select*/

	/*+score*/ 
	student_sign_message_content.on("click",".score-list .score .score-to-control",function(event){
		var self = $(this).parent(),input;
			input = self.find(".spinner");
		if (self.hasClass("editing")) {
			var new_score = input.val(),
				old_score = input.attr("title");
			if (new_score !== old_score) {
				if (confirm("save the score?")) {
					input.attr("title",new_score);
				}else{
					input.val(old_score);
				};
			};
			input.spinner("destroy");
			input.attr("disabled","disabled");
			self.find(".score-to-control").val("评分");
			self.removeClass("editing");
		}else{
			self.find(".spinner").spinner(scoreSpinOpts);
			input.attr("disabled",false);
			self.find(".score-to-control").val("确定");
			self.addClass("editing");
		};
	})
	/*-score*/ 

	/*+response*/
	response = function(){
		var body_width = body.width();
		if (body_width<=800) {
			if (body_width!==head.width()) {
				head.css({"width":"100%"});
				content.css({"width":"100%"});
				foot.css({"width":"100%"});
			};
		}else{
			if (body_width === head.width()) {
				head.css({"width":"80%"});
				content.css({"width":"80%"});
				foot.css({"width":"80%"});
			};
		};
	}
	window.resize(response);
	response();
	/*-response*/

	global.initTabs($('#student_sign_message_tabs'));

	setTimeout(function(){
		window.resize();///window onload;
	},20)
})(jQuery,window);