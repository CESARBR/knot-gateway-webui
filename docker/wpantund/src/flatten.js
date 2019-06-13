import _ from 'lodash';

function flatten(object, path, separator = ':') {
  return _.assign(
    {},
    ..._.keys(object).map((key) => {
      const subPath = path ? `${path}${separator}${key}` : key;
      return _.isPlainObject(object[key])
        ? flatten(object[key], subPath, separator)
        : { [`${subPath}`]: object[key] };
    }),
  );
}

export default flatten;
