'use strict';

const merge = require('merge');
const makeArray = require('make-array');

const BroccoliSvgOptimizer = require('broccoli-svgo');
const broccoliSource = require('broccoli-source');
const UnwatchedDir = broccoliSource.UnwatchedDir;
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-svgo',

  options: function() {
    return this._options = this._options || merge(true, {}, {
      files: []
    }, this.app.options.svgo || {});
  },

  treeForPublic: function() {
    const options = this.options();
    const trees = this._makeSvgTrees(options.files);
    return this._maybeMerge(trees, 'output');
  },

  // Remove sprite files from the dist if they originate in the `/public` dir
  postprocessTree: function(type, tree) {
    // if (type !== 'all') {
      return tree;
    // }

    const options = this.options();
    const globalExclude = options.excludeSourceFiles;
    const excludeGlobs = makeArray(this.options().files).reduce(function(result, fileSpec) {
      let paths = [];

      // Remove only if the `excludeSourceFiles` option is set
      if (globalExclude || fileSpec.excludeSourceFiles) {
        paths = makeArray(fileSpec.sourceDirs).filter(function(dir) {
          return dir.match(/^public\//);
        }).map(function(dir) {
          return dir.replace(/^public\//, '') + '/*';
        });
      }

      return result.concat(paths);
    }, []);

    if (excludeGlobs.length) {
      tree = new Funnel(tree, {
        exclude: excludeGlobs
      });
    }
    return tree;
  },

  _makeSvgTrees: function(files) {
    return makeArray(files).map(function(fileSpec) {
      return new Funnel(new BroccoliSvgOptimizer(this._makeSourceTree(fileSpec), fileSpec), {
        destDir: fileSpec.outputPath
      });
    }, this);
  },

  _makeSourceTree: function(fileSpec) {
    const inputs = makeArray(fileSpec.sourceDirs).map((directoryPath) => {
      return new UnwatchedDir(directoryPath);
    });
    return this._maybeMerge(inputs, 'sources: ' + fileSpec.outputFile);
  },

  _maybeMerge: function(trees, description) {
    trees = makeArray(trees);
    if (trees.length === 1) {
      return trees[0];
    } else {
      return new MergeTrees(trees, {
        description: 'TreeMerger (SVGO ' + description + ')'
      });
    }
  }
};
