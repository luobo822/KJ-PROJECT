function route(handle, pathname){
	console.log("route request for" + pathname);

	if (typeof handle[pathname] === 'function'){
		handle[pathname]();
	}else{
		console.log("no request for "+pathname);
		return "404 not found";
	}
}


exports.route = route;