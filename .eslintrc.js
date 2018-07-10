module.exports = {
  "plugins": [
    "mocha",
  ],
  "globals": {
    "artifacts": true,
    "contract": true,
    "assert": true,
    "web3": true,
  },
  "extends": ["standard"],
  "rules": {
    "mocha/no-exclusive-tests": "error",
    "semi": [2, "always"],
    "quotes": [2, "double"],
    "comma-dangle": [1, "always-multiline"],
    "space-before-function-paren": [2, {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always",
    }],
  },
  "env": {
    "node": true,
    "mocha": true,
  }
};
