var config = require('config');
var fs = require('fs');

var ConnectorService = function ConnectorService() {
};

var CONNECTOR_CONFIG_FILE = config.get('connector.configFile');

var readConfigFile = function readConfigFile(done) { // eslint-disable-line vars-on-top
  var connectorConfig;
  if (fs.existsSync(CONNECTOR_CONFIG_FILE)) {
    try {
      connectorConfig = JSON.parse(fs.readFileSync(CONNECTOR_CONFIG_FILE, 'utf-8'));
    } catch (err) {
      done(err);
      return;
    }
  }

  done(null, connectorConfig);
};

var writeConfigFile = function writeConfigFile(newConfig, done) { // eslint-disable-line vars-on-top
  try {
    fs.writeFileSync(CONNECTOR_CONFIG_FILE, JSON.stringify(newConfig));
  } catch (err) {
    done(err);
    return;
  }

  done();
};


ConnectorService.prototype.setCloudConfig = function setCloudConfig(platform, cloudConfig, done) {
  readConfigFile(function onReadConfigFile(readConfigFileErr, connectorConfig) {
    if (readConfigFileErr) {
      done(readConfigFileErr);
      return;
    }

    connectorConfig.cloudType = platform;
    connectorConfig.cloud = cloudConfig;

    writeConfigFile(connectorConfig, done);
  });
};

ConnectorService.prototype.setFogToken = function setFogToken(token, done) {
  readConfigFile(function onReadConfigFile(readConfigFileErr, connectorConfig) {
    if (readConfigFileErr) {
      done(readConfigFileErr);
      return;
    }

    connectorConfig.fog.token = token; // eslint-disable-line no-param-reassign
    writeConfigFile(connectorConfig, done);
  });
};

ConnectorService.prototype.setCloudSecurityConfig = function setCloudSecurityConfig(cloudSecurityConfig, done) { // eslint-disable-line max-len
  readConfigFile(function onReadConfigFile(readConfigFileErr, connectorConfig) {
    if (readConfigFileErr) {
      done(readConfigFileErr);
      return;
    }

    connectorConfig.cloud.security = {
      hostname: cloudSecurityConfig.hostname,
      port: cloudSecurityConfig.port,
      clientId: cloudSecurityConfig.clientId,
      clientSecret: cloudSecurityConfig.clientSecret,
      callbackUrl: cloudSecurityConfig.callbackUrl,
      code: cloudSecurityConfig.code
    };

    writeConfigFile(connectorConfig, done);
  });
};

ConnectorService.prototype.getConfig = function getConfig(done) {
  readConfigFile(function onReadConfigFile(readConfigFileErr, connectorConfig) {
    if (readConfigFileErr) {
      done(readConfigFileErr);
      return;
    }
    done(null, connectorConfig);
  });
};

module.exports = {
  ConnectorService: ConnectorService
};
