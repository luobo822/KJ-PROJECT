//not completed
//var register =require[./register.js];
//var login =require[./login.js];
//var item =require[./item.js];
//var register =require[./register.js];

function start(){
	console.log("request handler start was called");
	return "start";
}


function upload(){
	console.log("request handler upload was called");
	return "upload";
}

function login(){
	console.log("request handler login was called");
}

function usrchk(){
	console.log("request for checking database usrname if reg");

}

function reg(){
	console.log("request for register user to database");
}

function addItem(){
	console.log("adding item to database");
}

exports.start = start;
exports.upload = upload;
exports.login =login;
exports.usrchk =usrchk;
exports.reg =reg;
exports.addItem =addItem;
