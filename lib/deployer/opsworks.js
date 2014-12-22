var Deployer = require('../deployer'),
    AWS = require('aws-sdk');

function OpsWorksDeployer(options) {
  this.options = this.cleanOptions(options);
};

OpsWorksDeployer.prototype.__proto__ = Deployer.prototype;

OpsWorksDeployer.prototype.cleanOptions = function(options) {
  var cleaned = {};

  for (option in options) {
    if (options.hasOwnProperty(option)) {
      cleaned[option] = options[option];
    }
  }

  if(!cleaned.accessKeyId) {
    if (process.env['AWS_ACCESS_KEY_ID']) {
      cleaned.accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
    } else {
      throw new Error('--access-key-id is required');
    }
  }

  if (!cleaned.secretAccessKey) {
    if (process.env['AWS_SECRET_ACCESS_KEY']) {
      cleaned.secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
    } else {
      throw new Error('--secret-access-key is required');
    }
  }

  if (!cleaned.stackId) {
    throw new Error('--stack-id is required');
  }

  if (!cleaned.appId) {
    throw new Error('--app-id is required');
  }

  if (!cleaned.region) {
    if (process.env['AWS_DEFAULT_REGION']) {
      cleaned.region = process.env['AWS_DEFAULT_REGION'];
    } else {
      cleaned.region = 'us-east-1';
    }
  }

  if (!cleaned.comment) {
    cleaned.comment = '';
  }

  cleaned.migrate = String(!!cleaned.migrate);

  return cleaned;
};

OpsWorksDeployer.prototype.getApi = function() {
  return new AWS.OpsWorks({
    'accessKeyId': this.options.accessKeyId,
    'secretAccessKey': this.options.secretAccessKey,
    'region': this.options.region
  });
};

OpsWorksDeployer.prototype.getApp = function(callback) {
  var api,
      deployer = this;

  if (!deployer._app) {
    api = deployer.getApi();
    api.describeApps({AppIds: [deployer.options.appId]}, function(err, data) {
      if (err) {
        return callback(err);
      } else {
        deployer._app = data.Apps[0];
        return callback(null, deployer._app);
      }
    });
  } else {
    return callback(null, deployer._app);
  }
};

OpsWorksDeployer.prototype.getJSON = function(app) {
  var data = {};

  if (this.options.revision) {
    data['deploy'] = {};
    data['deploy'][app.Shortname] = {
      'scm': {
        'revision': this.options.revision
      }
    };
  }

  return JSON.stringify(data);
};

OpsWorksDeployer.prototype.done = function(err) {
  this.emit('done', err);
};

OpsWorksDeployer.prototype.deploy = function() {
  var api = this.getApi(),
      deployer = this,
      options = this.options,
      args = {
        Command: {
          Name: 'deploy',
          Args: {
            'migrate': [this.options.migrate]
          },
        },
        StackId: this.options.stackId,
        AppId: this.options.appId,
        Comment: this.options.comment
      };

  this.getApp(function(err, app) {
    if (err) {
      return callback(err);
    }

    args['CustomJson'] = deployer.getJSON(app);

    api.createDeployment(args, function() {
      deployer.done();
    });
  });
};

Deployer.register('opsworks', OpsWorksDeployer);

exports = module.exports = OpsWorksDeployer;
