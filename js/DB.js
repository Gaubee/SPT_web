(function($,global,undefined) {
	var BaseURL = "http://xnqg.51myqg.com/";
	heads = [
		"Fireworks.png",
		"Fish.png",
		"Frog.png",
		"Monkey.png",
		"Moon.png",
		"Owl.png",
		"Party Hat.png",
		"Penguin.png",
		"Sun.png",
		"Women.png"
	];

	$.getData = function (url, data, callback, type) {
		type = type || "GET";
		data = data || {};
		callback = callback||function(){};
		var result = null;
		$.ajax({
			// dataType: "json",
			url: BaseURL + url,
			data: data,
			cache: false,
			dataType: 'json',
			error: function (a,b) {
				alert("连接错误！");
			},
			success: function (newdata) {//先执行，并写入数据库
				result = newdata;
				// localStorage.setItem(url,newdata);
			},
			complete: function (a,b,c) {//执行回调函数
				global.err =  a;
				if (result) {//null or JsonData
						callback.call(this, result);
					// try{
					// 	callback.call(this, result);
					// }catch(e){
					// 	try{
					// 		var error = result.Error[0].describe;
					// 		alert(error);
					// 	}catch(e){
					// 		alert("操作失败！");
					// 	}
					// }
				}
			},
			type: type
		});
		return result;
	}

	global.DB = {
		Login:function(ac,ps,callback,errFun){
			var result,
			format = function(Sdata){
				try{
					var formatData = Sdata.Login[0];
					callback(formatData);
				}catch(e){
					errFun(Sdata);
				}
			};
			callback = callback ||function(formatData){
				alert("登录成功,"+formatData.name);
			};
			$.getData("Sign/Login.ashx",
				{
					Type:1,
					RegisterNum:ac,
					Password:ps
				},
				format
			);
			return result;
		},
		Get:{
			StudentList:function (teacherId,foo) {
                var url = "teacher/GetStudentList.ashx";
				var urlData = teacherId?{Pid:teacherId,Len:100000}:{Len:100000};
                $.getData(url,urlData,function(data){
					var _super = data;
					var formattedData = [];
					var StudentList = data. StudentList;
					var Length = StudentList.length;
					for (var i=0;i<Length ; ++i)
					{
						var student = StudentList[i];
						formattedData[i]={
							id: student.uid.trim(),
							Name: student.name.trim(),
							TeacherID: student.parentid.trim(),
							Phone: student.phone.trim(),
							Logining: (student.logining==1?true:false),
							RegisterNum: student.registernum.trim(),
							Password: student.password.trim(),
							Score: student.score.trim(),
							Evaluate: student.contents.trim()||"暂无评价",
							img: student.img.trim()||"img/res/"+heads[(parseInt(student.uid)%heads.length)],
							Department:student.department.trim(),
							Major:student.major.trim(),
							Grade:student.grade.trim(),
							Sid:student.sid.trim(),
							LastLoginTime:student.begintime.trim(),
						}

					}
					if (foo){
						foo(formattedData);
					}
				});
            },
			StudentSignInMessage:function (StudentId,beginTime,endTime,foo) {
                var url = "Student/GetSignMessage.ashx";
                // var b = new Date,e = new Date;
                // b.setDate(b.getDate()-beginTime);
                // e.setDate(e.getDate()-endTime);
                // b =	(1900+b.getYear()) +"-"+ (b.getMonth()+1) +"-"+ b.getDate();
                // e =	(1900+e.getYear()) +"-"+ (e.getMonth()+1) +"-"+ e.getDate();

                $.getData(url,{
                		Id:StudentId,
                		BeginTime:beginTime,//b,
                		EndTime:endTime//e
                	},function(result){
                	var formattedData = [];
                	result = result.T_SignMessageList;
                	for (var i = result.length - 1; i >= 0; i--) {
                		var sign = result[i];
                		formattedData[i] = {
                			id:sign.id.trim(),
                			BeginTime:sign.begintime.trim(),
                			EndTime:sign.endtime.trim(),
                			Gain:sign.gain.trim()||20,
                		}
                	};
                	if(foo){
                		foo(formattedData);
                	}
                });
            }
		},
		Set:{
			StudentGain:function(signMes,foo){
        		var url = "Sign/ModifySign.ashx";
			    /// ModifySign 修改签到表各数据
			    /// 权限：用工部门以上权限
			    /// 需要：T_Sign需要更改的参数（id除外）
			    /// 执行：修改SId下信息
			    var data = {
			    	id:signMes.id,
			    	gain:signMes.Gain,
			    }
			    $.getData(url,data,function(result){
			    	var formattedData = {};
			    	if (foo) {
			    		foo(formattedData);
			    	};
			    })
        	},
			SignIn:function(Tid,Sid,foo){
				var url = "Sign/Sign.ashx";
				$.getData(url,{Tid:Tid,Sid:Sid},function(data){
					var formattedData = {}
					var signMes = data.T_Sign[0];
					formattedData = {
						//Gain:signMes.gain.trim(),
						Sid:signMes.id.trim(),
						LastLoginTime:signMes.begintime.trim(),
					}
					if (foo) {
						foo(data);
					};
				})
			},
			SignOut:function(sid,foo){
				var url = "Sign/SignExit.ashx";
				$.getData(url,{id:sid},function(data){
					var formattedData = {}
					var signMes = data.T_Sign[0];
					formattedData = {
						Gain:signMes.gain.trim(),
					}
					if (foo) {
						foo(data);
					};
				})
			}
		}
	}	
})(jQuery,window);