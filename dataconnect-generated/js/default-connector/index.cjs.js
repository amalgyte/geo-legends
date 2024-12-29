const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'GeoLegendsClient',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

