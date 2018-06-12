'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    svgo: {
      files: [
        {
          sourceDirs: 'tests/dummy/app/assets/icons/mono',
          outputPath: 'assets/icons/mono',
          svgoConfig: {
            plugins: [{
              removeAttrs: {
                attrs: '(stroke|fill)'
              }
            }]
          }
        },
        {
          sourceDirs: 'tests/dummy/app/assets/icons/colored',
          outputPath: 'assets/icons/colored',
          svgoConfig: {}
        },
      ],
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
