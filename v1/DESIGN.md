Variables are represented as JavaScript objects with the following structure:

```json
{
  "value": 123,

  "self": {
    "name": "x",
    "index": 1
  },

  "from": {
    "name": "y",
    "index": 1
  },

  "at": {
    "name": "z"
  },

  "metadata": {
    "role": "index"
  },
  
  "rangeFrom": 10,
  "rangeTo": 20
}
```

* value: the value of the variable
* self, index: information about the variable name (and array index, if variable is array)
* from: information about the origin of the value, if any (e.g., variable name) 
* at: information about the last place, where the value has been copied to, if any (e.g., variable name)
* metadata: information about semantics of the variable
* rangeFrom, rangeTo, etc: additional value attributes.

The approach with "from" and "at" fields is not perfect: if variables are overwritten with different values,
these attributes become outdated, and one has to check the validity of "from - at" relation.
Ideally, all information must be up-to-date. 

The goal is to have the following structure:
```json
{
  "metadata": {
    "name":  "x",
    "role": "some_role"
  },
  "data": {
    "value": 1,
    "rangeFrom": 10,
    "rangeTo": 20
  },
  "copies": {
    "y": null,
    "a": [1, 3]
  }
}
```

* metadata: constant information about the variable
* data: information about the value, plus additional attributes
* copies: information about the locations, where this value has been copied to.

When the value is copied to another variable, only "data" should be cloned and placed to the variable,
and "copies" updated accordingly.
Metadata is not copied.
This way, additional attributes (value semantics) can travel together with the value easily to another locations,
and they will be used only if another variable has role that makes use of these variables.
