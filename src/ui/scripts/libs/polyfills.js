//Safe Console Polyfill
window.log = function () {
    'use strict';
    log.history = log.history || [];
    log.history.push(arguments);
    if (window.console) {
        console.log(Array.prototype.slice.call(arguments));
    }
};

window.debounce = function (func, wait, immediate) {
    'use strict';
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) {func.apply(context, args);}
        }, wait);
        if (immediate && !timeout) {func.apply(context, args);}
    };
};

if (typeof Array.prototype.indexOf !== 'function') {
    Array.prototype.indexOf = function indexOf(searchElement, fromIndex) {
        'use strict';
        var length = +this.length || 0;
        // Don't search if there isn't a length
        if (!length) {
            return -1;
        }

        // Convert and transfer the number to 0
        fromIndex = Number(fromIndex);
        if (typeof fromIndex !== 'number' || isNaN(fromIndex)) {
            fromIndex = 0;
        }

        // If the search index goes beyond the length, fail
        if (fromIndex >= length) {
            return -1;
        }

        // If the index is negative, search that many indices from the length
        if (fromIndex < 0) {
            fromIndex = length - Math.abs(fromIndex);
        }

        // Search for the index
        var i;
        for (i = fromIndex; i < length; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        // Fail if no index
        return -1;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}
