$("#submit").on("click", function(){
	event.preventDefault();

	startingAddress = $("#address1").val().trim();
	endingAddress = $("#address2").val().trim();

	localStorage.setItem('startAddress', startingAddress);
	localStorage.setItem('endAddress', endingAddress);

	window.location.href = "../html/routeDisplayPage.html"
	});
