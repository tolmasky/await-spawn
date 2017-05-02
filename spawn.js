
const { spawn: spawn_native } = require("child_process");

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

            if (normalizedStdio[2] === "inherit")
                child.stderr.pipe(process.stderr);
        }

        child.on("close", function (anExitCode)
        {
            const result = Object.assign({ exitCode: anExitCode, duration: new Date() - start }, captureStdio && captured);

            if (anExitCode !== 0 && rejectOnExitCode)
                return reject(new ExitCodeError(anExitCode, result));

            resolve(result);
        });
    });
}

module.exports = spawn;

module.exports.spawn = spawn;
module.exports.verbose = (aCommand, args, options) => spawn(aCommand, args, Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options));
module.exports.silent = (aCommand, args, options) => spawn(aCommand, args, Object.assign({ stdio: "ignore" }, options));

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
