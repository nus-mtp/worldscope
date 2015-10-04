# Coding Convention
Follow [Google Javascript Style Guide](https://google.github.io/styleguide/javascriptguide.xml)

# Additional Conventions

## OOP Conventions
Use simple prototypical OOP and inheritance. Avoid complex tricks and libraries to mimic classical OOP. However, [util.inherits](https://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor) can be used to simplify inheritance.
```javascript
// Create 2 constructors Foo and Bar. Bar inherits Foo
function Foo() {
    this.x = 1;
}
Foo.prototype.plus = function (y) {
    return x + y;
};

function Bar() {
    Foo.call(this);
}

util.inherits(Bar, Foo);
```

Each module should export a single constructor.

## Exceptions and Errors Handling
Use the built-in `Error` constructor. Custom error constructors should inherits from `Error`.

Use [boom](https://github.com/hapijs/boom) module for creating formatting HTTP errors.

## Callbacks
Use named functions for callbacks and avoid deeply nested callbacks. See [Callback Hell](http://callbackhell.com/).

Use [async](https://github.com/caolan/async) or [bluebird](https://github.com/petkaantonov/bluebird) modules when possible.

## Logging
Use [good](https://github.com/hapijs/good) for Hapi server logging and process monitoring.

Use [winston](https://github.com/winstonjs/winston) module for other general logging needs.

## Testing
Use [lab](https://github.com/hapijs/lab) module for unit testing.

Tests should be put inside the top level `test` directory and mirror the structure of the `app` directory.

## Documentation
Use [jsdoc](http://usejsdoc.org/)

# Workflow

1. To implement a new feature or bug fix, create a new branch with an informative name e.g. *password-hash-bug*. Changes in the branch should focus on the issue at hand as much as possible. If a task is too big, it's preferable broken down into smaller subtasks.

2. When working on the branch, perform `git merge` or `git rebase` with `master` to sync with any changes on `master`. Rebasing is prefered since it keeps commits history clean.

4. If some rebased commits have been pushed to the server, use `git push --force` to force update the remote respository.

3. When completed, create a new *pull request* onto `master`. If the build is successful and all tests passes, the pull request can be merged.
