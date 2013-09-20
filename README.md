# Monadic - JavaScript micro library

Very simple library that, I think implement a monad in Javascript and
add some funtionaly to functions that belong to orignal object wraped by
Monadic Monad.

Functions wraped by Monadic, are automaticaly chainable if they don't return
a value. Functions are executed in the context of orignal object. Functions
that modify an object modify local copy of that object that can be retrieve
at the end of monadic chain.

# Usage

Monadic function wrap you original object and add new methods `add` and `get`

* add - append new function to monad
* get - return original object

```javascript

var o = {
    baz: 2,
    foo: function(a) {
        this.baz += a;
    },
    bar: function(a) {
        this.baz = a * a;
    }
};

Monadic(o).bar(10).foo(10).add('baz', function() {
    this.baz += 10;
    return this;
}).baz().get().baz;

```
you will get 120. In orignal o object baz will still equal 2.

## Add function to Object prototype

You can add `monadic` method to Object prototype using:

```javascript
Monad.install();
```

so all objects will have `monadic` method that will create Monadic Monad from
that object.

# Monadic Functions API

Your wrapped functions inside Monadic have these methods (methods that accept a function
will return new function to get monadic object you need to call self).

* before(function) - value from your before function is is passed to original function
* after(function) - argument to your after function is the value of returned by original function
* limit(number) - make a function accept only fixed number of arguments (more arguments are ignored)
* self() - return monadic object
* when(function) - if function return false the origal function is not executed

You can chain these methods

```javascript
console = console.monadic({monad: false}).log.when(function() {
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

When you pass false to monadic method it will keep context of orignal object,
it will not create new object each time you call a method
(it will not be real Monad then), so you can pass `log` as callback.

```javascript
[1,2,3,4].forEach(console.monadic({monad: false}).log.limit(1));
```

In this example `foo` function is modified after it return it's value so
`foo` is always returning 10. Argument to `after` function is a value returned
by a function.

```javascript
Monadic({ foo: function(a) { return 10/a; } }).foo.before(function(a) {
    if (a == 0) {
        throw 'You should not divide by 0, you know';
    } else {
        return a;
    }
}).self().foo(0);
```

**NOTE:** fuction methods are not creating new Monad so they modify original, current Monad object

# License

Copyright (C) 2012 Jakub Jankiewicz &lt;<http://jcubic.pl>&gt;

Licensed under [GNU GPL Version 3 license](http://www.gnu.org/licenses/gpl.html)

