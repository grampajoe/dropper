var AWS = require('aws-sdk');

function OpsWorksDeployer(options) {
  this.options = options;
};

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
      this.emit('error', '--access-key-id is required');
    }
  }

  if (!cleaned.secretAccessKey) {
    if (process.env['AWS_SECRET_ACCESS_KEY']) {
      cleaned.secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
    } else {
      this.emit('error', '--secret-access-key is required');
    }
  }

  if (!cleaned.stackId) {
    this.emit('error', '--stack-id is required');
  }

  if (!cleaned.appId) {
    this.emit('error', '--app-id is required');
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

OpsWorksDeployer.prototype.waitForDeploy = function(id) {
  var api = this.getApi(),
      deployer = this;

  api.describeDeployments({
    'DeploymentIds': [id]
  }, function(err, data) {
    if (err) {
      deployer.emit('error', 'Error getting deployment: ' + err);
      return;
    }

    var deploymentStatus = data.Deployments[0].Status;

    switch (deploymentStatus) {
      case 'successful':
        deployer.emit('done');
        break;
      case 'running':
        deployer.waitForDeploy(id);
        break;
      case 'failed':
        deployer.emit('error', new Error('Deploy failed!'));
        break;
    }
  });
};

OpsWorksDeployer.prototype.deploy = function() {
  this.options = this.cleanOptions(this.options);

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
      deployer.emit('error', 'Error getting app: ' + err);
      return;
    }

    args['CustomJson'] = deployer.getJSON(app);

    api.createDeployment(args, function(err, data) {
      if (err) {
        deployer.emit('error', 'Error creating deployment: ' + err);
        return;
      }

      if (options.waitForDeploy) {
        deployer.waitForDeploy(data.DeploymentId);
      } else {
        deployer.done();
      }
    });
  });
};

exports = module.exports = OpsWorksDeployer;
