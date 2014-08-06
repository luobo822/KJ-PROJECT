function handleFiles(files) {
	//检测是否支持HTML5 文件 API
	if (window.FileReader) {
		// 支持文件上传
		getAsText(files[0]);
	} else {
		alert('你的浏览器不支持CSV文件上传.建议使用chrome.');
	}
}

function getAsText(fileToRead) {
	var reader = new FileReader();
	// Handle errors load
	reader.onload = loadHandler;
	reader.onerror = errorHandler;
	// 以UTF-8编码读文件至内存   
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
        lines.push(allTextLines.shift().split(','));
    }
	// console.log(lines);
	get_result(lines);
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("无法解析此文件");
	}
}

function get_result(lines){
	for (var i = 0; i < lines.length; i++) {
		window.csvdata[i] = lines[i]; //数组捕捉大法
	};
	console.log(window.csvdata);
}



