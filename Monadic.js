/*
 *  Monadic - JavaScript micro library
 *  Copyright (C) 2012 Jakub Jankiewicz <http://jcubic.pl>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var Monadic = (function() {

    function Monadic(object, monad) {
        if (monad === false) {
            return new Monadic.init(object, monad);
        } else {
            return new Monadic.init(clone(object), monad);
        }
    }

    Monadic.install = function() {
        Object.prototype.monadic = function(monad) {
            return Monadic(this, monad);
        };
    };

    Monadic.init = function(object, monad) {
        var self = this;
        self.add = function(name, fun) {
            if (name == 'get' || name == 'add') {
                throw "You can't wrap " + name + " function";
            }
            self[name] = function() {
                var ret = fun.apply(object, toArray(arguments));
                if (ret === object || !ret instanceof Monadic.init || typeof ret == 'undefined') {
                    return monad === false ? self : Monadic(object, monad);
                } else {
                    return ret;
                }
            };
            self[name].before = function(fun) {
                var method = self[name];
                self[name] = function() {
                    var ret = method.apply(object,
				         [fun.apply(object, toArray(arguments))]);
                    return ret ? ret : monad === false ? self : Monadic(object, monad);
                };
                move_properties(method, self[name]);
                return self;
            };
            self[name].when = function(condition) {
                var method = self[name];
                self[name] = function() {
                    var args = toArray(arguments);
                    if (condition.apply(object, args) !== false) {
                        var ret = method.apply(object, args);
                        return ret ? ret : monad === false ? self : Monadic(object, monad);
                    } else {
                        return monad === false ? self : Monadic(object, monad);
                    }
                };
                move_properties(method, self[name]);
                return self;
            };
            self[name].after = function(fun) {
                var method = self[name];
                self[name] = function() {
                    var ret = fun.apply(object,
                         [method.apply(object, toArray(arguments))]);
                    return ret ? ret : monad === false ? self : Monadic(object, monad);
                };
                move_properties(method, self[name]);
                return self;
            };
            return self;
        };
        self.get = function() {
            return object;
        };
        for (var name in object) {
            if (!(name == 'add' || name == 'get')) {
                if (typeof object[name] == 'function') {
                    self.add(name, object[name]);
                }
            }
        }
    };

    function clone(object) {
        if (typeof object != 'object' || object === null) {
            return object;
        }
        var new_object = {};
        for (var name in object) {
            new_object[name] = object[name];
        }
        return new_object;
    }

    function move_properties(from, to) {
        for (var name in from) {
            if (from.hasOwnProperty(name)) {
                to[name] = from[name]
            }
        }
    }

    function toArray(array) {
        return Array.prototype.splice.call(array, 0);
    }
    
    return Monadic;
})();
