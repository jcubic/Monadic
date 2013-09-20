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

    function Monadic(object, options) {
        options = options || {};
        if (options.monad === undefined) {
            options.monad = true;
        }
        if (options.curry === undefined) {
            options.curry = true;
        }
        if (!options.monad) {
            return new Monadic.init(object, options);
        } else {
            return new Monadic.init(clone(object), options);
        }
    }

    Monadic.install = function() {
        Object.prototype.monadic = function(monad) {
            return Monadic(this, monad);
        };
    };

    Monadic.init = function(object, options) {
        this.object = object;
        var self = this;

        self.get = function() {
            return object;
        };

        function object_from_proto(object) {
            var result = {};
            var arr = Object.getOwnPropertyNames(object.constructor.prototype);
            for (var i=arr.length;i--;) {
                if (typeof object.constructor.prototype[arr[i]] == 'function') {
                    result[arr[i]] = object.constructor.prototype[arr[i]];
                }
            }
            return result;
        }
        
        function valid_name(name) {
            return !(name == 'get' || name == 'add');
        }
        
        function add_all(object) {
            for (var name in object) {
                if (valid_name(name)) {
                    if (typeof object[name] == 'function') {
                        self.add(name, object[name]);
                    }
                }
            }
        }

        self.add = function(name, fun) {
            if (!valid_name(name)) {
                throw "You can't wrap " + name + " function";
            }
            var original = fun;
            self[name] = function() {
                var ret = fun.apply(object, toArray(arguments));
                if (ret === object || !ret instanceof Monadic.init || typeof ret == 'undefined') {
                    if (!options.monad) {
                        return self;
                    } else {
                        var new_monad = Monadic(object, options);
                        move_functions(self, new_monad);
                        return new_monad;
                    }
                } else {
                    return ret;
                }
            };
            
            // execute function before method
            self[name].before = function(fun) {
                var method = self[name];
                self[name] = function() {
                    var result = fun.apply(object, toArray(arguments));
                    if (result.length) {
                        return ret(method.apply(object, result), options.monad);
                    } else {
                        return ret(method.apply(object, [result]), options.monad);
                    }
                };
                move_properties(method, self[name]);
                return self[name];
            };
            // set limit of arguments to a function - useful for forEach and log
            self[name].limit = function(args) {
                var args = +args;
                if (args < 0) {
                    throw new Error("limit Argument can't be smaller then 0");
                }
                var method = self[name];
                return self[name].before(function() {
                    return Array.prototype.slice.apply(arguments, [0, args]);
                });
            };
            // return object from which the function came from
            self[name].self = function() {
                return self;
            };
            // call a function if condition function return true
            self[name].when = function(condition) {
                var method = self[name];
                self[name] = function() {
                    var args = toArray(arguments);
                    if (condition.apply(object, args) !== false) {
                        return ret(method.apply(object, args), options.monad);
                    } else {
                        return !options.monad ? self : Monadic(object, options);
                    }
                };
                move_properties(method, self[name]);
                return self[name];
            };
            // function that execute after a function
            self[name].after = function(fun) {
                var method = self[name];
                self[name] = function() {
                    return ret(fun.apply(object,
                                         [method.apply(object, toArray(arguments))]),
                               options.monad);
                };
                move_properties(method, self[name]);
                return self[name];
            };
            return self; // add
        };
        add_all(object.constructor == Array ? object_from_proto(object) : object);
    };
    // return a value if function return undefined (usualy don't return anything)
    // new or same Monadic object depend on monad argument
    function ret(value, monad) {
        if (typeof value !== 'undefined') {
            return value;
        } else if (monad === false) {
            return self;
        } else {
            return Monadic(object, monad);
        }
    }

    function clone(object, deep) {
        if (typeof object != 'object' || object === null) {
            return object;
        }
        if (object.constructor == Array) {
            return object.slice();
        } else {   
            var new_object = {};
            for (var name in object) {
                new_object[name] = object[name];
            }
            return new_object;
        }
    }
    // move properties from one object to another use to change methods on functions
    function move_properties(from, to) {
        for (var name in from) {
            if (from.hasOwnProperty(name)) {
                to[name] = from[name]
            }
        }
    }
    
    function move_functions(from, to) {
        for (var name in from) {
            if (from.hasOwnProperty(name) && typeof from[name] == 'function') {
                to[name] = from[name]
            }
        }
    }

    function slice(array, n) {
        return Array.prototype.slice.call(array, n);
    }

    function toArray(array) {
        return slice(array, 0);
    }
    
    return Monadic;
})();
