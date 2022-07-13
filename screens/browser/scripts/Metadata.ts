export default `
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'metadata', payload: {
    origin: window.location.href, 
    hostname: location.protocol + '//' + location.hostname,
    icon: getIcons(), 
    title: document.title || location.hostname, 
    desc: document.querySelector('meta[name="description"]') && document.querySelector('meta[name="description"]').content, 
    themeColor: document.querySelector('meta[name="theme-color"]') && document.querySelector('meta[name="theme-color"]').content,
}}));`;
