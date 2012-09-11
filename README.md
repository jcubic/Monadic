monad.js
========

Very simple script that, I think implement a monad in Javascript 
with 2 aditional methods to modify object methods


Usage
========

Monad function wrap you original object and add new methods `add` and `get`

* add - append new function to monad
* get - return original object

```javascript

var o = Monad({
    baz: 2,
    foo: function(a) {
        this.baz += a;
        return this;
    },
    bar: function(a) {
        this.baz = a * a;
        return this;
    }
});

console.log(o.bar(10).foo(10).add('baz', function() {
    this.baz += 10;
    return this;
}).baz().get().baz);
```

you will get 120.

this is always your original object. If you return that object, then your
function will return Monad object so you can chain your functions.

# Add function to Object prototype

You can add monad method to prototype of the Object using

```javascript
Monad.install();
```

so all objects will have monad method.

# Monadic Functions API

Your wrapped functions inside monad have 3 methods:

* before(function) - value from your before function is is passed to original function
* after(function) - argument to your after function is the value of returned by original function
* when(function) - if function return false the origal function is not executed

You can chain these methods

```javascript
console = console.monad().log.when(function() {
    if (!debug) {
        return false;
    }
}).log.before(function(str) {
   if (str.match(/LOG/)) {
      // save log in the file
   }
   return str;
});
```


In this example `foo` function is modified after it return it's value so
`foo` is always returning 10. Argument to `after` function is a value returned
by a function.

```javascript
console.log(Monad({ foo: function(a) { return 10/a; } }).foo.before(function(a) {
    if (a == 0) {
        throw 'You should not divide by 0, you know';
    } else {
        return a;
    }
}).foo(0));
```


License
========

Copyright (C) 2012 Jakub Jankiewicz &lt;<http://jcubic.pl>&gt;

Licensed under [GNU GPL Version 3 license](http://www.gnu.org/licenses/gpl.html)

