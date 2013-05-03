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
		setUserInfo,
		// student_sign_in = $("a[href$=#student_sign_in]"),
		student_sign_in_content = $("#student_sign_in"),
		refreshSignData,
		drawPlan,
		student_sign = $("#student_sign_message_content"),
		SignIn,
		SignOut,
		login_frame = $("#login-frame .login-frame"),
		Login_out = $("#Login_out")
		;
	login_frame.on("click",".bt",function(){
		var RegisterNum = login_frame.find(".action").val(),
			Password = login_frame.find(".password").val();
		global.LOGIN(RegisterNum,Password);

	});
	login_frame.on("focus","input",function(){
		var self = $(this);
		self.css({"borderColor":"#f1c606"});
	}).on("blur","input",function(){
		var self = $(this);
		self.css({"borderColor":""});
	})
	Login_out.on("click",function(){
		$("#login-frame").css({
			"display":"block"
		});
		login_frame.find(".password").val("");
		$("#login-frame").animate({
				"opacity":1
		},200);
	})

	appendUserTab = function(sid,title,active){
		id = 'sign_message_'+sid;
		var newTab = $("a[href$=#"+id+"]"),DOM;
		// alert("a[href=#"+id+"]");
		if (!newTab.length) {
			newTab = student_sign_message_tabs.append('<li><a href="#'+id+'">'+title+'</a><span class="colse">×</span></li>');
			DOM = $('<div class="student-sign-message-content" id="'+id+'"></div>');//new Dom
			student_sign_message_content.append(DOM);
			setUserInfo(DOM,global.GetStudentMessage(sid));//Init user info

			var end_time = DOM.find(".time-end"),
				star_time = DOM.find(".time-star"),
				end_time_text,
				star_time_text
				;

			var now = new Date;

			now.setDate(now.getDate()+1);
			end_time_text = (now.getYear()+1900)+"-"+(now.getMonth()+1)+"-"+now.getDate();

			now.setDate(now.getDate()-7);
			star_time_text = (now.getYear()+1900)+"-"+(now.getMonth()+1)+"-"+now.getDate();

			end_time.attr("title",end_time_text).find(".time-text").html(end_time_text);
			star_time.attr("title",star_time_text).find(".time-text").html(star_time_text);

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

		userInfo.find("img").attr({"src":Data.img,"title":Data.id});
		userInfo.find(".name").html(Data.Name);
		userInfo.find(".department").html(Data.Department);
		userInfo.find(".major").html(Data.Major);
		userInfo.find(".student-id").html(Data.RegisterNum);
		userInfo.find(".content").html(Data.Evaluate);

		// console.log(Data)
		global.GetStudentSignMessage(Data.id,function(data){
			// // console.log(data);
			refreshSignData(DOM,data);

		})
		//登录信息-滚动
		scoreList = DOM.find(".score-list");
		scoreList.jScrollPane({showArrows: true});
		scoreList_api = scoreList.data('jsp');
		window.resize(function(){
			scoreList_api.reinitialise();
		});
	};
	refreshSignData = function(DOM,data){
		var SignHTML = "",
			i,
			bt,
			et,
			signMes
			;
		for (i = data.length-1; i >=0; --i) {
			signMes = data[i];

			bt = signMes.BeginTime.split(":");
			// $.each(bt,function(i,val){
			// 	if (val.length===1) {
			// 		bt[i] = "0"+bt[i];
			// 	};
			// })
			delete bt[bt.length-1];
			bt = bt.join(":");
			bt = bt.substring(0,bt.length-1);

			et = signMes.EndTime.split(":");
			// $.each(et,function(i,val){
			// 	if (val.length===1) {
			// 		et[i] = "0"+et[i];
			// 	};
			// })
			delete et[et.length-1];
			et = et.join(":");
			et = et.substring(et.indexOf(' ')+1,et.length-1);

			SignHTML+='<li>'+
				'<span class="time"><span class="time-star">'+
					bt+
					'</span>~<span class="time-end">'+
					et+'</span></span>'+
				// '<span class="time">'+signMes.BeginTime.substring(5,signMes.BeginTime.length-3)+'~'+signMes.EndTime.substring(signMes.EndTime.indexOf(' ')+1,signMes.EndTime.length-3)+'</span>'+
				'<span class="score">'+
					'<input class="spinner" title="'+signMes.Gain+'" value="'+signMes.Gain+'" disabled="disabled"></input>'+
					'<input type="hidden" class="score-id" value="'+signMes.id+'"></input>'+
					'<input type="button" class="score-to-control" value="评分"></input>'+
				'</span>'+
			'</li>'
		};


		var scoreList = DOM.find(".score-list");

		scoreList.html(SignHTML);


		//redraw plan
		drawPlan(DOM);

			// var scoreList = DOM.find(".score-list");
		scoreList.data('jsp').destroy();
		DOM.find(".score-list").html(SignHTML).jScrollPane({showArrows: true});
	};
	drawPlan = function(idorDOM) {
		// // console.log(DOM.find(".score-list").find("li"));
		// // console.log(DOM.attr("id"));
		var DOM;
		if (typeof idorDOM === "object") {
			DOM = idorDOM;
		}else{
			DOM = $("#sign_message_"+id);
		};
		var score_list = DOM.find(".score-list").find("li"),
		li,
		column = "",
		plan = DOM.find(".column-chart-svgs"),
		time_star = DOM.find(".time-star .time-text").text().split("-"),
		time_end = DOM.find(".time-end .time-text").text().split("-"),
		T_s = new Date(0),
		T_e = new Date(0),
		W,
		H,
		N,
		i,
		oneDay = 1000*60*60*24,
		// li_time,
		T_li_s = new Date(0),
		T_li_e = new Date(0),
		li_time_star,
		li_time_star_date,
		li_time_star_time,
		// li_time_end,
		// li_time_end_date,
		li_time_end_time,
		time_dis,
		time_max = 0,
		format_time = [],
		d,
		delay,
		gain,
		j,
		per_column
		;

		T_s.setYear(time_star[0]);
		T_s.setMonth(time_star[1]);
		T_s.setDate(time_star[2]);
		T_e.setYear(time_end[0]);
		T_e.setMonth(time_end[1]);
		T_e.setDate(time_end[2]);

		W = plan.width();
		H = plan.height();
		N = (T_e - T_s)/oneDay;//相差天数
		for (i = score_list.length - 1; i >= 0; i--) {
			li = $(score_list[i]);
			li_time_star = li.find(".time-star").text().split(" ");
			li_time_star_date = li_time_star[0].split("-");
			li_time_star_time = li_time_star[1].split(":");
			li_time_end_time = li.find(".time-end").text().split(":");
			T_li_s.setYear(li_time_star_date[0]);
			T_li_s.setMonth(li_time_star_date[1]);
			T_li_s.setDate(li_time_star_date[2]);

			T_li_s.setHours(0);
			T_li_s.setMinutes(0);

			d = parseInt((T_li_s-T_s)/oneDay);

			T_li_e.setTime(T_li_s);
			T_li_e.setHours(li_time_end_time[0]);
			T_li_e.setMinutes(li_time_end_time[1]);

			T_li_s.setHours(li_time_star_time[0]);
			T_li_s.setMinutes(li_time_star_time[1]);

			delay = T_li_e -T_li_s;
			delay = delay||50;
			gain = parseInt((li.find(".spinner").val()/100)*255);
			gain = gain.toString(16);
			if(gain.length === 1){
				gain = "0"+gain;
			}
			gain = "76A6"+gain;
			if(!format_time[d]){//is undefined
				format_time[d] = {
					total:delay,
					data:[{
							delay:delay,
							gain:gain
						}]
				};
			}else{//same day muli part-time job
				format_time[d].total += delay;
				format_time[d].data[format_time[d].data.length] = {
					delay:delay,
					gain: gain
				}
			}
			if (format_time[d].total>time_max) {
				time_max = format_time[d].total;
			};
		};
		// 收集信息完毕，开始绘制图
		time_max *= 1.2;
		time_max = time_max/100;
		N=100/N;
		for (i = 0;i < format_time.length; i+=1) {
			column += '<div class="column" style="width:'+N+'%;height:100%;">';
			if (format_time[i]) {
				for (j = format_time[i].data.length - 1; j >= 0; j--) {
					per_column = format_time[i].data[j];
					// // console.log(per_column)
					column += '<div style="height:'+per_column.delay/time_max+'%;background-color:#'+per_column.gain+'"></div>';
				};
			}
			column += '</div>';
		};
		// console.log(format_time)
		DOM.find(".column-chart-svgs").html(column);
	};
	SignIn = function(){}
	SignOut = function(){}
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
		// setUserInfo(content,global.GetStudentMessage(id));
	});
	search_result.on("mouseover","li",function(){
		$(this).addClass("hover");
	}).on("mouseout","li",function(){
		$(this).removeClass("hover");
	})
	student_sign_in_content.jScrollPane({showArrows: true});
	var student_sign_in_content_api = student_sign_in_content.data('jsp');
	window.resize(function(){
		student_sign_in_content_api.reinitialise();
	});
	/*+student_list*/
	// student_list.jScrollPane({showArrows: true});
	// student_list_api = student_list.data('jsp');
	// window.resize(function(){
	// 	student_list_api.reinitialise();
	// });
	student_list.on("click","a.in",function(){
		var self = $(this),
			id,
			userName,
			studentId,
			li
			;
		li = self.parent().parent();
		id = li.find("img").attr("title");
		// userName = li.find(".name").html();
		// studentId = li.find(".name").attr("title");
		// student_sign_in.click();
		// student_sign_in_content.find(".register-num").val(studentId);
		// console.log(id);
		DB.Set.SignIn(global.Did,id,function(){
			self.removeClass("in").addClass("out").html("签退");
		});
	});
	student_list.on("click","a.out",function(){
		var self = $(this),
			id,
			li
			;
		li = self.parent().parent();
		// id = li.find("img").attr("title");
		Sid = li.find(".Sid").val();

		DB.Set.SignOut(Sid,function(){
			self.removeClass("out").addClass("in").html("签到");
		});
	})
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
		// setUserInfo(content,global.GetStudentMessage(id));
	});
	/*-student_list*/

	/*+time select*/
	student_sign_message_content.on("click",".time-text",function(event){
		var self = $(this).parent(),
			time,
			self,
			DOM;
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

				//update sign message list
					DOM = self.parent().parent().parent().parent();//.parent();
					
					var id = DOM.attr("id").substring(13);
					// console.log(id);
					global.GetStudentSignMessage(id,function(data){
						// // console.log(data);
						refreshSignData(DOM,data);
					})

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
			// global.XX= self;
		column_chart = self.parent().parent();
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

		// drawPlan(self.parent().parent().parent())
		var DOM = self.parent().parent().parent().parent();
		global.GetStudentSignMessage(DOM.attr("id").substring(13),function(data){
			// // console.log(data);
			refreshSignData(DOM,data);
		})
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
					//update student gain
					DB.Set.StudentGain({
						id:self.find(".score-id").val(),
						Gain:new_score
					},function(data){
						//redraw culomn plan
						global.zz = self;
						drawPlan(self.parent().parent().parent().parent().parent().parent());
					});
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
	});
	/*-score*/ 

	/*+sign in*/
	// student_sign.on("click",".sign-in",function(){
	// 	var self = $(this),
	// 		sign_form,
	// 		r,
	// 		p
	// 		;
	// 		sign_form = self.parent();
	// 		r = $.trim(sign_form.find(".register-num").val());
	// 		p = sign_form.find(".password");
	// 		DB.Set.SignIn(global.Did,);
	// })
	/*-sign in*/

	/*+response*/
	response = function(){
		var body_width = body.width();
		if (body_width<=800) {
			if (body_width!==head.width()) {
				head.css({"width":"100%"});
				content.css({"width":"100%"});
				foot.css({"width":"100%"});
			};
		}else if(body_width<=960)
		{
			head.css({"width":"89%"});
			content.css({"width":"89%"});
			foot.css({"width":"89%"});
		}else{
			head.css({"width":"960px"});
			content.css({"width":"960px"});
			foot.css({"width":"960px"});
		};
	};
	window.resize(response);
	response();
	/*-response*/

	global.initTabs($('#student_sign_message_tabs'));

	setTimeout(function(){
		window.resize();///window onload;
	},20)
})(jQuery,window);