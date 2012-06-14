/*
 *  Monad.js - monad implementation in JavaScript
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
function M(object) {
    var m = new M.init();
	m.__original_object = {};
    if (typeof object == 'object') {
        for (var name in object) {
            if (object.hasOwnProperty(name) && name != 'add' || name != 'get') {
                if (typeof object[name] == 'function') {
                    m.add(name, object[name]);
                } else {
				    m.__original_object[name] = object[name];
                }
            }
        }
    }
    return m;
}

M.init = function() {
    var self = this;
    function check_name(name) {
        if (name == 'add' || name == 'get' || name == '__original_object') {
            throw "You can't overwrite '" + name + "' method";
        }
    }
    self.add = function(name, fun) {
        check_name(name);
        self[name] = function() {
            var ret = fun.apply(self.__original_object,
                                Array.prototype.splice.call(arguments, 0));
            return ret != self.__original_object ? ret : self;
        };
        self[name].before = function(fun, return_object) {
            var __f = self[name];
            self[name] = function() {
                var ret = __f.apply(self,
				     [fun.apply(self, Array.prototype.splice.call(arguments, 0))]);
                return ret ? ret : self;
            };
            return return_object ? self : self[name];
        };
        self[name].after = function(fun, return_object) {
            var __f = self[name];
            self[name] = function() {
                var ret = fun.apply(self,
                     [__f.apply(self, Array.prototype.splice.call(arguments, 0))]);
                return ret ? ret : self;
            };
            return return_object ? self : self[name];
        };
        self[name].object = function() {
            return self;
        };
        return self;
    };
    self['get'] = function() {
        return self.__original_object;
    };
};
