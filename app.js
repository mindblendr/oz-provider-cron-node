var express = require("express");
var app = express();
var http = require("http");
var request = require("request");
var server = http.Server(app);
var io = require("socket.io")(server);
var moment = require("moment");
const API_URL = process.env.API_URL || 'http://api.oz-seamless.ara/';
const API_KEY = process.env.API_KEY || '1024uiosadf09a23';

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

process.on('uncaughtException', function (err) {
	console.clear();
	console.log('Caught exception: ', err);
});

var api = io
	.of('/api')
	.on("connection", function(socket) {
		socket.on('request', function (response) {	
			switch (response.send_to) {
				case 'gate':
					if (response._params) {
						response['data'] = {
							_params: response._params
						};
					}
					if (response._all) api.emit(response._all, response.data);
					if (response._others) socket.broadcast.emit(response._others, response.data);
					if (response._response) socket.emit(response._response, response.data);
					break;
				case 'api':
				default:
					request({
						url: response.url,
						method: response.method,
						formData: response.data,
						headers: response.headers
					}, function (err, httpResponse, body) {
						
						if (body.trim().substr(0,1) != '<') {
							try {
								body = JSON.parse(body);
							} catch (error) {
								socket.emit('on_error', body);
							}
						} else {
							socket.emit('on_error', body);
						}
						
						if (response._params) {
							body['_params'] = response._params;
						}

						if (response._all) api.emit(response._all, body);
						if (response._others) api.emit(response._others, body);
						if (response._response) socket.emit(response._response, body);
					});
					break;
			}
		});
	});

		
	// setInterval(function () {
	// 	request({
	// 		url: API_URL + 'all/time/?api_key=' + API_KEY,
	// 		headers: { 'Content-Type': 'application/json' }
	// 	}, function (err, httpResponse, body) {
	// 		var time = 0;

	// 		// try {
	// 		// 	parsed_body = JSON.parse(body);
	// 		// 	parsed_body.context['from_server'] = true;

	// 		// 	time = 50 - parseInt(moment(parsed_body.context.data).format('s'));
	// 		// } catch (error) {
	// 		// 	time = 50 - parseInt(moment().format('s'));
	// 		// }
	// 		var time = 60 - parseInt(moment().format('s'));
	// 		// console.log(time);
			
	// 		if (time <= 0) time = 0; 			
	// 		api.emit('get_time', {
	// 			context: {
	// 				data: time,
	// 				from_server: true,
	// 				status: 1
	// 			},
	// 			status: 1
	// 		});
	// 	});
	// }, 200);

	setInterval(function () {				
		var sec = new Date().getSeconds();

		// BACCARAT
		if ( ((sec > 20 && sec <= 25) && sec % 2 === 0) || (sec > 25 && sec % 5 === 0) ) {
			if (sec > 20) {
				request({
					url: API_URL + 'cron/get_results/baccarat?api_key=' + API_KEY,
					headers: { 'Content-Type': 'application/json' }
				}, function (err, httpResponse, body) {
					// body = JSON.parse(body);
					// api.emit('baccarat_result', body);
				});
			}
		}

		if ( (sec <= 20 &&  sec % 2 === 0) || (sec > 20 && sec % 5 === 0) ) {
			if (sec <= 52) {
				request({
					url: API_URL + 'cron/get_results/odd_even?api_key=' + API_KEY,
					headers: { 'Content-Type': 'application/json' }
				}, function (err, httpResponse, body) {					
					// body = JSON.parse(body);
					// api.emit('oddeven_result', body);
				});
			}
			if (sec <= 45) {
				request({
					url: API_URL + 'cron/get_results/nine?api_key=' + API_KEY,
					headers: { 'Content-Type': 'application/json' }
				}, function (err, httpResponse, body) {					
					// body = JSON.parse(body);
					// api.emit('baccarat_result', body);
				});
			}
			if (sec <= 50) {
				request({
					url: API_URL + 'cron/get_results/go_stop?api_key=' + API_KEY,
					headers: { 'Content-Type': 'application/json' }
				}, function (err, httpResponse, body) {					
					// body = JSON.parse(body);
					// api.emit('baccarat_result', body);
				});
			}
		}
	}, 1000);

	setInterval(function () {	
		request({
			url: API_URL + 'cron/backup_result?api_key=' + API_KEY,
			headers: { 'Content-Type': 'application/json' }
		}, function (err, httpResponse, body) {					
			// body = JSON.parse(body);
			// api.emit('oddeven_result', body);
		});
	}, 5000);
	
	// setInterval(function () {	
	// 	request({
	// 		url: API_URL + 'cron/evo/result?api_key=' + API_KEY,
	// 		headers: { 'Content-Type': 'application/json' }
	// 	}, function (err, httpResponse, body) {
	// 		// body = JSON.parse(body);
	// 		// api.emit('baccarat_result', body);
	// 	});
	// }, 5000);

server.listen((process.env.PORT || 2083), function() {
    console.log("listening on *:" + (process.env.PORT || 2083));
});
