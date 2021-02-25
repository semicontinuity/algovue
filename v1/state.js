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
    const dataAccessLog = {
        varReads: new Set(),
        varWrites: new Set(),
        arrayReads: new Map(),
        arrayWrites: new Map(),

        clear: function () {
            this.varReads.clear();
            this.varWrites.clear();
            this.arrayReads.clear();
            this.arrayWrites.clear();
        },

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
    }

    const frames = [];

    function makeFrame(variables) {
        return Object.setPrototypeOf({
            contexts: [],
            variables: variables,
            relations: new Map(),

            addRelation(name1, name2) {
                getOrEmptySet(this.relations, name1).add(name2);
            },
            newSubFrame() {
                this.variables = Object.setPrototypeOf(new Map(), this.variables);
            },
            deleteSubFrame() {
                this.variables = Object.getPrototypeOf(this.variables);
            },

            readVar(name) {
                dataAccessLog.varReads.add(name);
                const aRichValue = this.getV(name);
                // if name is always filled, excessive?
                // return richValue;
                const richValue = makeRichValueFrom(aRichValue, {name: name});
                console.log(`READ VAR ${name}  -> ${JSON.stringify(richValue)}`);
                return richValue;
            },
            writeVar(name, richValue, metadata) {
                console.log('UPDATE ' + name + " = " + richValue.value);
                dataAccessLog.varWrites.add(name);

                const currentRichValue = this.getV(name);
                metadata = metadata || (currentRichValue && currentRichValue.metadata);
                const aRichValue = makeRichValueWithMetadataFrom(richValue, {name: name}, metadata);
                console.log(aRichValue);

                // if value comes from array element...
                if (richValue.from !== undefined && richValue.from.index !== undefined) {
                    (this.getV(richValue.from.name).value)[richValue.from.index].at = {name: name};
                }

                if (metadata !== undefined) {
                    console.log('has metadata');
                    if (metadata['role'] === 'index') {
                        const targetArrays = metadata['targetArrays'];
                        for (let a of targetArrays) {
                            this.addRelation(a, name);
                            this.addRelation(name, a);
                        }
                    } else if (metadata['role'] === 'arrayRangeAggregate') {
                        const metadatum = metadata['indexVar'];
                        const richIndexValue = this.getV(metadatum);
                        if (richIndexValue !== undefined) {
                            console.log('UPDATE arrayRangeAggregate ' + name + " = " + richValue.value);
                            console.log(richIndexValue);
                            const indexVarValue = richIndexValue.value;
                            if (richValue.value === 0) {
                                aRichValue['rangeFrom'] = indexVarValue;
                            } else {
                                aRichValue['rangeTo'] = indexVarValue;
                            }
                            console.log(aRichValue);
                        }
                    }
                }

                this.setV(name, aRichValue);
            },

            getV(name) {
                return this.variables[name];
            },
            setV(name, value) {
                let variables = this.variables;
                while (true) {
                    const existing = variables[name];
                    if (existing === undefined) {
                        return variables[name] = value;
                    }

                    if (variables.hasOwnProperty(name)) {
                        return variables[name] = value;
                    } else {
                        variables = Object.getPrototypeOf(variables);
                    }
                }
            },
            getArrayVariables() {
                const arrayVariables = [];
                for (let name in this.variables) {
                    // own properties correspond to current frame, properties of prototypes correspond to other frames
                    const value = this.variables[name].value;
                    if (Array.isArray(value) || (typeof (value) === 'string' && value.length > 1)) {
                        arrayVariables.push(this.variables[name]);
                    }
                }
                return arrayVariables;
            },

            readArrayElement (name, indexValue) {
                getOrEmptySet(dataAccessLog.arrayReads, name).add(indexValue);
                const richArray = this.getV(name);
                const richElement = richArray.value[indexValue];
                // if name is always filled, excessive?
                const result = makeRichValueFrom(
                    richElement, {name: name, index: indexValue}
                );
                console.log(`READ ARR ITEM ${name} ${indexValue} -> ${JSON.stringify(result)}`);
                return result;
            },
            writeArrayElement (name, indexValue, richValue) {
                getOrEmptySet(dataAccessLog.arrayWrites, name).add(indexValue);
                const aRichValue = makeRichArrayItem(name, indexValue, richValue);

                console.log(`WRITE ARR ITEM ${name} ${indexValue} : value from=${JSON.stringify(richValue.from)}`)
                if (richValue.from !== undefined && richValue.from.index === undefined) {
                    // add "at" attribute to the variable that is assigned to this array element
                    console.log(`WRITE ARR ITEM ${name} ${indexValue} := ${richValue.from.name}`)
                    this.getV(richValue.from.name).at = {name: name, index: indexValue};
                }

                console.log(`WRITE ARR ITEM ${name} ${indexValue} = ${JSON.stringify(richValue)} -> ${JSON.stringify(aRichValue)}`);
                (this.getV(name).value)[indexValue] = aRichValue;
            }
        }, dataAccessLog);
    }

    function getCurrentFrame() {
        return frames[frames.length - 1];
    }

    function getOrEmptySet(map, key) {
        let set = map.get(key);
        if (set === undefined) {
            set = new Set();
            map.set(key, set);
        }
        return set;
    }


    return {
        getDataAccessLog: () => dataAccessLog,
        clearDataAccessLog: () => dataAccessLog.clear(),

        readVar: (name) => {
            return getCurrentFrame().readVar(name);
        },
        writeVar: (name, value, metadata) => {
            getCurrentFrame().writeVar(name, value, metadata);
        },

        readArrayElement: (name, indexValue) => {
            return getCurrentFrame().readArrayElement(name, indexValue);
        },
        writeArrayElement: (name, indexValue, value) => {
            getCurrentFrame().writeArrayElement(name, indexValue, value);
        },

        initFrames: () => frames.push(makeFrame(new Map())),
        newFrame: (variables) => frames.push(makeFrame(variables)),
        deleteFrame: () => {
            if (frames.length === 1) return false;
            frames.pop();
            return true;
        },
        currentFrame: () => getCurrentFrame(),

        newSubFrame: () => getCurrentFrame().newSubFrame(),
        deleteSubFrame: () => getCurrentFrame().deleteSubFrame(),

        pushContext: (context) => getCurrentFrame().contexts.push(context),
        popContext: () => getCurrentFrame().contexts.pop()
    }
}();
