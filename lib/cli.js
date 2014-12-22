require('colors');

// Runs the deploy command.
exports = module.exports = function(argv, deploy, callback) {
  var yargs = require('yargs'),
      args = yargs.parse(argv),
      deployer = args._[2];

  if (!deployer) {
    console.error('Deployer is required.'.red);
    process.exit(1);
  }

  callback = callback || function(err) {
    if (err) {
      console.error('Error: '.red + String(err));
      process.exit(1);
    }

    console.info('Deploy complete!'.green);
  };

  deploy(deployer, args, callback);

  return args;
}
