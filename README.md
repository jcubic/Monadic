monad.js
========

Very simple script that, I think implement a monad in Javascript 
with 2 aditional methods to modify object methods


Usage
========

M object wrap you original object and add new methods `add` and `get`

```javascript

var o = new M({
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

You also have 2 methods added to your wrapped function `before` and `after`
that allow you to modify behavior of functions

```javascript

console.log(M({ foo: function(a) { return a; } }).foo.after(function() {
    return 10;
}, true).foo(20));

```

In this example `foo` function is modified after it return it's value so
`foo` is always returning 10. Argument to `after` function is a value returned
by a function.

```javascript
console.log(M({ foo: function(a) { return 10/a; } }).foo.before(function(a) {
    if (a == 0) {
        throw 'You should not divide by 0, you know';
    } else {
        return a;
    }
}, true).foo(0));
```

second argument to `after` and `before` indicate if that function should
return Monad object or function so you can add multiply before and after
functions.


========
License

Copyright (C) 2012 Jakub Jankiewicz &gt;<http://jcubic.pl>&lt;
Licensed under [GNU GPL Version 3 license](http://www.gnu.org/licenses/gpl.html)

