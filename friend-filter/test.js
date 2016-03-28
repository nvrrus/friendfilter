describe('getCookiesAsObject', function () {
	it('get cookie as object', function () {
		document.cookie = "cName1=cValue1";
		document.cookie = "cName2=cValue2; pass=/";
		document.cookie = "cName3=cValue3; pass=/qwert";
		document.cookie = "cName4=cValue4; pass=/qwert1";
		document.cookie = "cName5=cValue5; pass=/qwert2";
		var res = getCookiesAsObject();

		assert.isDefined(res);
		assert.equal(5, Object.keys(res).length);
		assert.equal(res['cName1'], 'cValue1');
	})
})

