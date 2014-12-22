# dropper

Deploy things!

[![Wercker](http://img.shields.io/wercker/ci/548e2bbd6b3ba8733d73de03.svg?style=flat)](https://app.wercker.com/project/bykey/352085a3388f20219a49083723194d0d)
[![npm](http://img.shields.io/npm/v/dropper.svg?style=flat)](https://www.npmjs.com/package/dropper)

## Installing

```bash
$ npm install -g dropper
```

## Platforms

Dropper is built to be extensible. The first platform supported is OpsWorks,
but maybe there are more to come!

### Opsworks

Deploy an OpsWorks app:

```bash
$ dropper opsworks --stack-id STRING --app-id STRING
```

#### Options

- `--access-key-id STRING` (required) AWS access key. Can be provided by the
  `AWS_ACCESS_KEY_ID` environment variable.
- `--secret-access-key STRING` (required) AWS secret key. Can be provided by
the `AWS_SECRET_ACCESS_KEY` environment variable.
- `--stack-id STRING` (required) OpsWorks stack ID.
- `--app-id STRING` (required) OpsWorks app ID.
- `--region STRING` (required) AWS region. Default is `us-east-1`. Can be
provided by the `AWS_DEFAULT_REGION` environment variable.
- `--revision STRING` (optional) A revision, e.g. a git ref or subversion
  revision number, to deploy.
- `--migrate` (optional) Enable migrations.
- `--comment STRING` (optional) Comment for the deployment.
- `--wait-for-deploy` (optional) Waits for deployments to complete before
  exiting, and reports the result.

#### Permissions

It's recommended to create an [IAM](http://aws.amazon.com/iam/) user with
just enough permissions to perform the actions required to deploy an app.
following permissions should be enough:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "opsworks:CreateDeployment",
        "opsworks:DescribeApps"
      ],
      "Resource": [
        "arn:aws:opsworks:*:*:stack/your-opsworks-stack-id-here/"
      ]
    }
  ]
}
```

## Extending

Platform support is implemented through a `Deployer`. Each deployer lives in
its own module inside [`lib/deployer/`](lib/deployer).

Here's a working example:

```javascript
// In lib/deployer/cloudinator.js
function CloudinatorDeployer(options) {
    this.options = options;
}

CloudinatorDeployer.prototype.cloudinate = function() {
    // The cloud is very unpredictable
    return Math.random() > 0.4;
}

CloudinatorDeployer.prototype.deploy = function() {
    console.log('Cloudinating...');

    if (this.cloudinate()) {
        this.emit('done');
    } else {
        this.emit('error', 'Cloudination failed!');
    }
}

exports = module.exports = CloudinatorDeployer;

// In lib/deployer.js
Deployer.register('cloudinator', require('./deployer/cloudinator'));
```

### Registering

Deployers need to be registered on the main `Deployer` class:

```javascript
// In lib/deployer/cloudinator.js
function CloudinatorDeployer(options) {}

exports = module.exports = CloudinatorDeployer;

// In lib/deployer.js, all the way at the bottom
Deployer.register('cloudinator', require('./deployer/cloudinator'));
```

After registering, you can call `dropper cloudinator` to use your deployer.

### Events

Deployers are event emitters, and dropper handles a few special events:

- `done` events signal that a deploy has successfully completed. Every
  deployer must emit this event when it's done.
- `error` events signal a fatal error and cause dropper to exit immediately
  with a failed status.

```javascript
CloudinatorDeployer.prototype.deploy = function() {
    if (this.cloudinate()) {
        this.emit('done');
    } else {
        this.emit('error', 'Cloudination failed!');
    }
}
```

### Command Line Arguments

Deployers are instantiated with an object containing command line arguments.
Option names are converted from `--lower-case-with-dashes` to `camelCase`.

```javascript
function CloudinatorDeployer(options) {
    // --fail-loudly
    if (options.failLoudly) {
        this.emit('error', 'BOOM');
    }

    // --deploy-target production
    if (options.deployTarget == 'production') {
        console.warn('omg r u sure');
    }

    // Save the options for later
    this.options = options;
}
```

### Deploying

Each deployer must implement the `deploy` method, which is called without
arguments. The `deploy` method is the entry point to the deployer, and should
emit either a `done` or an `error` event.

```javascript
CloudinatorDeployer.prototype.deploy = function() {
    // Deploy things!
    this.emit('done');
}
```

## Tests

To run the tests:

```bash
$ npm install
$ npm test
```

## Contributing

1. Fork the [GitHub repo](https://github.com/grampajoe/dropper).
2. Check out a feature branch, e.g. `cool-new-thing`.
3. Write tests! Pull requests won't be accepted without reasonable test
   coverage.
4. Write code!
5. Open a pull request on GitHub.

## License

MIT. See [LICENSE](LICENSE).
