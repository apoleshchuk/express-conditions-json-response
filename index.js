module.exports = (acceptType, paramName, paramTrue, paramPath) => {
    const ACCEPT_TYPE = acceptType || /application\/json/;
    const PARAM_NAME = paramName || 'json';
    const PARAM_TRUE = paramTrue || ['on', 'true', '1'];
    const PARAM_PATH = paramPath || /([a-z]{1}\w+)/i;

    function getByPath(path, parent) {
        let parts = path
            // woraround for path by array `[1]`
            .replace(/\[(\d+)\]/g, '.$1')
            .split('.')
            .map(part => parseInt(part) || part);
        let result = parent;
        let part;

        while ((part = parts.shift())) {
            result = result[part];
            if (typeof result == undefined || result === null) {
                break;
            }
        }

        return result;
    }

    return (req, res, next) => {
        let jsonParam = req.query[PARAM_NAME];
        if (Array.isArray(jsonParam)) {
            jsonParam = jsonParam[jsonParam.length - 1];
        }

        if (ACCEPT_TYPE.test(req.headers.accept) || jsonParam != undefined) {
            let jsonPath;
            if (
                jsonParam
                && !PARAM_TRUE.includes(jsonParam)
                && PARAM_PATH.test(jsonParam)
            ) {
                jsonPath = jsonParam;
            }

            res.render = function(name, data) {
                this.json(jsonPath ? getByPath(jsonParam, data) : data);
            }
        }

        next();
    }
}
