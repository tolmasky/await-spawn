# @await/spawn

`@await/spawn` is an async wrapper around node's child_process.spawn api.

## API
Four spawn functions are exposed: `spawn`, `verbose`, `stderr`, and `silent`.

Each function takes three arguments: `command`, `args`, `options`.
They're all based on the arguments passed to the child_process.spawn call:
https://nodejs.org/api/child_process.html#child_processspawncommand-args-options

- command `<string>` The command to run.
- args `<string[]>` List of string arguments.
- options `<Object>`
    - cwd `<string> | <URL>` Current working directory of the child process.
    - env `<Object>` Environment key-value pairs. Default: process.env.
    - argv0 `<string>` Explicitly set the value of argv[0] sent to the child process. This will be set to command if not specified.
    - stdio `<Array> | <string>` Child's stdio configuration (see options.stdio).
    - detached `<boolean>` Prepare child to run independently of its parent process. Specific behavior depends on the platform, see options.detached).
    - uid `<number>` Sets the user identity of the process (see setuid(2)).
    - gid `<number>` Sets the group identity of the process (see setgid(2)).
    - serialization `<string>` Specify the kind of serialization used for sending messages between processes. Possible values are 'json' and 'advanced'. See Advanced serialization for more details. Default: 'json'.
    - shell `<boolean> | <string>` If true, runs command inside of a shell. Uses '/bin/sh' on Unix, and process.env.ComSpec on Windows. A different shell can be specified as a string. See Shell requirements and Default Windows shell. Default: false (no shell).
    - windowsVerbatimArguments `<boolean>` No quoting or escaping of arguments is done on Windows. Ignored on Unix. This is set to true automatically when shell is specified and is CMD. Default: false.
    - windowsHide `<boolean>` Hide the subprocess console window that would normally be created on Windows systems. Default: false.
    - signal `<AbortSignal>` allows aborting the child process using an AbortSignal.
    - timeout `<number>` In milliseconds the maximum amount of time the process is allowed to run. Default: undefined.
    - killSignal `<string> | <integer>` The signal value to be used when the spawned process will be killed by timeout or abort signal. Default: 'SIGTERM'.
- Returns: `<ChildProcess>`

### `verbose`
Using the `verbose` function will automatically pass `stdio: ["ignore", "inherit", "inherit"]` as an option.

### `stderr`
Using the `verbose` function will automatically pass `stdio: [0, process.stderr, process.stderr]` as an option.

### `verbose`
Using the `silent` function will automatically pass `stdio: "ignore"` as an option.
