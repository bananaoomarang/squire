!function(e,t){"use strict";function n(e,t,n){this.root=this.currentNode=e,this.nodeType=t,this.filter=n}function r(e,t){for(var n=e.length;n--;)if(!t(e[n]))return!1;return!0}function o(e,t,n){if(e.nodeName!==t)return!1;for(var r in n)if(e.getAttribute(r)!==n[r])return!1;return!0}function i(e,t){return!a(e)&&e.nodeType===t.nodeType&&e.nodeName===t.nodeName&&e.className===t.className&&(!e.style&&!t.style||e.style.cssText===t.style.cssText)}function a(e){return e.nodeType===x&&!!oe[e.nodeName]}function s(e){return re.test(e.nodeName)}function d(e){var t=e.nodeType;return(t===x||t===D)&&!s(e)&&r(e.childNodes,s)}function l(e){var t=e.nodeType;return!(t!==x&&t!==D||s(e)||d(e))}function c(e){var t=e.ownerDocument,r=new n(t.body,U,d,!1);return r.currentNode=e,r}function f(e){return c(e).previousNode()}function h(e){return c(e).nextNode()}function u(e,t,n){do if(o(e,t,n))return e;while(e=e.parentNode);return null}function p(e){var t,n,r,o,i,a=e.parentNode;return a&&e.nodeType===x?(t=p(a),t+=(t?">":"")+e.nodeName,(n=e.id)&&(t+="#"+n),(r=e.className.trim())&&(o=r.split(/\s\s*/),o.sort(),t+=".",t+=o.join(".")),(i=e.dir)&&(t+="[dir="+i+"]")):t=a?p(a):"",t}function g(e){var t=e.nodeType;return t===x?e.childNodes.length:e.length||0}function m(e){var t=e.parentNode;return t&&t.removeChild(e),e}function v(e,t){var n=e.parentNode;n&&n.replaceChild(t,e)}function N(e){for(var t=e.ownerDocument.createDocumentFragment(),n=e.childNodes,r=n?n.length:0;r--;)t.appendChild(e.firstChild);return t}function C(e,n,r,o){var i,a,s,d,l=e.createElement(n);if(r instanceof Array&&(o=r,r=null),r)for(i in r)a=r[i],a!==t&&l.setAttribute(i,r[i]);if(o)for(s=0,d=o.length;d>s;s+=1)l.appendChild(o[s]);return l}function S(e){var t,n,r=e.ownerDocument,o=e;if("BODY"===e.nodeName&&((n=e.firstChild)&&"BR"!==n.nodeName||(t=k(r).createDefaultBlock(),n?e.replaceChild(t,n):e.appendChild(t),e=t,t=null)),s(e)){for(n=e.firstChild;$&&n&&n.nodeType===R&&!n.data;)e.removeChild(n),n=e.firstChild;n||($?(t=r.createTextNode(H),k(r)._didAddZWS()):t=r.createTextNode(""))}else if(Y){for(;e.nodeType!==R&&!a(e);){if(n=e.firstChild,!n){t=r.createTextNode("");break}e=n}e.nodeType===R?/^ +$/.test(e.data)&&(e.data=""):a(e)&&e.parentNode.insertBefore(r.createTextNode(""),e)}else if(!e.querySelector("BR"))for(t=C(r,"BR");(n=e.lastElementChild)&&!s(n);)e=n;return t&&e.appendChild(t),o}function _(e){var t,n,r,o,i=e.childNodes,a=e.ownerDocument,d=null,c=k(a)._config;for(t=0,n=i.length;n>t;t+=1)r=i[t],o="BR"===r.nodeName,!o&&s(r)?(d||(d=C(a,c.blockTag,c.blockAttributes)),d.appendChild(r),t-=1,n-=1):(o||d)&&(d||(d=C(a,c.blockTag,c.blockAttributes)),S(d),o?e.replaceChild(d,r):(e.insertBefore(d,r),t+=1,n+=1),d=null),l(r)&&_(r);return d&&e.appendChild(S(d)),e}function y(e,t,n){var r,o,i,a=e.nodeType;if(a===R&&e!==n)return y(e.parentNode,e.splitText(t),n);if(a===x){if("number"==typeof t&&(t=t<e.childNodes.length?e.childNodes[t]:null),e===n)return t;for(r=e.parentNode,o=e.cloneNode(!1);t;)i=t.nextSibling,o.appendChild(t),t=i;return"OL"===e.nodeName&&u(e,"BLOCKQUOTE")&&(o.start=(+e.start||1)+e.childNodes.length-1),S(e),S(o),(i=e.nextSibling)?r.insertBefore(o,i):r.appendChild(o),y(r,o,n)}return t}function T(e,t){if(e.nodeType===x)for(var n,r,o,a=e.childNodes,d=a.length,l=[];d--;)if(n=a[d],r=d&&a[d-1],d&&s(n)&&i(n,r)&&!oe[n.nodeName])t.startContainer===n&&(t.startContainer=r,t.startOffset+=g(r)),t.endContainer===n&&(t.endContainer=r,t.endOffset+=g(r)),t.startContainer===e&&(t.startOffset>d?t.startOffset-=1:t.startOffset===d&&(t.startContainer=r,t.startOffset=g(r))),t.endContainer===e&&(t.endOffset>d?t.endOffset-=1:t.endOffset===d&&(t.endContainer=r,t.endOffset=g(r))),m(n),n.nodeType===R?r.appendData(n.data):l.push(N(n));else if(n.nodeType===x){for(o=l.length;o--;)n.appendChild(l.pop());T(n,t)}}function b(e,t,n){for(var r,o,i,a=t;1===a.parentNode.childNodes.length;)a=a.parentNode;m(a),o=e.childNodes.length,r=e.lastChild,r&&"BR"===r.nodeName&&(e.removeChild(r),o-=1),i={startContainer:e,startOffset:o,endContainer:e,endOffset:o},e.appendChild(N(t)),T(e,i),n.setStart(i.startContainer,i.startOffset),n.collapse(!0),j&&(r=e.lastChild)&&"BR"===r.nodeName&&e.removeChild(r)}function E(e){var t,n,r=e.previousSibling,o=e.firstChild,a=e.ownerDocument,s="LI"===e.nodeName;if(!s||o&&/^[OU]L$/.test(o.nodeName))if(r&&i(r,e)){if(!l(r)){if(!s)return;n=C(a,"DIV"),n.appendChild(N(r)),r.appendChild(n)}m(e),t=!l(e),r.appendChild(N(e)),t&&_(r),o&&E(o)}else s&&(r=C(a,"DIV"),e.insertBefore(r,o),S(r))}function k(e){for(var t,n=He.length;n--;)if(t=He[n],t._doc===e)return t;return null}function B(e,t){var n,r;e||(e={});for(n in t)r=t[n],e[n]=r&&r.constructor===Object?B(e[n],r):r;return e}function O(e,t){var n,r=e.defaultView,o=e.body;this._win=r,this._doc=e,this._body=o,this._events={},this._sel=r.getSelection(),this._lastSelection=null,X&&this.addEventListener("beforedeactivate",this.getSelection),this._hasZWS=!1,this._lastAnchorNode=null,this._lastFocusNode=null,this._path="",this.addEventListener("keyup",this._updatePathOnEvent),this.addEventListener("mouseup",this._updatePathOnEvent),r.addEventListener("focus",this,!1),r.addEventListener("blur",this,!1),this._undoIndex=-1,this._undoStack=[],this._undoStackLength=0,this._isInUndoState=!1,this._ignoreChange=!1,J?(n=new MutationObserver(this._docWasChanged.bind(this)),n.observe(o,{childList:!0,attributes:!0,characterData:!0,subtree:!0}),this._mutation=n):this.addEventListener("keyup",this._keyUpDetectChange),this._awaitingPaste=!1,this.addEventListener(V?"beforecut":"cut",Fe),this.addEventListener(V?"beforepaste":"paste",Me),this.addEventListener(j?"keypress":"keydown",_e),this._keyHandlers=Object.create(Ee),this.setConfig(t),V&&(r.Text.prototype.splitText=function(e){var t=this.ownerDocument.createTextNode(this.data.slice(e)),n=this.nextSibling,r=this.parentNode,o=this.length-e;return n?r.insertBefore(t,n):r.appendChild(t),o&&this.deleteData(e,o),t}),o.setAttribute("contenteditable","true");try{e.execCommand("enableObjectResizing",!1,"false"),e.execCommand("enableInlineTableEditing",!1,"false")}catch(i){}He.push(this),this.setHTML("")}function A(e,t,n){var r,o;for(r=t.firstChild;r;r=o){if(o=r.nextSibling,s(r)){if(r.nodeType===R||a(r)){n.appendChild(r);continue}}else if(d(r)){n.appendChild(e.createDefaultBlock([A(e,r,e._doc.createDocumentFragment())]));continue}A(e,r,n)}return n}var L=2,x=1,R=3,D=11,U=1,I=4,P=0,w=1,F=2,M=3,H="​",W=e.defaultView,K=navigator.userAgent,z=/iP(?:ad|hone|od)/.test(K),Z=/Mac OS X/.test(K),q=/Gecko\//.test(K),V=/Trident\/[456]\./.test(K),j=!!W.opera,G=/WebKit\//.test(K),Q=Z?"meta-":"ctrl-",Y=V||j,$=V||G,X=V,J="undefined"!=typeof MutationObserver,ee=/[^ \t\r\n]/,te=Array.prototype.indexOf;Object.create||(Object.create=function(e){var t=function(){};return t.prototype=e,new t});var ne={1:1,2:2,3:4,8:128,9:256,11:1024};n.prototype.nextNode=function(){for(var e,t=this.currentNode,n=this.root,r=this.nodeType,o=this.filter;;){for(e=t.firstChild;!e&&t&&t!==n;)e=t.nextSibling,e||(t=t.parentNode);if(!e)return null;if(ne[e.nodeType]&r&&o(e))return this.currentNode=e,e;t=e}},n.prototype.previousNode=function(){for(var e,t=this.currentNode,n=this.root,r=this.nodeType,o=this.filter;;){if(t===n)return null;if(e=t.previousSibling)for(;t=e.lastChild;)e=t;else e=t.parentNode;if(!e)return null;if(ne[e.nodeType]&r&&o(e))return this.currentNode=e,e;t=e}},n.prototype.previousPONode=function(){for(var e,t=this.currentNode,n=this.root,r=this.nodeType,o=this.filter;;){for(e=t.lastChild;!e&&t&&t!==n;)e=t.previousSibling,e||(t=t.parentNode);if(!e)return null;if(ne[e.nodeType]&r&&o(e))return this.currentNode=e,e;t=e}};var re=/^(?:#text|A(?:BBR|CRONYM)?|B(?:R|D[IO])?|C(?:ITE|ODE)|D(?:ATA|EL|FN)|EM|FONT|HR|I(?:MG|NPUT|NS)?|KBD|Q|R(?:P|T|UBY)|S(?:AMP|MALL|PAN|TR(?:IKE|ONG)|U[BP])?|U|VAR|WBR)$/,oe={BR:1,IMG:1,INPUT:1},ie=function(e,t){for(var n=e.childNodes;t&&e.nodeType===x;)e=n[t-1],n=e.childNodes,t=n.length;return e},ae=function(e,t){if(e.nodeType===x){var n=e.childNodes;if(t<n.length)e=n[t];else{for(;e&&!e.nextSibling;)e=e.parentNode;e&&(e=e.nextSibling)}}return e},se=function(e,t){var n,r,o,i,a=e.startContainer,s=e.startOffset,d=e.endContainer,l=e.endOffset;a.nodeType===R?(n=a.parentNode,r=n.childNodes,s===a.length?(s=te.call(r,a)+1,e.collapsed&&(d=n,l=s)):(s&&(i=a.splitText(s),d===a?(l-=s,d=i):d===n&&(l+=1),a=i),s=te.call(r,a)),a=n):r=a.childNodes,o=r.length,s===o?a.appendChild(t):a.insertBefore(t,r[s]),a===d&&(l+=r.length-o),e.setStart(a,s),e.setEnd(d,l)},de=function(e,t){var n=e.startContainer,r=e.startOffset,o=e.endContainer,i=e.endOffset;t||(t=e.commonAncestorContainer),t.nodeType===R&&(t=t.parentNode);for(var a,s,d,l=y(o,i,t),c=y(n,r,t),f=t.ownerDocument.createDocumentFragment();c!==l;)a=c.nextSibling,f.appendChild(c),c=a;return n=t,r=l?te.call(t.childNodes,l):t.childNodes.length,d=t.childNodes[r],s=d&&d.previousSibling,s&&s.nodeType===R&&d.nodeType===R&&(n=s,r=s.length,s.appendData(d.data),m(d)),e.setStart(n,r),e.collapse(!0),S(t),f},le=function(e){ue(e),de(e),he(e);var t=pe(e),n=ge(e);t&&n&&t!==n&&b(t,n,e),t&&S(t);var r=e.endContainer.ownerDocument.body,o=r.firstChild;o&&"BR"!==o.nodeName||(S(r),e.selectNodeContents(r.firstChild))},ce=function(e,t){for(var n=!0,r=t.childNodes,o=r.length;o--;)if(!s(r[o])){n=!1;break}if(e.collapsed||le(e),he(e),n)se(e,t),e.collapse(!1);else{for(var i,a,c,p,g,m=e.startContainer,v=y(m,e.startOffset,u(m.parentNode,"BLOCKQUOTE")||m.ownerDocument.body),N=v.previousSibling,C=N,_=C.childNodes.length,T=v,b=0,k=v.parentNode;(i=C.lastChild)&&i.nodeType===x;){if("BR"===i.nodeName){_-=1;break}C=i,_=C.childNodes.length}for(;(i=T.firstChild)&&i.nodeType===x&&"BR"!==i.nodeName;)T=i;for(g=C.childNodes[_]||null;(i=t.firstChild)&&s(i);)C.insertBefore(i,g);for(;(i=t.lastChild)&&s(i);)T.insertBefore(i,T.firstChild),b+=1;for(a=t;a=h(a);)S(a);if(k.insertBefore(t,v),p=N.nextSibling,a=f(p),!/\S/.test(a.textContent))do k=a.parentNode,k.removeChild(a),a=k;while(k&&!k.lastChild&&"BODY"!==k.nodeName);if(N.parentNode||(N=p.previousSibling),C.parentNode||(C=N||p.parentNode,_=N?N.childNodes.length:0),l(p)&&E(p),c=v.previousSibling,a=d(v)?v:h(v),!/\S/.test(a.textContent))do k=a.parentNode,k.removeChild(a),a=k;while(k&&!k.lastChild&&"BODY"!==k.nodeName);v.parentNode||(v=c.nextSibling),b||(T=c,b=c.childNodes.length),v&&l(v)&&E(v),e.setStart(C,_),e.setEnd(T,b),he(e)}},fe=function(e,t,n){var r=t.ownerDocument.createRange();if(r.selectNode(t),n){var o=e.compareBoundaryPoints(M,r)>-1,i=e.compareBoundaryPoints(w,r)<1;return!o&&!i}var a=e.compareBoundaryPoints(P,r)<1,s=e.compareBoundaryPoints(F,r)>-1;return a&&s},he=function(e){for(var t,n=e.startContainer,r=e.startOffset,o=e.endContainer,i=e.endOffset;n.nodeType!==R&&(t=n.childNodes[r],t&&!a(t));)n=t,r=0;if(i)for(;o.nodeType!==R&&(t=o.childNodes[i-1],t&&!a(t));)o=t,i=g(o);else for(;o.nodeType!==R&&(t=o.firstChild,t&&!a(t));)o=t;e.collapsed?(e.setStart(o,i),e.setEnd(n,r)):(e.setStart(n,r),e.setEnd(o,i))},ue=function(e,t){var n,r=e.startContainer,o=e.startOffset,i=e.endContainer,a=e.endOffset;for(t||(t=e.commonAncestorContainer);r!==t&&!o;)n=r.parentNode,o=te.call(n.childNodes,r),r=n;for(;i!==t&&a===g(i);)n=i.parentNode,a=te.call(n.childNodes,i)+1,i=n;e.setStart(r,o),e.setEnd(i,a)},pe=function(e){var t,n=e.startContainer;return s(n)?t=f(n):d(n)?t=n:(t=ie(n,e.startOffset),t=h(t)),t&&fe(e,t,!0)?t:null},ge=function(e){var t,n,r=e.endContainer;if(s(r))t=f(r);else if(d(r))t=r;else{if(t=ae(r,e.endOffset),!t)for(t=r.ownerDocument.body;n=t.lastChild;)t=n;t=f(t)}return t&&fe(e,t,!0)?t:null},me=new n(null,I|U,function(e){return e.nodeType===R?ee.test(e.data):"IMG"===e.nodeName}),ve=function(e){var t=e.startContainer,n=e.startOffset;if(me.root=null,t.nodeType===R){if(n)return!1;me.currentNode=t}else me.currentNode=ae(t,n);return me.root=pe(e),!me.previousNode()},Ne=function(e){var t,n=e.endContainer,r=e.endOffset;if(me.root=null,n.nodeType===R){if(t=n.data.length,t&&t>r)return!1;me.currentNode=n}else me.currentNode=ie(n,r);return me.root=ge(e),!me.nextNode()},Ce=function(e){var t,n=pe(e),r=ge(e);n&&r&&(t=n.parentNode,e.setStart(t,te.call(t.childNodes,n)),t=r.parentNode,e.setEnd(t,te.call(t.childNodes,r)+1))},Se={8:"backspace",9:"tab",13:"enter",32:"space",37:"left",39:"right",46:"delete",219:"[",221:"]"},_e=function(e){var t=e.keyCode,n=Se[t],r="",o=this.getSelection();n||(n=String.fromCharCode(t).toLowerCase(),/^[A-Za-z0-9]$/.test(n)||(n="")),j&&46===e.which&&(n="."),t>111&&124>t&&(n="f"+(t-111)),"backspace"!==n&&"delete"!==n&&(e.altKey&&(r+="alt-"),e.ctrlKey&&(r+="ctrl-"),e.metaKey&&(r+="meta-")),e.shiftKey&&(r+="shift-"),n=r+n,this._keyHandlers[n]?this._keyHandlers[n](this,e,o):1!==n.length||o.collapsed||(this._recordUndoState(o),this._getRangeAndRemoveBookmark(o),le(o),this._ensureBottomLine(),this.setSelection(o),this._updatePath(o,!0))},ye=function(e){return function(t,n){n.preventDefault(),t[e]()}},Te=function(e,t){return t=t||null,function(n,r){r.preventDefault();var o=n.getSelection();n.hasFormat(e,null,o)?n.changeFormat(null,{tag:e},o):n.changeFormat({tag:e},t,o)}},be=function(e,t){try{t||(t=e.getSelection());var n,r=t.startContainer;for(r.nodeType===R&&(r=r.parentNode),n=r;s(n)&&(!n.textContent||n.textContent===H);)r=n,n=r.parentNode;r!==n&&(t.setStart(n,te.call(n.childNodes,r)),t.collapse(!0),n.removeChild(r),d(n)||(n=f(n)),S(n),he(t)),e._ensureBottomLine(),e.setSelection(t),e._updatePath(t,!0)}catch(o){e.didError(o)}},Ee={enter:function(e,t,n){var r,o,i;if(t.preventDefault(),e._recordUndoState(n),ot(n.startContainer),e._removeZWS(),e._getRangeAndRemoveBookmark(n),n.collapsed||le(n),r=pe(n),!r||/^T[HD]$/.test(r.nodeName))return se(n,e.createElement("BR")),n.collapse(!1),e.setSelection(n),void e._updatePath(n,!0);if((o=u(r,"LI"))&&(r=o),!r.textContent){if(u(r,"UL")||u(r,"OL"))return e.modifyBlocks(nt,n);if(u(r,"BLOCKQUOTE"))return e.modifyBlocks(Ye,n)}for(i=je(e,r,n.startContainer,n.startOffset),ze(r),Ue(r),S(r);i.nodeType===x;){var a,s=i.firstChild;if("A"===i.nodeName&&(!i.textContent||i.textContent===H)){s=e._doc.createTextNode(""),v(i,s),i=s;break}for(;s&&s.nodeType===R&&!s.data&&(a=s.nextSibling,a&&"BR"!==a.nodeName);)m(s),s=a;if(!s||"BR"===s.nodeName||s.nodeType===R&&!j)break;i=s}n=e._createRange(i,0),e.setSelection(n),e._updatePath(n,!0),i.nodeType===R&&(i=i.parentNode);var d=e._doc,l=e._body;i.offsetTop+i.offsetHeight>(d.documentElement.scrollTop||l.scrollTop)+l.offsetHeight&&i.scrollIntoView(!1)},backspace:function(e,t,n){if(e._removeZWS(),e._recordUndoState(n),e._getRangeAndRemoveBookmark(n),n.collapsed)if(ve(n)){t.preventDefault();var r=pe(n),o=r&&f(r);if(o){if(!o.isContentEditable)return void m(o);for(b(o,r,n),r=o.parentNode;r&&!r.nextSibling;)r=r.parentNode;r&&(r=r.nextSibling)&&E(r),e.setSelection(n)}else if(r){if(u(r,"UL")||u(r,"OL"))return e.modifyBlocks(nt,n);if(u(r,"BLOCKQUOTE"))return e.modifyBlocks(Qe,n);e.setSelection(n),e._updatePath(n,!0)}}else e.setSelection(n),setTimeout(function(){be(e)},0);else t.preventDefault(),le(n),be(e,n)},"delete":function(e,t,n){if(e._removeZWS(),e._recordUndoState(n),e._getRangeAndRemoveBookmark(n),n.collapsed)if(Ne(n)){t.preventDefault();var r=pe(n),o=r&&h(r);if(o){if(!o.isContentEditable)return void m(o);for(b(r,o,n),o=r.parentNode;o&&!o.nextSibling;)o=o.parentNode;o&&(o=o.nextSibling)&&E(o),e.setSelection(n),e._updatePath(n,!0)}}else{var i,a,s,d=n.cloneRange();if(ue(n,e._body),i=n.endContainer,a=n.endOffset,i.nodeType===x&&(s=i.childNodes[a],s&&"IMG"===s.nodeName))return t.preventDefault(),m(s),he(n),void be(e,n);e.setSelection(d),setTimeout(function(){be(e)},0)}else t.preventDefault(),le(n),be(e,n)},tab:function(e,t,n){var r,o;if(e._removeZWS(),n.collapsed&&ve(n)&&Ne(n)){for(r=pe(n);o=r.parentNode;){if("UL"===o.nodeName||"OL"===o.nodeName){r.previousSibling&&(t.preventDefault(),e.modifyBlocks(tt,n));break}r=o}t.preventDefault()}},space:function(e,t,n){var r,o;e._recordUndoState(n),ot(n.startContainer),e._getRangeAndRemoveBookmark(n),r=n.endContainer,o=r.parentNode,n.collapsed&&"A"===o.nodeName&&!r.nextSibling&&n.endOffset===g(r)&&n.setStartAfter(o),e.setSelection(n)},left:function(e){e._removeZWS()},right:function(e){e._removeZWS()}};Z&&q&&W.getSelection().modify&&(Ee["meta-left"]=function(e,t){t.preventDefault(),e._sel.modify("move","backward","lineboundary")},Ee["meta-right"]=function(e,t){t.preventDefault(),e._sel.modify("move","forward","lineboundary")}),Ee[Q+"b"]=Te("B"),Ee[Q+"i"]=Te("I"),Ee[Q+"u"]=Te("U"),Ee[Q+"shift-7"]=Te("S"),Ee[Q+"shift-5"]=Te("SUB",{tag:"SUP"}),Ee[Q+"shift-6"]=Te("SUP",{tag:"SUB"}),Ee[Q+"shift-8"]=ye("makeUnorderedList"),Ee[Q+"shift-9"]=ye("makeOrderedList"),Ee[Q+"["]=ye("decreaseQuoteLevel"),Ee[Q+"]"]=ye("increaseQuoteLevel"),Ee[Q+"y"]=ye("redo"),Ee[Q+"z"]=ye("undo"),Ee[Q+"shift-z"]=ye("redo");var ke={1:10,2:13,3:16,4:18,5:24,6:32,7:48},Be={backgroundColor:{regexp:ee,replace:function(e,t){return C(e,"SPAN",{"class":"highlight",style:"background-color: "+t})}},color:{regexp:ee,replace:function(e,t){return C(e,"SPAN",{"class":"colour",style:"color:"+t})}},fontWeight:{regexp:/^bold/i,replace:function(e){return C(e,"B")}},fontStyle:{regexp:/^italic/i,replace:function(e){return C(e,"I")}},fontFamily:{regexp:ee,replace:function(e,t){return C(e,"SPAN",{"class":"font",style:"font-family:"+t})}},fontSize:{regexp:ee,replace:function(e,t){return C(e,"SPAN",{"class":"size",style:"font-size:"+t})}}},Oe=function(e){return function(t,n){var r=C(t.ownerDocument,e);return n.replaceChild(r,t),r.appendChild(N(t)),r}},Ae={SPAN:function(e,t){var n,r,o,i,a,s,d=e.style,l=e.ownerDocument;for(n in Be)r=Be[n],o=d[n],o&&r.regexp.test(o)&&(s=r.replace(l,o),i&&i.appendChild(s),i=s,a||(a=s));return a&&(i.appendChild(N(e)),t.replaceChild(a,e)),i||e},STRONG:Oe("B"),EM:Oe("I"),STRIKE:Oe("S"),FONT:function(e,t){var n,r,o,i,a,s=e.face,d=e.size,l=e.color,c=e.ownerDocument;return s&&(n=C(c,"SPAN",{"class":"font",style:"font-family:"+s}),a=n,i=n),d&&(r=C(c,"SPAN",{"class":"size",style:"font-size:"+ke[d]+"px"}),a||(a=r),i&&i.appendChild(r),i=r),l&&/^#?([\dA-F]{3}){1,2}$/i.test(l)&&("#"!==l.charAt(0)&&(l="#"+l),o=C(c,"SPAN",{"class":"colour",style:"color:"+l}),a||(a=o),i&&i.appendChild(o),i=o),a||(a=i=C(c,"SPAN")),t.replaceChild(a,e),i.appendChild(N(e)),i},TT:function(e,t){var n=C(e.ownerDocument,"SPAN",{"class":"font",style:'font-family:menlo,consolas,"courier new",monospace'});return t.replaceChild(n,e),n.appendChild(N(e)),n}},Le=/^(?:A(?:DDRESS|RTICLE|SIDE|UDIO)|BLOCKQUOTE|CAPTION|D(?:[DLT]|IV)|F(?:IGURE|OOTER)|H[1-6]|HEADER|L(?:ABEL|EGEND|I)|O(?:L|UTPUT)|P(?:RE)?|SECTION|T(?:ABLE|BODY|D|FOOT|H|HEAD|R)|UL)$/,xe=/^(?:HEAD|META|STYLE)/,Re=new n(null,I|U,function(){return!0}),De=function at(e){var t,n,r,o,i,a,d,l,c,f,h,u,p=e.childNodes;for(t=e;s(t);)t=t.parentNode;for(Re.root=t,n=0,r=p.length;r>n;n+=1)if(o=p[n],i=o.nodeName,a=o.nodeType,d=Ae[i],a===x){if(l=o.childNodes.length,d)o=d(o,e);else{if(xe.test(i)){e.removeChild(o),n-=1,r-=1;continue}if(!Le.test(i)&&!s(o)){n-=1,r+=l-1,e.replaceChild(N(o),o);continue}}l&&at(o)}else{if(a===R){if(h=o.data,c=/\s/.test(h.charAt(0)),f=/\s/.test(h.charAt(h.length-1)),!c&&!f)continue;if(c){for(Re.currentNode=o;(u=Re.previousPONode())&&(i=u.nodeName,!("IMG"===i||"#text"===i&&/\S/.test(u.data)));)if(!s(u)){u=null;break}u||(h=h.replace(/^\s+/g,""))}if(f){for(Re.currentNode=o;(u=Re.nextNode())&&!("IMG"===i||"#text"===i&&/\S/.test(u.data));)if(!s(u)){u=null;break}u||(h=h.replace(/^\s+/g,""))}if(h){o.data=h;continue}}e.removeChild(o),n-=1,r-=1}return e},Ue=function st(e){for(var t,n=e.childNodes,r=n.length;r--;)t=n[r],t.nodeType!==x||a(t)?t.nodeType!==R||t.data||e.removeChild(t):(st(t),s(t)&&!t.firstChild&&e.removeChild(t))},Ie=function(e){return e.nodeType===x?"BR"===e.nodeName:ee.test(e.data)},Pe=function(e){for(var t,r=e.parentNode;s(r);)r=r.parentNode;return t=new n(r,U|I,Ie),t.currentNode=e,!!t.nextNode()},we=function(e){var t,n,r,o=e.querySelectorAll("BR"),i=[],a=o.length;for(t=0;a>t;t+=1)i[t]=Pe(o[t]);for(;a--;)n=o[a],r=n.parentNode,r&&(i[a]?s(r)||_(r):m(n))},Fe=function(){var e=this.getSelection(),t=this;this._recordUndoState(e),this._getRangeAndRemoveBookmark(e),this.setSelection(e),setTimeout(function(){try{t._ensureBottomLine()}catch(e){t.didError(e)}},0)},Me=function(e){var t,n,r,o=e.clipboardData,i=o&&o.items,a=!1,s=!1,d=null,l=this;if(i){for(e.preventDefault(),t=i.length;t--;){if(n=i[t],r=n.type,"text/html"===r)return void n.getAsString(function(e){l.insertHTML(e,!0)});"text/plain"===r&&(d=n),/^image\/.*/.test(r)&&(s=!0)}return void(s?(this.fireEvent("dragover",{dataTransfer:o,preventDefault:function(){a=!0}}),a&&this.fireEvent("drop",{dataTransfer:o})):d&&n.getAsString(function(e){l.insertPlainText(e,!0)}))}this._awaitingPaste=!0;var c=this._body,f=this.getSelection(),h=f.startContainer,u=f.startOffset,p=f.endContainer,g=f.endOffset,v=pe(f),N=this.createElement("DIV",{style:"position: absolute; overflow: hidden; top:"+(c.scrollTop+(v?v.getBoundingClientRect().top:0))+"px; right: 150%; width: 1px; height: 1px;"});c.appendChild(N),f.selectNodeContents(N),this.setSelection(f),setTimeout(function(){try{l._awaitingPaste=!1;for(var e,t,n="",r=N;N=r;)r=N.nextSibling,m(N),e=N.firstChild,e&&e===N.lastChild&&"DIV"===e.nodeName&&(N=e),n+=N.innerHTML;t=l._createRange(h,u,p,g),l.setSelection(t),n&&l.insertHTML(n,!0)}catch(o){l.didError(o)}},0)},He=[],We=O.prototype;We.setConfig=function(e){return e=B({blockTag:"DIV",blockAttributes:null,tagAttributes:{blockquote:null,ul:null,ol:null,li:null}},e),e.blockTag=e.blockTag.toUpperCase(),this._config=e,this},We.createElement=function(e,t,n){return C(this._doc,e,t,n)},We.createDefaultBlock=function(e){var t=this._config;return S(this.createElement(t.blockTag,t.blockAttributes,e))},We.didError=function(e){console.log(e)},We.getDocument=function(){return this._doc};var Ke={focus:1,blur:1,pathChange:1,select:1,input:1,undoStateChange:1};We.fireEvent=function(e,t){var n,r,o,i=this._events[e];if(i)for(t||(t={}),t.type!==e&&(t.type=e),i=i.slice(),n=0,r=i.length;r>n;n+=1){o=i[n];try{o.handleEvent?o.handleEvent(t):o.call(this,t)}catch(a){a.details="Squire: fireEvent error. Event type: "+e,this.didError(a)}}return this},We.destroy=function(){var e,t=this._win,n=this._doc,r=this._events;t.removeEventListener("focus",this,!1),t.removeEventListener("blur",this,!1);for(e in r)Ke[e]||n.removeEventListener(e,this,!0);this._mutation&&this._mutation.disconnect();for(var o=He.length;o--;)He[o]===this&&He.splice(o,1)},We.handleEvent=function(e){this.fireEvent(e.type,e)},We.addEventListener=function(e,t){var n=this._events[e];return t?(n||(n=this._events[e]=[],Ke[e]||this._doc.addEventListener(e,this,!0)),n.push(t),this):(this.didError({name:"Squire: addEventListener with null or undefined fn",message:"Event type: "+e}),this)},We.removeEventListener=function(e,t){var n,r=this._events[e];if(r){for(n=r.length;n--;)r[n]===t&&r.splice(n,1);r.length||(delete this._events[e],Ke[e]||this._doc.removeEventListener(e,this,!1))}return this},We._createRange=function(e,t,n,r){if(e instanceof this._win.Range)return e.cloneRange();var o=this._doc.createRange();return o.setStart(e,t),n?o.setEnd(n,r):o.setEnd(e,t),o},We._moveCursorTo=function(e){var t=this._body,n=this._createRange(t,e?0:t.childNodes.length);return he(n),this.setSelection(n),this},We.moveCursorToStart=function(){return this._moveCursorTo(!0)},We.moveCursorToEnd=function(){return this._moveCursorTo(!1)},We.setSelection=function(e){if(e){z&&this._win.focus();var t=this._sel;t.removeAllRanges(),t.addRange(e)}return this},We.getSelection=function(){var e,t,n,r=this._sel;return r.rangeCount?(e=r.getRangeAt(0).cloneRange(),t=e.startContainer,n=e.endContainer,t&&a(t)&&e.setStartBefore(t),n&&a(n)&&e.setEndBefore(n),this._lastSelection=e):e=this._lastSelection,e||(e=this._createRange(this._body.firstChild,0)),e},We.getSelectedText=function(){var e,t=this.getSelection(),r=new n(t.commonAncestorContainer,I|U,function(e){return fe(t,e,!0)}),o=t.startContainer,i=t.endContainer,a=r.currentNode=o,d="",l=!1;for(r.filter(a)||(a=r.nextNode());a;)a.nodeType===R?(e=a.data,e&&/\S/.test(e)&&(a===i&&(e=e.slice(0,t.endOffset)),a===o&&(e=e.slice(t.startOffset)),d+=e,l=!0)):("BR"===a.nodeName||l&&!s(a))&&(d+="\n",l=!1),a=r.nextNode();return d},We.getPath=function(){return this._path};var ze=function(e){for(var t,r,o,i=new n(e,I,function(){return!0},!1);r=i.nextNode();)for(;(o=r.data.indexOf(H))>-1;){if(1===r.length){do t=r.parentNode,t.removeChild(r),r=t;while(s(r)&&!g(r));break}r.deleteData(o,1)}};We._didAddZWS=function(){this._hasZWS=!0},We._removeZWS=function(){this._hasZWS&&(ze(this._body),this._hasZWS=!1)},We._updatePath=function(e,t){var n,r=e.startContainer,o=e.endContainer;(t||r!==this._lastAnchorNode||o!==this._lastFocusNode)&&(this._lastAnchorNode=r,this._lastFocusNode=o,n=r&&o?r===o?p(o):"(selection)":"",this._path!==n&&(this._path=n,this.fireEvent("pathChange",{path:n}))),e.collapsed||this.fireEvent("select")},We._updatePathOnEvent=function(){this._updatePath(this.getSelection())},We.focus=function(){return j||this._body.focus(),this._win.focus(),this},We.blur=function(){return q&&this._body.blur(),top.focus(),this};var Ze="squire-selection-start",qe="squire-selection-end";We._saveRangeToBookmark=function(e){var t,n=this.createElement("INPUT",{id:Ze,type:"hidden"}),r=this.createElement("INPUT",{id:qe,type:"hidden"});se(e,n),e.collapse(!1),se(e,r),n.compareDocumentPosition(r)&L&&(n.id=qe,r.id=Ze,t=n,n=r,r=t),e.setStartAfter(n),e.setEndBefore(r)},We._getRangeAndRemoveBookmark=function(e){var t=this._doc,n=t.getElementById(Ze),r=t.getElementById(qe);if(n&&r){var o,i=n.parentNode,a=r.parentNode,s={startContainer:i,endContainer:a,startOffset:te.call(i.childNodes,n),endOffset:te.call(a.childNodes,r)};i===a&&(s.endOffset-=1),m(n),m(r),T(i,s),i!==a&&T(a,s),e||(e=t.createRange()),e.setStart(s.startContainer,s.startOffset),e.setEnd(s.endContainer,s.endOffset),o=e.collapsed,he(e),o&&e.collapse(!0)}return e||null},We._keyUpDetectChange=function(e){var t=e.keyCode;e.ctrlKey||e.metaKey||e.altKey||!(16>t||t>20)||!(33>t||t>45)||this._docWasChanged()},We._docWasChanged=function(){return J&&this._ignoreChange?void(this._ignoreChange=!1):(this._isInUndoState&&(this._isInUndoState=!1,this.fireEvent("undoStateChange",{canUndo:!0,canRedo:!1})),void this.fireEvent("input"))},We._recordUndoState=function(e){if(!this._isInUndoState){var t=this._undoIndex+=1,n=this._undoStack;t<this._undoStackLength&&(n.length=this._undoStackLength=t),e&&this._saveRangeToBookmark(e),n[t]=this._getHTML(),this._undoStackLength+=1,this._isInUndoState=!0}},We.undo=function(){if(0!==this._undoIndex||!this._isInUndoState){this._recordUndoState(this.getSelection()),this._undoIndex-=1,this._setHTML(this._undoStack[this._undoIndex]);var e=this._getRangeAndRemoveBookmark();e&&this.setSelection(e),this._isInUndoState=!0,this.fireEvent("undoStateChange",{canUndo:0!==this._undoIndex,canRedo:!0}),this.fireEvent("input")}return this},We.redo=function(){var e=this._undoIndex,t=this._undoStackLength;if(t>e+1&&this._isInUndoState){this._undoIndex+=1,this._setHTML(this._undoStack[this._undoIndex]);var n=this._getRangeAndRemoveBookmark();n&&this.setSelection(n),this.fireEvent("undoStateChange",{canUndo:!0,canRedo:t>e+2}),this.fireEvent("input")}return this},We.hasFormat=function(e,t,r){if(e=e.toUpperCase(),t||(t={}),!r&&!(r=this.getSelection()))return!1;var o,i,a=r.commonAncestorContainer;if(u(a,e,t))return!0;if(a.nodeType===R)return!1;o=new n(a,I,function(e){return fe(r,e,!0)},!1);for(var s=!1;i=o.nextNode();){if(!u(i,e,t))return!1;s=!0}return s},We._addFormat=function(e,t,r){var o,i,a,s,d,l,c,f;if(r.collapsed)o=S(this.createElement(e,t)),se(r,o),r.setStart(o.firstChild,o.firstChild.length),r.collapse(!0);else{if(i=new n(r.commonAncestorContainer,I|U,function(e){return(e.nodeType===R||"BR"===e.nodeName)&&fe(r,e,!0)},!1),a=r.startContainer,d=r.startOffset,s=r.endContainer,l=r.endOffset,i.currentNode=a,i.filter(a)||(a=i.nextNode(),d=0),!a)return r;do c=i.currentNode,f=!u(c,e,t),f&&(c===s&&c.length>l&&c.splitText(l),c===a&&d&&(c=c.splitText(d),s===a&&(s=c,l-=d),a=c,d=0),o=this.createElement(e,t),v(c,o),o.appendChild(c));while(i.nextNode());s.nodeType!==R&&(c.nodeType===R?(s=c,l=c.length):(s=c.parentNode,l=1)),r=this._createRange(a,d,s,l)}return r},We._removeFormat=function(e,t,n,r){this._saveRangeToBookmark(n);var i,a=this._doc;n.collapsed&&($?(i=a.createTextNode(H),this._didAddZWS()):i=a.createTextNode(""),se(n,i));for(var d=n.commonAncestorContainer;s(d);)d=d.parentNode;var l=n.startContainer,c=n.startOffset,f=n.endContainer,h=n.endOffset,u=[],p=function(e,t){if(!fe(n,e,!1)){var r,o,i=e.nodeType===R;if(!fe(n,e,!0))return void("INPUT"===e.nodeName||i&&!e.data||u.push([t,e]));if(i)e===f&&h!==e.length&&u.push([t,e.splitText(h)]),e===l&&c&&(e.splitText(c),u.push([t,e]));else for(r=e.firstChild;r;r=o)o=r.nextSibling,p(r,t)}},g=Array.prototype.filter.call(d.getElementsByTagName(e),function(r){return fe(n,r,!0)&&o(r,e,t)});r||g.forEach(function(e){p(e,e)}),u.forEach(function(e){var t=e[0].cloneNode(!1),n=e[1];v(n,t),t.appendChild(n)}),g.forEach(function(e){v(e,N(e))}),this._getRangeAndRemoveBookmark(n),i&&n.collapse(!1);var m={startContainer:n.startContainer,startOffset:n.startOffset,endContainer:n.endContainer,endOffset:n.endOffset};return T(d,m),n.setStart(m.startContainer,m.startOffset),n.setEnd(m.endContainer,m.endOffset),n},We.changeFormat=function(e,t,n,r){return n||(n=this.getSelection())?(this._recordUndoState(n),this._getRangeAndRemoveBookmark(n),t&&(n=this._removeFormat(t.tag.toUpperCase(),t.attributes||{},n,r)),e&&(n=this._addFormat(e.tag.toUpperCase(),e.attributes||{},n)),this.setSelection(n),this._updatePath(n,!0),J||this._docWasChanged(),this):void 0};var Ve={DT:"DD",DD:"DT",LI:"LI"},je=function(e,t,n,r){var i=Ve[t.nodeName],a=null,s=y(n,r,t.parentNode),d=e._config;return i||(i=d.blockTag,a=d.blockAttributes),o(s,i,a)||(t=C(s.ownerDocument,i,a),s.dir&&(t.dir=s.dir),v(s,t),t.appendChild(N(s)),s=t),s};We.forEachBlock=function(e,t,n){if(!n&&!(n=this.getSelection()))return this;t&&(this._recordUndoState(n),this._getRangeAndRemoveBookmark(n));var r=pe(n),o=ge(n);if(r&&o)do if(e(r)||r===o)break;while(r=h(r));return t&&(this.setSelection(n),this._updatePath(n,!0),J||this._docWasChanged()),this},We.modifyBlocks=function(e,t){if(!t&&!(t=this.getSelection()))return this;this._isInUndoState?this._saveRangeToBookmark(t):this._recordUndoState(t),Ce(t);var n,r=this._body;return ue(t,r),n=de(t,r),se(t,e.call(this,n)),t.endOffset<t.endContainer.childNodes.length&&E(t.endContainer.childNodes[t.endOffset]),E(t.startContainer.childNodes[t.startOffset]),this._getRangeAndRemoveBookmark(t),this.setSelection(t),this._updatePath(t,!0),J||this._docWasChanged(),this};var Ge=function(e){return this.createElement("BLOCKQUOTE",this._config.tagAttributes.blockquote,[e])},Qe=function(e){var t=e.querySelectorAll("blockquote");return Array.prototype.filter.call(t,function(e){return!u(e.parentNode,"BLOCKQUOTE")}).forEach(function(e){v(e,N(e))}),e},Ye=function(){return this.createDefaultBlock([this.createElement("INPUT",{id:Ze,type:"hidden"}),this.createElement("INPUT",{id:qe,type:"hidden"})])},$e=function(e,t,n){for(var r,o,i,a,s=c(t),d=e._config.tagAttributes,l=d[n.toLowerCase()],f=d.li;r=s.nextNode();)o=r.parentNode.nodeName,"LI"!==o?(a=e.createElement("LI",f),r.dir&&(a.dir=r.dir),(i=r.previousSibling)&&i.nodeName===n?i.appendChild(a):v(r,e.createElement(n,l,[a])),a.appendChild(r)):(r=r.parentNode.parentNode,o=r.nodeName,o!==n&&/^[OU]L$/.test(o)&&v(r,e.createElement(n,l,[N(r)])))},Xe=function(e){return $e(this,e,"UL"),e},Je=function(e){return $e(this,e,"OL"),e},et=function(e){var t,n,r,o,i,a,s,d=e.querySelectorAll("UL, OL");for(t=0,n=d.length;n>t;t+=1){for(o=d[t],i=N(o),a=i.childNodes,r=a.length;r--;)s=a[r],v(s,N(s));_(i),v(o,i)}return e},tt=function(e){var t,n,r,o,i,a,s=e.querySelectorAll("LI"),d=this._config.tagAttributes,c=d.li;for(t=0,n=s.length;n>t;t+=1)r=s[t],l(r.firstChild)||(o=r.parentNode.nodeName,i=r.previousSibling,i&&(i=i.lastChild)&&i.nodeName===o||(a=d[o.toLowerCase()],v(r,this.createElement("LI",c,[i=this.createElement(o,a)]))),i.appendChild(r));
return e},nt=function(e){var t=e.querySelectorAll("LI");return Array.prototype.filter.call(t,function(e){return!l(e.firstChild)}).forEach(function(t){var n,r=t.parentNode,o=r.parentNode,i=t.firstChild,a=i;for(t.previousSibling&&(r=y(r,t,o));a&&(n=a.nextSibling,!l(a));)o.insertBefore(a,r),a=n;for("LI"===o.nodeName&&i.previousSibling&&y(o,i,o.parentNode);t!==e&&!t.childNodes.length;)r=t.parentNode,r.removeChild(t),t=r},this),_(e),e};We._ensureBottomLine=function(){var e=this._body,t=e.lastElementChild;t&&t.nodeName===this._config.blockTag&&d(t)||e.appendChild(this.createDefaultBlock())},We.setKeyHandler=function(e,t){return this._keyHandlers[e]=t,this},We._getHTML=function(){return this._body.innerHTML},We._setHTML=function(e){var t=this._body;t.innerHTML=e;do S(t);while(t=h(t));this._ignoreChange=!0},We.getHTML=function(e){var t,n,r,o,i,a=[];if(e&&(i=this.getSelection())&&this._saveRangeToBookmark(i),Y)for(t=this._body;t=h(t);)t.textContent||t.querySelector("BR")||(n=this.createElement("BR"),t.appendChild(n),a.push(n));if(r=this._getHTML().replace(/\u200B/g,""),Y)for(o=a.length;o--;)m(a[o]);return i&&this._getRangeAndRemoveBookmark(i),r},We.setHTML=function(e){var t,n=this._doc.createDocumentFragment(),r=this.createElement("DIV");r.innerHTML=e,n.appendChild(N(r)),De(n),we(n),_(n);for(var o=n;o=h(o);)S(o);this._ignoreChange=!0;for(var i=this._body;t=i.lastChild;)i.removeChild(t);i.appendChild(n),S(i),this._undoIndex=-1,this._undoStack.length=0,this._undoStackLength=0,this._isInUndoState=!1;var a=this._getRangeAndRemoveBookmark()||this._createRange(i.firstChild,0);return this._recordUndoState(a),this._getRangeAndRemoveBookmark(a),X?this._lastSelection=a:this.setSelection(a),this._updatePath(a,!0),this},We.insertElement=function(e,t){if(t||(t=this.getSelection()),t.collapse(!0),s(e))se(t,e),t.setStartAfter(e);else{for(var n,r,o=this._body,i=pe(t)||o;i!==o&&!i.nextSibling;)i=i.parentNode;i!==o&&(n=i.parentNode,r=y(n,i.nextSibling,o)),r?o.insertBefore(e,r):(o.appendChild(e),r=this.createDefaultBlock(),o.appendChild(r)),t.setStart(r,0),t.setEnd(r,0),he(t)}return this.focus(),this.setSelection(t),this._updatePath(t),this},We.insertImage=function(e,t){var n=this.createElement("IMG",B({src:e},t));return this.insertElement(n),n};var rt=/\b((?:(?:ht|f)tps?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,}\/)(?:[^\s()<>]+|\([^\s()<>]+\))+(?:\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))|([\w\-.%+]+@(?:[\w\-]+\.)+[A-Z]{2,}\b)/i,ot=function(e){for(var t,r,o,i,a,s,d,l=e.ownerDocument,c=new n(e,I,function(e){return!u(e,"A")},!1);t=c.nextNode();)for(r=t.data,o=t.parentNode;i=rt.exec(r);)a=i.index,s=a+i[0].length,a&&(d=l.createTextNode(r.slice(0,a)),o.insertBefore(d,t)),d=l.createElement("A"),d.textContent=r.slice(a,s),d.href=i[1]?/^(?:ht|f)tps?:/.test(i[1])?i[1]:"http://"+i[1]:"mailto:"+i[2],o.insertBefore(d,t),t.data=r=r.slice(s)};We.insertHTML=function(e,t){var n=this.getSelection(),r=this._doc.createDocumentFragment(),o=this.createElement("DIV");o.innerHTML=e,r.appendChild(N(o)),this._recordUndoState(n),this._getRangeAndRemoveBookmark(n);try{var i=r,a={fragment:r,preventDefault:function(){this.defaultPrevented=!0},defaultPrevented:!1};for(ot(r),De(r),we(r),Ue(r),r.normalize();i=h(i);)S(i);t&&this.fireEvent("willPaste",a),a.defaultPrevented||(ce(n,a.fragment),J||this._docWasChanged(),n.collapse(!1),this._ensureBottomLine()),this.setSelection(n),this._updatePath(n,!0)}catch(s){this.didError(s)}return this},We.insertPlainText=function(e,t){var n,r,o=e.split("\n");for(n=1,r=o.length-1;r>n;n+=1)o[n]="<DIV>"+o[n].split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").replace(/ (?= )/g,"&nbsp;")+"</DIV>";return this.insertHTML(o.join(""),t)};var it=function(e,t,n){return function(){return this[e](t,n),this.focus()}};We.addStyles=function(e){if(e){var t=this._doc.documentElement.firstChild,n=this.createElement("STYLE",{type:"text/css"});n.appendChild(this._doc.createTextNode(e)),t.appendChild(n)}return this},We.bold=it("changeFormat",{tag:"B"}),We.italic=it("changeFormat",{tag:"I"}),We.underline=it("changeFormat",{tag:"U"}),We.strikethrough=it("changeFormat",{tag:"S"}),We.subscript=it("changeFormat",{tag:"SUB"},{tag:"SUP"}),We.superscript=it("changeFormat",{tag:"SUP"},{tag:"SUB"}),We.removeBold=it("changeFormat",null,{tag:"B"}),We.removeItalic=it("changeFormat",null,{tag:"I"}),We.removeUnderline=it("changeFormat",null,{tag:"U"}),We.removeStrikethrough=it("changeFormat",null,{tag:"S"}),We.removeSubscript=it("changeFormat",null,{tag:"SUB"}),We.removeSuperscript=it("changeFormat",null,{tag:"SUP"}),We.makeLink=function(e,t){var n=this.getSelection();if(n.collapsed){var r=e.indexOf(":")+1;if(r)for(;"/"===e[r];)r+=1;se(n,this._doc.createTextNode(e.slice(r)))}return t||(t={}),t.href=e,this.changeFormat({tag:"A",attributes:t},{tag:"A"},n),this.focus()},We.removeLink=function(){return this.changeFormat(null,{tag:"A"},this.getSelection(),!0),this.focus()},We.setFontFace=function(e){return this.changeFormat({tag:"SPAN",attributes:{"class":"font",style:"font-family: "+e+", sans-serif;"}},{tag:"SPAN",attributes:{"class":"font"}}),this.focus()},We.setFontSize=function(e){return this.changeFormat({tag:"SPAN",attributes:{"class":"size",style:"font-size: "+("number"==typeof e?e+"px":e)}},{tag:"SPAN",attributes:{"class":"size"}}),this.focus()},We.setTextColour=function(e){return this.changeFormat({tag:"SPAN",attributes:{"class":"colour",style:"color: "+e}},{tag:"SPAN",attributes:{"class":"colour"}}),this.focus()},We.setHighlightColour=function(e){return this.changeFormat({tag:"SPAN",attributes:{"class":"highlight",style:"background-color: "+e}},{tag:"SPAN",attributes:{"class":"highlight"}}),this.focus()},We.setTextAlignment=function(e){return this.forEachBlock(function(t){t.className=(t.className.split(/\s+/).filter(function(e){return!/align/.test(e)}).join(" ")+" align-"+e).trim(),t.style.textAlign=e},!0),this.focus()},We.setTextDirection=function(e){return this.forEachBlock(function(t){t.dir=e},!0),this.focus()},We.removeAllFormatting=function(e){if(!e&&!(e=this.getSelection())||e.collapsed)return this;for(var t=e.commonAncestorContainer;t&&!d(t);)t=t.parentNode;if(t||(Ce(e),t=this._body),t.nodeType===R)return this;this._recordUndoState(e),this._getRangeAndRemoveBookmark(e),ue(e,t);for(var n,r,o,i=t.ownerDocument,a=e.startContainer,s=e.startOffset,l=e.endContainer,c=e.endOffset,f=i.createDocumentFragment(),h=i.createDocumentFragment(),u=y(l,c,t),p=y(a,s,t);p!==u;)n=p.nextSibling,f.appendChild(p),p=n;return A(this,f,h),h.normalize(),p=h.firstChild,n=h.lastChild,o=t.childNodes,p?(t.insertBefore(h,u),s=te.call(o,p),c=te.call(o,n)+1):(s=te.call(o,u),c=s),r={startContainer:t,startOffset:s,endContainer:t,endOffset:c},T(t,r),e.setStart(r.startContainer,r.startOffset),e.setEnd(r.endContainer,r.endOffset),he(e),this.setSelection(e),this._updatePath(e,!0),this.focus()},We.increaseQuoteLevel=it("modifyBlocks",Ge),We.decreaseQuoteLevel=it("modifyBlocks",Qe),We.makeUnorderedList=it("modifyBlocks",Xe),We.makeOrderedList=it("modifyBlocks",Je),We.removeList=it("modifyBlocks",et),We.increaseListLevel=it("modifyBlocks",tt),We.decreaseListLevel=it("modifyBlocks",nt),We.insertNodeInRange=se,"object"==typeof exports?module.exports=O:top!==W?(W.editor=new O(e),W.onEditorLoad&&(W.onEditorLoad(W.editor),W.onEditorLoad=null)):W.Squire=O}(document);