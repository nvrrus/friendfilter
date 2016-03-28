new Promise(function(resolve) {
	if(document.readyState === 'complete') {
		resolve();
	}
	else {
		window.onload = resolve;
	}
}).then(function() {
	return new Promise(function(resolve, reject) {
		VK.init({
			apiId:5371795
		});
		VK.Auth.login(function(response) {
			console.log(response);
			if(response.session) {
				resolve();
			}
			else {
				reject(new Error('Не удалось авторизоваться'));
			}
		}, 8);
	});
}).then(function () {
	return new Promise(function (resolve, reject) {
		VK.Api.call('friends.get', {'order' : 'name', 'fields': 'photo_50'}, function(response){
			if(response.error) {
				reject(new Error(response.error.error_msg));
			}
			else {
				var source = leftItemTemplate.innerHTML,
					templateFn = Handlebars.compile(source),
					template = templateFn({left_list: response.response});

				leftResults.innerHTML = template;

				source = rigthItemTemplate.innerHTML;
				templateFn = Handlebars.compile(source);
				template = templateFn({right_list: response.response});
				rightResults.innerHTML = template;

				//console.log(response);
				resolve();
			}
		});
	});
}).catch(function(e) {
	alert('Ошибка:' + e.message);
});
