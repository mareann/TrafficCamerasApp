$("#submit").on("click", function(){
	event.preventDefault()

	streetAddress = $("#address").val().trim()
	zipCode = $("#zipcode").val().trim()
	city = $("#city").val().trim()
	state = $("#state").val().trim()

	address = streetAddress+" "+city+" "+zipCode+" "+state;
	console.log(address)
	localStorage.setItem('address', address)
	window.location.href = "assets/html/addressDisplayMap.html";
	});
