
const { spawn: spawn_native } = require("child_process");


module.exports = function spawn(command, args, options)
{
    return new Promise(function (resolve, reject)
    {
        const child = spawn_native(command, args, options);
        const { captureStdout, rejectOnExitCode } = options;
        let stdout = "";

        if (captureStdout)
            child.stdout.on("data", aString => stdout += aString + "");

        child.on("close", function (anExitCode)
        {
            const result = Object.assign({ exitCode: anExitCode }, captureStdout && { stdout });
            
            if (anExitCode !== 0 && rejectOnExitCode)
                return reject(new ExitCodeError(anExitCode, result));
                
            resolve(result);
        });
    });
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
