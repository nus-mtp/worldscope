# Coding Convention
Follow [Google Javascript Style Guide](https://google.github.io/styleguide/javascriptguide.xml)

# Additional Conventions
## OOP Conventions
## Exceptions and Errors Handling
## Callbacks
## Logging
## Testing

# Workflow

1. To implement a new feature or bug fix, create a new branch with an informative name e.g. *password-hash-bug*. Changes in the branch should focus on the issue at hand as much as possible. If a task is too big, it's preferable broken down into smaller subtasks.

2. When working on the branch, perform `git merge` or `git rebase` with `master` to sync with any changes on `master`. Rebasing is prefered since it keeps commits history clean.

3. When completed, create a new *pull request* onto `master`. If the build is successful and all tests passes, the pull request can be merged.
