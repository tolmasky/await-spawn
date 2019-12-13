
const { spawn: spawn_native } = require("child_process");
const Stream = require("stream");

function spawn(command, args, options = { })
{
    return new Promise(function (resolve, reject)
    {
        const { captureStdio = true, rejectOnExitCode = true, stdio } = options;
        const captured = { stdout: "", stderr: "" };
    
        const normalizedStdio = getNormalizedStdio(stdio);
        const alteredStdio = captureStdio ? Object.assign([], normalizedStdio, { 1: "pipe", 2: "pipe" }) : normalizedStdio;
        const optionsWithAlteredStdio = Object.assign({ }, options, { stdio: alteredStdio });

        const start = new Date();

        const child = spawn_native(command, args, optionsWithAlteredStdio);

        if (captureStdio)
        {
            child.stdout.on("data", aString => captured.stdout += aString + "");
            child.stderr.on("data", aString => captured.stderr += aString + "");

            if (normalizedStdio[1] === "inherit")
                child.stdout.pipe(process.stdout);

            else if (normalizedStdio[1] instanceof Stream)
                child.stdout.pipe(normalizedStdio[1]);

            if (normalizedStdio[2] === "inherit")
                child.stderr.pipe(process.stderr);

            else if (normalizedStdio[2] instanceof Stream)
                child.stderr.pipe(normalizedStdio[2]);
        }

        child.on("close", function (exitCode)
        {
            const duration = new Date() - start;
            const result = Object.assign(
                { exitCode, duration },
                captureStdio && captured);

            if (exitCode !== 0 && rejectOnExitCode)
                return reject(new ExitCodeError(exitCode, result));

            resolve(result);
        });
    });
}

module.exports = spawn;

module.exports.spawn = spawn;

module.exports.verbose = (command, args, options) =>
    spawn(command, args,
        Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options));

module.exports.verbose.stderr = (command, args, options) =>
    spawn(command, args,
        Object.assign({ stdio: [0, process.stderr, process.stderr] }, options));

module.exports.silent = (command, args, options) =>
    spawn(command, args, Object.assign({ stdio: "ignore" }, options));


function getNormalizedStdio(stdio)
{
    if (typeof stdio === "string")
        return [stdio, stdio, stdio];

    if (Array.isArray(stdio))
        return [].concat(stdio);
    
    return ["pipe", "pipe", "pipe"];
}

function ExitCodeError(anExitCode, properties)
{
    const error = new Error("Process exited with status: " + anExitCode);

    Object.defineProperty(error, "name",
    {
        value: "ExitCodeError",
        writable: true,
        enumerable: false,
        configurable: true
    });

    error.exitCode = anExitCode;
    
    Object.assign(error, properties);

    Object.setPrototypeOf(error, ExitCodeError.prototype);

    return error;
}

ExitCodeError.prototype = Object.create(Error.prototype);
ExitCodeError.prototype.constructor = ExitCodeError;
