var leftList = null,
	rightList = null;

new Promise(function(resolve) {
	if(document.readyState === 'complete') {
		resolve();
	}
	else {
		window.onload = resolve;
	}
}).then(function() {
	return new Promise(function(resolve, reject) {
		friends.addEventListener('click', onFriendButtonClick);
		search.addEventListener('keyup', onSearchChanged);
		search.addEventListener('mousedown', onMouseDownInput);

		leftList = localStorage.getItem('leftList'),
		rightList = localStorage.getItem('rightList');
		
		if(leftList !== null || rightList !== null)
			resolve();
		else
			reject();
	}).then(function(){
				update();
			},
			function(){
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
				}).then(function () {
					return new Promise(function (resolve, reject) {
						VK.Api.call('friends.get', {'order' : 'name', 'fields': 'photo_50'}, function(response){
							if(response.error) {
								reject(new Error(response.error.error_msg));
							}
							else {
								var source = leftItemTemplate.innerHTML,
								templateFn = Handlebars.compile(source),
								template = templateFn({list: response.response});

								leftList = response.response;
								leftResults.innerHTML = template;

								// source = rigthItemTemplate.innerHTML;
								// templateFn = Handlebars.compile(source);
								// template = templateFn({right_list: response.response});
								// rightResults.innerHTML = template;

								//console.log(response);
								resolve();
							}
						});
					});
				}).catch(function(e) {
					alert('Ошибка:' + e.message);
				});
			})
});



function onFriendButtonClick(e) {
	if(e.target.className.indexOf('delete') !== -1) {
		console.log('click delete');
		return;
	}

	if(e.target.className.indexOf('add') !== -1) {
		console.log('click add');
	}
}

function onMouseDownInput(e) {
	if(e.target.id === 'left_inp' || e.target.id === 'right_inp') {
		e.target.value = '';
	}
}

function onSearchChanged(e) {
	if(e.target.id === 'left_inp') {
		console.log('left_search');
		leftResults.innerHTML = getSearchFreinds(leftItemTemplate, leftList, e.target.value);
		return;
	}

	if(e.target.id === 'right_inp') {
		console.log('right_search');
		rightResults.innerHTML = getSearchFreinds(rightItemTemplate, rightList, e.target.value);
	}
}

function getSearchFreinds(templateNode, sourceDataObject, filter) {
	var filterSourceDataObject=[];

	if(!sourceDataObject)
		return '';
	
	for (var i = 0; i < sourceDataObject.length; i++) {
		if((sourceDataObject[i].first_name + ' ' + sourceDataObject[i].last_name).toUpperCase().indexOf(filter.toUpperCase()) !== -1)
			filterSourceDataObject[filterSourceDataObject.length] = sourceDataObject[i];
	}

	var source = templateNode.innerHTML,
	templateFn = Handlebars.compile(source);
	return templateFn({list: filterSourceDataObject});//{left_list: leftList}
}

function update(leftList, rightList) {
	var source = leftItemTemplate.innerHTML,
	templateFn = Handlebars.compile(source),
	template = templateFn({left_list: leftList});
	leftResults.innerHTML = template;

	source = rightItemTemplate.innerHTML;
	templateFn = Handlebars.compile(source);
	template = templateFn({right_list: rightList});
	rightResults.innerHTML = template;
};