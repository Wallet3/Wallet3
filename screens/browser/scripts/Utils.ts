export const JS_POST_MESSAGE_TO_PROVIDER = (message: any, origin = '*') => `(function () {
	try {
		window.postMessage(${JSON.stringify(message)}, '${origin}');
	} catch (e) {
		//Nothing to do
	}
})();

true;`;
