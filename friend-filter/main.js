var leftList = [],
	rightList = [];

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
		left_col.addEventListener('dragstart', onDragStart, false);
		right_col.addEventListener('dragstart', onDragStart, false);
		left_col.addEventListener('dragover', onDragOver, false);
		right_col.addEventListener('dragover', onDragOver, false);
		left_col.addEventListener('drop', onDrop, false);
		right_col.addEventListener('drop', onDrop, false);
		save_btn.addEventListener('click', onSave);

		leftList = JSON.parse(localStorage.getItem('leftList')),
		rightList = JSON.parse(localStorage.getItem('rightList'));
		
		if(leftList !== null || rightList !== null)
			resolve();
		else
			reject();
	}).then(function(){
				updateLists();
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
								leftList = response.response;
								leftResults.innerHTML = getTemplateHTML(leftItemTemplate.innerHTML, leftList);
								resolve();
							}
						});
					});
				}).catch(function(e) {
					alert('Ошибка:' + e.message);
				});
			})
});

function moveFromListToList(userId, direction) {
	var deletedElement;

	if(toList === null)
		toList = [];
	for (var i = 0; i < fromList.length; i++) {
		if(fromList[i].uid.toString() === userId) {
			// deletedElement = fromList[i];
			deletedElement = fromList.splice(i, 1);
			toList[toList.length] = deletedElement;
			break;
		}
	}
}

function onFriendButtonClick(e) {
	if(e.target.className.indexOf('add') !== -1) {
		console.log('click add');
		var userId = e.target.parentElement.querySelector('.user_id').innerHTML;
		if(rightList === null)
			rightList = [];
		for (var i = 0; i < leftList.length; i++) {
			if(leftList[i].uid.toString() === userId) {
				deletedElement = leftList.splice(i, 1);
				rightList[rightList.length] = deletedElement[0];
				break;
			}
		}
	} else if(e.target.className.indexOf('delete') !== -1) {
		console.log('click delete');
		var userId = e.target.parentElement.querySelector('.user_id').innerHTML;
		if(leftList === null)
			leftList = [];
		for (var i = 0; i < rightList.length; i++) {
			if(rightList[i].uid.toString() === userId) {
				deletedElement = rightList.splice(i, 1);
				leftList[leftList.length] = deletedElement[0];
				break;
			}
		}
	} else return;

	updateLists();
}

function updateLists() {
	leftResults.innerHTML = getTemplateHtmlByFilter(leftItemTemplate.innerHTML, leftList, left_inp.value);
	rightResults.innerHTML = getTemplateHtmlByFilter(rightItemTemplate.innerHTML, rightList, right_inp.value);
}

function onSearchChanged(e) {
	if(e.target.id === 'left_inp') {
		console.log('left_search');
		leftResults.innerHTML = getTemplateHtmlByFilter(leftItemTemplate.innerHTML, leftList, e.target.value);
		return;
	}

	if(e.target.id === 'right_inp') {
		console.log('right_search');
		rightResults.innerHTML = getTemplateHtmlByFilter(rightItemTemplate.innerHTML, rightList, e.target.value);
	}
}

function getTemplateHtmlByFilter(templateHtml, sourceObj, filter) {
	if(filter === '' || filter === null)
		return getTemplateHTML(templateHtml, sourceObj);
	else {
		var filterSourceObject=[];

		if(!sourceObj)
			return '';

		for (var i = 0; i < sourceObj.length; i++) {
			if((sourceObj[i].first_name + ' ' + sourceObj[i].last_name).toUpperCase().indexOf(filter.toUpperCase()) !== -1)
				filterSourceObject[filterSourceObject.length] = sourceObj[i];
		}
		
		return getTemplateHTML(templateHtml, filterSourceObject);
	}
}

function getTemplateHTML(templateHTML, sourceObj) {
	templateFn = Handlebars.compile(templateHTML);
	return templateFn({list: sourceObj});
};
var dragSrcEl = null;
function onDragStart(e) {
	console.log(e);
	dragSrcEl = e.target;
	e.dataTransfer.effectAllowed = 'move';
  	e.dataTransfer.setData('text/html', this.innerHTML);
	//this.style.opacity = '0.4';
}
function onDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.target.id === 'right_col' || e.target.id === 'left_col') {
        e.dataTransfer.dropEffect = 'move';
    }
    return false;
}
function onDrop(e) {
	console.log(e);
	if (e.stopPropagation) {
  		e.stopPropagation(); // stops the browser from redirecting.
	}

	var srcDiv = dragSrcEl.parentElement.parentElement.parentElement;
	if (srcDiv.id != this.id) {
		var userId = dragSrcEl.querySelector('.user_id').innerHTML;
		if(rightList === null)
			rightList = [];
		if(leftList === null)
			leftList = [];

		if(srcDiv.id == 'left_col') {
			for (var i = 0; i < leftList.length; i++) {
				if(leftList[i].uid.toString().indexOf(userId) !== -1) {
					deletedElement = leftList.splice(i, 1);
					rightList[rightList.length] = deletedElement[0];
					break;
				}
			}
		} 
		else  {
			for (var i = 0; i < rightList.length; i++) {
				if(rightList[i].uid.toString().indexOf(userId) !== -1) {
					deletedElement = rightList.splice(i, 1);
					leftList[leftList.length] = deletedElement[0];
					break;
				}
			}
		} 

		updateLists();
	}
	else
		console.log('В себя');

  	return false;
}

function onSave(e) {
	localStorage.setItem('leftList', JSON.stringify(leftList));
	localStorage.setItem('rightList', JSON.stringify(rightList));
}