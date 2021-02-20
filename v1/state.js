function arrayItemIsSetFromVariable(array, i, variables, name) {
    if (array[i].from !== undefined) {
        for (let v in variables) {
            const at = variables[v].at;
            if (at !== undefined && at.name === name && at.index == i) {
                return v;
            }
        }
    }
}

function arrayItemIsSetToVariable(array, i, variables, name) {
    if (array[i].at !== undefined) {
        for (let v in variables) {
            const from = variables[v].from;
            if (from !== undefined && from.name === name && from.index == i) {
                return v;
            }
        }
    }
}

state = function() {
    let dataAccessLog;
    const frames = [];

    function newDataAccessLog() {
        return {
            varReads: new Set(),
            varWrites: new Set(),
            arrayReads: new Map(),
            arrayWrites: new Map(),

            arrayItemWasRead: function (arrayVariableName, i) {
                return this.arrayReads.has(arrayVariableName) && dataAccessLog.arrayReads.get(arrayVariableName).has(i);
            },
            arrayItemWasWritten: function (arrayVariableName, i) {
                return this.arrayWrites.has(arrayVariableName) && dataAccessLog.arrayWrites.get(arrayVariableName).has(i);
            },
            varWasRead: function (varName) {
                return this.varReads.has(varName);
            },
            varWasWritten: function (varName) {
                return this.varWrites.has(varName);
            }
        };
    }

    function makeFrame(variables) {
        return {
            contexts: [],
            variables: variables,
            relations: new Map()
        }
    }

    function getCurrentFrame() {
        return frames[frames.length - 1];
    }

    function replaceFrameVariables(altVariables) {
        frames[frames.length - 1].variables = altVariables;
    }


    function getOrEmptySet(map, key) {
        let set = map.get(key);
        if (set === undefined) {
            set = new Set();
            map.set(key, set);
        }
        return set;
    }

    function getV(variables, name) {
        return variables[name];
    }

    function setV(variables, name, value) {
        const existing = variables[name];
        if (existing === undefined) {
            return variables[name] = value;
        }

        if (variables.hasOwnProperty(name)) {
            return variables[name] = value;
        } else {
            setV(variables.__proto__, name, value);
        }
    }

    function getVar(name) {
        return getV(getCurrentFrame().variables, name);
    }

    function wrappedValueFrom(wrappedValue, self, proto, metadata) {
        const aWrappedValue = Object.setPrototypeOf(
            {value: wrappedValue.value, self: self}, proto
        );

        if (metadata !== undefined) {
            aWrappedValue.metadata = metadata;
        }
        if (wrappedValue.self !== undefined) {
            aWrappedValue.from = wrappedValue.self;
        }
        return aWrappedValue;
    }


    return {
        addRelation: (targetArray, name) => {
            getOrEmptySet(getCurrentFrame().relations, targetArray).add(name);
        },

        clearDataAccessLog: () => {dataAccessLog = newDataAccessLog()},
        getDataAccessLog: () => dataAccessLog,

        getVariable: (name) => getVar(name),

        readVar: (name) => {
            dataAccessLog.varReads.add(name);
            const wV = getVar(name);
            const value = wrappedValueFrom(wV, {name: name}, Object.getPrototypeOf(wV));
            console.log("READ VAR " + name + " -> " + JSON.stringify(value));
            return value;
        },

        writeVar: (name, value, metadata) => {
            dataAccessLog.varWrites.add(name);
            const wv = wrappedValueFrom(value, {name: name}, Object.getPrototypeOf(value), metadata);
            console.log(`WRITE VAR ${name} = ${JSON.stringify(value)} -> ${JSON.stringify(wv)}`);
            console.log(wv);

            if (value.self !== undefined && value.self.index !== undefined) {
                // value comes from array element
                (getV(getCurrentFrame().variables, value.self.name).value)[value.self.index].at = {name: name, index: value.self.index};
            }

            setV(getCurrentFrame().variables, name, wv);
        },

        readArrayElement: (name, indexValue) => {
            getOrEmptySet(dataAccessLog.arrayReads, name).add(indexValue);
            const wrappedArray = getVar(name);
            const wrappedElement = wrappedArray.value[indexValue];
            const result = wrappedValueFrom(
                wrappedElement, {name: name, index: indexValue}, Object.getPrototypeOf(wrappedElement)
            );
            console.log("READ ARR ITEM " + name + " " + indexValue + " -> " + JSON.stringify(result));
            return result;
        },

        writeArrayElement: (name, indexValue, value) => {
            getOrEmptySet(dataAccessLog.arrayWrites, name).add(indexValue);
            const wv = wrappedValueFrom(value, {name: name, index: indexValue}, Object.getPrototypeOf(value));

            if (value.self !== undefined && value.self.index === undefined) {
                getVar(value.self.name).at = {name: name, index: indexValue};
            }

            console.log("WRITE ARR ITEM " + name + " " + indexValue + " = " + JSON.stringify(value) + " -> " + JSON.stringify(wv));
            (getVar(name).value)[indexValue] = wv;
        },

        initFrames: () => frames.push(makeFrame(new Map())),
        newFrame: (variables) => frames.push(makeFrame(variables)),
        deleteFrame: () => {
            if (frames.length === 1) return false;
            frames.pop();
            return true;
        },
        currentFrame: () => getCurrentFrame(),


        newSubFrame: () => replaceFrameVariables(Object.setPrototypeOf(new Map(), getCurrentFrame().variables)),
        deleteSubFrame: () => replaceFrameVariables(Object.getPrototypeOf(getCurrentFrame().variables)),


        pushContext: (context) => getCurrentFrame().contexts.push(context),
        popContext: () => getCurrentFrame().contexts.pop()
    }
}();
