const __exports = {};

const define = function (moduleName, dependencies, callback) {
    const moduleExports = __exports[moduleName] = {};
    const args = [null, moduleExports];
    for (let i = 2; i < dependencies.length; i++) {
        args.push(__exports[dependencies[i]]);
    }
    callback.apply(null, args)
}