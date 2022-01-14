export const JS_POST_MESSAGE_TO_PROVIDER = (message: any, origin = '*') => `(function () {
	try {
		window.postMessage(${JSON.stringify(message)}, '${origin}');
	} catch (e) {
		//Nothing to do
	}
})()`;

const getWindowInformation = `
	const shortcutIcon = window.document.querySelector('head > link[rel="shortcut icon"]');
	const icon = shortcutIcon || Array.from(window.document.querySelectorAll('head > link[rel="icon"]')).find((icon) => Boolean(icon.href));

	const siteName = document.querySelector('head > meta[property="og:site_name"]');
	const title = siteName || document.querySelector('head > meta[name="title"]');
	window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(
		{
			type: 'GET_TITLE_FOR_BOOKMARK',
			payload: {
				title: title ? title.content : document.title,
				url: location.href,
				icon: icon && icon.href
			}
		}
	))
`;

export const JS_WINDOW_INFORMATION = `
	(function () {
		${getWindowInformation}
	})();
`;
