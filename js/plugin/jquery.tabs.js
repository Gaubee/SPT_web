(function($,global,undefined) {
	$(function(){
		var body = $('body');
		body.on('click', '.tabs li a[href*=#]', function(e) {
			var self = $(this);
			var li = self.parent();
			var content = self.attr('href').split("#");
			content = "#"+content[content.length-1]
			li.parent().find(".active").removeClass("active");
			li.addClass("active");
			$(".tab-content-show").addClass("tab-content-hide").removeClass("tab-content-show");
			$(content).removeClass("tab-content-hide").addClass("tab-content-show");
		});
		body.on('click', '.tabs li span.colse', function(e) {
			var self = $(this);
			var li = self.parent();
			var ul = li.parent();
			var content = li.find('a[href^=#]').attr('href');
			li.remove();
			$(content).remove();
			ul.find("li:last-child a").click();
		});

	});
	global.initTabs = function(tabs){
		var tabs = tabs||$(".tabs");
		var contents = tabs.find("li a[href^=#]");
		for (var i = 0; i < contents.length; i++) {
			$($(contents[i]).attr("href")).addClass("tab-content-hide");
		};
		var show_content = tabs.find("li.active a[href^=#]").attr("href");
		$(show_content).removeClass("tab-content-hide").addClass("tab-content-show");
	}
})(jQuery,window);