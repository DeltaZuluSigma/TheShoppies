$(document).ready(function () {
	// Nomination List Tracker
	const nomList = [];
	// Scroll Lock Variables
	var topScroll = false, bttmScroll = false, triggered = false;
	
	// Hide banner max nomination count
	$('.alert').hide();
	
	/***Functions***/
	
	/* searchResults Function
	   - Provides search results according to parameters
	*/
	function searchResults(ulink, ele, page) {
		$.ajax({
			url: ulink + "&page=" + page,
			dataType: "xml",
			success: function(xml) {
				if ($(xml).find('root').attr('response') == "False") {
					bttmScroll = false;
				}
				else if ($(xml).find('root').attr('response') == "True") {
					var txt = "";										// Displaying HTML Variable
					var rslts = $(xml).find('result');
					
					// Search Results Adding Loop
					for (var i = 0; i < rslts.length; i++) {
						var comp = rslts.eq(i).attr('imdbID');					// IMDb ID Comparing Variable
						var cth = rslts.eq(i).attr('poster');					// Poster Catching Variable
						var j;													// Nomination List Check Loop Variable
						
						if ((i % 2) == 1) {
							txt += "<article><div class=\"odd\">"
						}
						else {
							txt += "<article><div>"
						}
						
						// Poster Catch
						if (cth == undefined) {
							txt += "<img src=\"css/images/blank.png\" />";
						}
						else {
							txt += "<img src="+rslts.eq(i).attr('poster')+" />";
						}
						
						txt += "<table><tr><td><b>Title: </b>"+rslts.eq(i).attr('title')+"</td><td rowspan=\"3\">";
						
						// Nomination List Check Loop & Condition
						for (j = 0; j < nomList.length; j++) {
							if (comp == nomList[j]) {
								txt += "<button class=\"btn btn-warning nominate\" disabled=\"disabled\" name="+comp+">Nominate</button>";
								break;
							}
						}
						if (comp != nomList[j]) {
							txt += "<button class=\"btn btn-warning nominate\" name="+comp+">Nominate</button>";
						}
						
						txt += "</td></tr><tr><td><b>IMDb ID: </b>"+comp+"</td></tr><tr><td><b>Year: </b>"+rslts.eq(i).attr('year')+
						  "</td></tr>";
						
						if (comp == nomList[j]) {
							txt += "<tr class=\"response\"><td><button class=\"btn btn-warning nominate\" disabled=\"disabled\" name="+comp+
							  ">Nominate</button></td></tr>";
						}
						else {
							txt += "<tr class=\"response\"><td><button class=\"btn btn-warning nominate\" name="+comp+">Nominate</button></td></tr>";
						}
						
						txt += "</table></div></article>";
					}
					
					// Display Search Results
					$('#srch-rslt-'+ele).html(txt);
					$('#srch-rslt-'+ele).attr('name', page);
					if (Number($('#srch-rslt-1').attr('name')) > 1) { topScroll = true; }
					else { topScroll = false; }
					if (Number($('#srch-rslt-3').attr('name')) < Math.ceil(Number($(xml).find('root').attr('totalResults')) / 10.0)) { bttmScroll = true; }
					else { bttmScroll = false; }
					
					// Establish Module Button Functionality
					$('.nominate').on('click', function () {
						var single = true;
						
						// Duplicate Insertion Checking Loop
						for (var i = 0; i < nomList.length; i++) {
							if (nomList[i] == $(this).attr('name')) {
								single = false;
							}
						}
						
						// Filled Nomination List Detection
						if (single && (nomList.length < 5)) {
							// Add Nominee
							nomList.push($(this).attr('name'));
							
							// Max Nominees Banner Check
							if (nomList.length >= 5) {
								$('.alert').html("You have selected 5 nominations, remove a nomination or submit your nominations to continue.");
								$('.alert').fadeTo(3000, 500).slideUp(1000);
							}
							$(this).attr('disabled', true);
						}
						else if (nomList.length >= 5) {
							// Max Nominees Banner
							$('.alert').html("You have selected 5 nominations, remove a nomination or submit your nominations to continue.");
							$('.alert').fadeTo(3000, 500).slideUp(1000);
						}
					});
				}
			}
		});
	}
	
	/***Event Listeners***/
	
	/* sidebarCollapse Event Listener & Function
	   - On click of the button the sidebar toggles being collapsed
	   - On open of sidebar, the nomination list data is displayed
	*/
	$('#sidebarCollapse').on('click', function () {
		// Collapse Class Toggle
		$('#sidebar').toggleClass('active');
		$('#content-wrapper').toggleClass('active');
		$('.alert').toggleClass('active');
		$('#demo').html(nomList);
		
		// Detect Sidebar Active Display
		if (!$('#sidebar').hasClass('active')) {
			$('.sidebar-content').html("");					//Clear Previous Nomination List
			
			// Detect Chosen Nominees
			if (nomList.length > 0) {
				// Nominees Listing Loop
				for (var i = 0; i < nomList.length; i++) {
					// Nominee AJAX Request
					$.ajax({
						url: "https://omdbapi.com/?apikey=2d27a174&type=movie&r=xml&i=" + nomList[i],
						dataType: "xml",
						success: function (xml) {
							var rsp = $(xml).find('movie');					// Root XML Element Variable
							var comp = rsp.attr('imdbID');					// IMDb ID Comparing Variable
							// Nominee HTML Module
							var txt = "<article><hr><img src="+rsp.attr('poster')+" /><br>"+rsp.attr('title')+" ("+rsp.attr('year')+")<br>"+comp+
							  "<br><button class=\"btn btn-sm btn-warning discommend\" name="+comp+">Discommend</button></article>";
							
							// Add Nominee Module
							$('.sidebar-content').append(txt);
							
							// Establish Module Button Functionality
							$('.discommend').on('click', function () {
								var temp = "", end = nomList.length;
								
								// Remove Visual Nominee
								$(this).parent().remove();
								// Remove Memory Nominee Loop
								for (var j = 0; j < end; j++) {
									if (nomList[j] == $(this).attr('name')) {
										temp = nomList[j];
										nomList[j] = nomList[end - 1];
										nomList[end - 1] = temp;
										nomList.pop();
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
	
	/* sidebarCollapseRsp Event Listener & Function
	   - Mobile View exit nomination list toggle
	*/
	$('#sidebarCollapseRsp').on('click', function () {
		// Collapse Class Toggle
		$('#sidebar').toggleClass('active');
		$('#content-wrapper').toggleClass('active');
	});
	
	/* submit Event Listener & Function
	   - Facade nomination list submission
	*/
	$('#submit').on('click', function () {
		if (nomList.length > 0) {
			$('.sidebar-content').html("No Nominees Yet");
			$('.alert').html("You submitted "+nomList.length+" nominees! You may continue browsing movies or make another list.");
			$('.alert').fadeTo(3000, 500).slideUp(1000);
			nomList.splice(0, nomList.length);
		}
		else {
			$('.alert').html("You haven't nominated anyone yet.");
			$('.alert').fadeTo(3000, 500).slideUp(1000);
		}
	});
	
	/* search Event Listener & Function
	   - On keystroke, update API call to produce search results
	*/
	$('#search').keyup(function () {
		// URL Generation Variable
		var ulink = "https://omdbapi.com/?apikey=2d27a174&type=movie&r=xml&" + $('form').serialize();
		
		// Search Results AJAX Request
		$.ajax({
			url: ulink,
			dataType: "xml",
			success: function(xml) {
				var root = $(xml).find('root');					// Root XML Element Variable
				var rsp = root.attr('response');				// Results Detecting Variable
				
				// Results Detection
				if (rsp == "False") {
					$('#ttl-rslts').html("0 Results");						// Empty total results
					$('#srch-rslt-1').html($(xml).find('error').html());	// Error Log
					$('#srch-rslt-2').html("");
					$('#srch-rslt-3').html("");
					topScroll = bttmScroll = false;							// Scroll Lock
				}
				else if (rsp == "True") {
					// Total Results Update
					$('#ttl-rslts').html($(xml).find('root').attr('totalResults') + " Results");
					
					// Scroll Lock Change
					topScroll = false;
					bttmScroll = true;
					
					// searchResults Function Call Loop
					for (var i = 1; i <= 3; i++) { searchResults(ulink, i, i); }
				}
			}
		});
	});
	
	/* Infinite Scroll Event Listener & Function
	   - Simulates infinite scrolling
	   - If scrolling too fast, copying may fire twice (appears most when scrolling up)*
	*/
	$(window).scroll(function () {
		var ulink = "https://omdbapi.com/?apikey=2d27a174&type=movie&r=xml&" + $('form').serialize();
		var topCheck = $(document).height() - $('#srch-rslt-2').height() - $('#srch-rslt-3').height() - 50;
		var jump = $(document).height() - $('#srch-rslt-3').height() - 50;
		var bttmCheck = $(document).height() - $(window).height();
		
		/*console.log($(window).scrollTop()+", "+topCheck);*/
		
		// Top Check
		if (topScroll && ($(window).scrollTop() <= topCheck) && !triggered) {
			triggered = true;
			$(window).scrollTop(jump);
			$('#srch-rslt-3').html($('#srch-rslt-2').html());
			$('#srch-rslt-3').attr('name', $('#srch-rslt-2').attr('name'));
			$('#srch-rslt-2').html($('#srch-rslt-1').html());
			$('#srch-rslt-2').attr('name', $('#srch-rslt-1').attr('name'));
			searchResults(ulink, 1, Number($('#srch-rslt-1').attr('name')) - 1);
			setTimeout(function () { triggered = false; }, 500);
		}
		// Bottom Check
		else if (bttmScroll && ($(window).scrollTop() >= bttmCheck)) {
			$(window).scrollTop(jump);
			$('#srch-rslt-1').html($('#srch-rslt-2').html());
			$('#srch-rslt-1').attr('name', $('#srch-rslt-2').attr('name'));
			$('#srch-rslt-2').html($('#srch-rslt-3').html());
			$('#srch-rslt-2').attr('name', $('#srch-rslt-3').attr('name'));
			searchResults(ulink, 3, Number($('#srch-rslt-3').attr('name')) + 1);
		}
	});
});

