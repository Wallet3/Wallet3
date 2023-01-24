"document.querySelector('w3m-modal').shadowRoot.querySelector('w3m-modal-router').shadowRoot.querySelector('w3m-connect-wallet-view').shadowRoot.querySelector('w3m-desktop-wallet-selection').shadowRoot.querySelector('w3m-modal-content').querySelector('w3m-walletconnect-qr').shadowRoot.querySelector('w3m-qrcode')";

export default `
const observeDOM = (function () {
    var MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
      if (!obj || obj.nodeType !== 1) return;

      if (MutationObserver) {
        // define a new observer
        var mutationObserver = new MutationObserver(callback);

        // have the observer observe foo for changes in children
        mutationObserver.observe(obj, { childList: true, subtree: true });
        return mutationObserver;
      }

      // browser support fallback
      else if (window.addEventListener) {
        obj.addEventListener("DOMNodeInserted", callback, false);
        obj.addEventListener("DOMNodeRemoved", callback, false);
      }
    };
})();

const observer = observeDOM(document.body, function (m) {
  if (window.ethereum && window.ethereum._selectedAddress) {
    observer.disconnect();
    return;
  }

  const wcapp =
    document.querySelector("a[href^='https://rnbwapp.com/wc?uri=']") ||
    document.querySelector("a[href^='https://metamask.app.link/wc?uri=']");

  if (!wcapp) return;

  const wcuri = new URL(wcapp.href).searchParams.get("uri");
  
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: "wcuri",
    payload: { uri: wcuri },
  }));

  document.querySelector("div[id='walletconnect-wrapper']").style.display = 'none';

});
`;
