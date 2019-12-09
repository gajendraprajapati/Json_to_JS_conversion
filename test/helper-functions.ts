const Helpers = {
  evalOperator: (v1, operator, v2) => {
    switch (operator) {
      case '==':
        return (v1 == v2);
      case '===':
        return (v1 === v2);
      case '!=':
        return (v1 != v2);
      case '!==':
        return (v1 !== v2);
      case '<':
        return (v1 < v2);
      case '<=':
        return (v1 <= v2);
      case '>':
        return (v1 > v2);
      case '>=':
        return (v1 >= v2);
      case '&&':
        return (v1 && v2);
      case '||':
        return (v1 || v2);
      default:
        null;
    }
  },

  getObjectPathValue: (path, contextObj) => {
    const pathSteps = path.split('.');
    let value = contextObj;
    for (let index = 0; index < pathSteps.length; index++) {
      if (!value[pathSteps[index]]) {
        return value[pathSteps[index]];
      }
      value = value[pathSteps[index]];
    }
    return value;
  }
};

module.exports = Helpers;
