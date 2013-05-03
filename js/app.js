(function($,global,undefined) {
	var RegisterNum = "123",
		Password = "123";
	global.Dname = "";
	global.Did = 0;
	global.StudentList = [];

	global.LOGIN = function(RegisterNum,Password){
		DB.Login(RegisterNum,Password,function(data){
			console.log(data);
			$("#admin_name").html(data.name);
			$("#admin_teacher").html(data.responsibleteacher);
			$("#admin_phone").html(data.phone);
			// $("admin_head_photo").attr("title",data.img);
			global.Dname = data.name;
			global.Did = parseInt(data.uid);
			// alert("welcome "+data.name);
			afterLogin();
			$("#login-frame").animate({
				"opacity":0
			},2000,function(){
				$("#login-frame").css({
					"display":"none"
				})
			});
		},function(errData){
			try{
				alert(errData.Error[0].describe);
			}catch(e){
				alert("请检查账号密码！");
			}
		});
	}

function afterLogin () {
	// body...
	DB.Get.StudentList(
		global.Did,
		function(data){
			global.StudentList = data;
			var student_list_ul_inner = "";
			for (var i = 0,Length = data.length; i < Length; i++) {
				student_list_ul_inner += '<li class="one_student">'+
					'<img title="'+data[i].id+'" src="'+data[i].img+'">'+
					'<div class="one_student_info">'+
					'<span class="name" title="'+data[i].RegisterNum+'">'+data[i].Name+'</span>'+
					'<input type="hidden" class="Sid" value="'+data[i].Sid+'" />'+
					'<hr/>'+
					'<span class="department">'+data[i].Department+'</span>'+
					(data[i].Logining?'<a class="out" href="#">签退</a>':'<a class="in" href="#">签到</a>')+
					'</div>'+
					'</li>'
			};
			var student_list = $("#student_list_ul").html(student_list_ul_inner);
			student_list.jScrollPane({showArrows: true});
			student_list_api = student_list.data('jsp');
			$(global).resize(function(){
				student_list_api.reinitialise();
			});
		}
	);

	global.GetStudentMessage = function(id){
		var data = global.StudentList;
		for (var i = 0 , Length = data.length , StudentMes; i < Length; i++) {
			// console.log(data[i].id+"|"+id)
			if(data[i].id == id){
				return data[i];
			}
		};
	};

	global.GetStudentSignMessage = function(studentId,foo){
		// console.log(studentId);
		var DOM = $("#sign_message_"+studentId);

		var star_time = DOM.find(".time-star .time-text").text();
		var end_time = DOM.find(".time-end .time-text").text();
		// console.log(star_time);
		// console.log(end_time);
		DB.Get.StudentSignInMessage(studentId,star_time,end_time,foo);
	}
}



})(jQuery,window);