function handleFiles(files) {
	// Check for the various File API support.
	if (window.FileReader) {
		// FileReader are supported.
		getAsText(files[0]);
	} else {
		alert('FileReader are not supported in this browser.');
	}
}

function getAsText(fileToRead) {
	var reader = new FileReader();
	// Handle errors load
	reader.onload = loadHandler;
	reader.onerror = errorHandler;
	// Read file into memory as UTF-8      
	reader.readAsText(fileToRead);
}

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);             
}

function processData(csv) {
	var allTextLines = csv.split(/\r\n|\n/);
	var lines = [];
	while (allTextLines.length) {
		var nowline = allTextLines.shift() + ',';
		var lines2 = [];
		var s = 1;
		var IsDoubleQuote = false;
		var IsDoubleQuoted = false;
		for (var i = 1; i<=nowline.length; i++) {
			var NowWord = nowline.substring(i-1,i);
			if (IsDoubleQuote) {
				if (NowWord=='\"') IsDoubleQuote = false;
			} else {
				if (NowWord=='\"') {
					s = i+1;
					IsDoubleQuote = true;
					IsDoubleQuoted = true;
				} else if (NowWord==',') {
					if (IsDoubleQuoted) {
						lines2.push(nowline.substring(s-1,i-2));
						IsDoubleQuoted = false;
						s = i+1;
					} else {
						lines2.push(nowline.substring(s-1,i-1));
						s = i+1;
					}
				}
			}
		}
		lines.push(lines2);
	}
	// console.log(lines);
	get_result(lines);
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Can't read file !");
	}
}

// function drawOutput(lines){
// 	//Clear previous data
// 	document.getElementById("output").innerHTML = "";
// 	var table = document.createElement("table");
// 	for (var i = 0; i < lines.length; i++) {
// 		var row = table.insertRow(-1);
// 		for (var j = 0; j < lines[i].length; j++) {
// 			var firstNameCell = row.insertCell(-1);
// 			firstNameCell.appendChild(document.createTextNode(lines[i][j]));
// 		}
// 	}
// 	document.getElementById("output").appendChild(table);
// }

function get_result(lines){
	for (var i = 0; i < lines.length; i++) {
		window.csvdata[i] = lines[i]; //数组捕捉大法
	};
}