$(document).ready(function () {
	var inc = 0, nomList = [];
	
	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
		$('#content-wrapper').toggleClass('active');
		
		if (!$('#sidebar').hasClass('active')) {
			/*$('#demo').append("Sidebar Active Check, ");*/
			$('.sidebar-content').html("");
			
			if (inc > 0) {
				for (var i = 0; i < inc; i++) {
					$.ajax({
						url: "http://omdbapi.com/?apikey=2d27a174&type=movie&r=xml&i=" + nomList[i],
						dataType: "xml",
						success: function(xml) {
							var rsp = $(xml).find('movie');
							var comp = rsp.attr('imdbID');
							var txt = "<article><hr><img src="+rsp.attr('poster')+" /><br>"+rsp.attr('title')+" ("+rsp.attr('year')+")<br>"+comp+
							  "<br><button class=\"btn btn-sm btn-warning discommend\" name="+comp+">Discommend</button></article>";
							var idx;
							
							$('.sidebar-content').append(txt);
							$('.discommend').on('click', function () {
								$(this).parent().remove();
								for (var j = 0; j < nomList.length; j++) {
									if (nomList[j] == comp) {
										nomList.splice(j, 1);
										inc--;
										break;
									}
								}
							});
						}
					});
				}
				
			}
			else {
				$('.sidebar-content').html("No Nominees Yet");
			}
		}
	});
	
	$('#search').keyup(function () {
		var ulink = "http://omdbapi.com/?apikey=2d27a174&type=movie&r=xml&" + $("form").serialize();
		
		/*$('#demo').append("Keystroke Check, ");*/
		$.ajax({
			url: ulink,
			dataType: "xml",
			success: function(xml) {
				var root = $(xml).find('root');
				var rsp = root.attr('response');
				var holder, comp, txt = "";
				
				$('#demo').append($(root).attr('response')+", ");
				
				if (rsp == false) {
					$('#ttl-rslts').html("0 Results");
					$('#result').html($(xml).find('error').html());
				}
				else if (rsp == true) {
					$('#ttl-rslts').html(root.attr('totalResults') + " Results");
					holder = $(xml).find('result');
					for (var i = 0; i < holder.length; i++) {
						var j;
						
						comp = holder.eq(i).attr('imdbID');
						txt += "<article><hr><div><img src="+holder.eq(i).attr('poster')+" /><table><tr><td><b>Title: </b>"+holder.eq(i).attr('title')+
						  "</td><td rowspan=\"3\">";
						for (j = 0; j < inc; j++) {
							if (comp == nomList[j]) {
								txt += "<button class=\"btn btn-outline-warning nominate\" name="+comp+">Nominate</button>";
								break;
							}
						}
						if (comp != nomList[j]) {
							txt += "<button class=\"btn btn-warning nominate\" name="+comp+">Nominate</button>";
						}
						txt += "</td></tr><tr><td><b>IMDb ID: </b>"+comp+"</td></tr><tr><td><b>Year: </b>"+holder.eq(i).attr('year')+
						  "</td></tr></table></div></article>";
					}
					$('#result').html(txt);
					
					$('.nominate').on('click', function () {
						if (inc < 5) {
							nomList[inc++] = $(this).attr('name');
							$(this).attr('disabled', true);
							$(this).toggleClass('btn-warning btn-outline-warning');
						}
					});
				}
			}
		});
	});
});

