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

OpsWorksDeployer.prototype.getApp = function() {
  var api,
      request,
      response,
      app;

  if (!this._app) {
    api = this.getApi();
    request = api.describeApps({AppIds: [this.options.appId]});
    response = request.send();

    app = response.data.Apps[0];

    this._app = app;
  }

  return this._app;
};

OpsWorksDeployer.prototype.deploy = function(callback) {
  var api = this.getApi(),
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

  function done(err, data) {
    callback(err);
  }

  if (this.options.revision) {
    var app = this.getApp(),
        data = {'deploy': {}};

    data['deploy'][app['Shortname']] = {
      'scm': {
        'revision': this.options.revision
      }
    };

    args['CustomJson'] = JSON.stringify(data);
  }

  api.createDeployment(args, done);
};

Deployer.register('opsworks', OpsWorksDeployer);

exports = module.exports = OpsWorksDeployer;
