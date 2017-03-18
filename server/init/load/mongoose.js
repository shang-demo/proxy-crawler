const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const filePathOneLayer = require('../utilities/file-path-one-layer');

const dbList = {};

function getDb(connection, connections) {
  if (dbList[connection]) {
    return dbList[connection];
  }

  if (!connections[connection]) {
    throw new Error(`no ${connection} found`);
  }

  let mongodbUri = getMongodbUri(connections[connection]);
  logger.debug('start connect mongodb: ', mongodbUri);

  dbList[connection] = mongoose.createConnection(mongodbUri);
  return dbList[connection];
}

function close(done = _.noop) {
  mongoose.connection.close(() => {
    logger.debug('Mongoose disconnected');
    done();
  });
}

function resolveEnvUrl(config) {
  if (config.condition && !process.env[config[config.condition]]) {
    return false;
  }

  let mongodbUri = 'mongodb://';
  if (process.env[config.username]) {
    mongodbUri += process.env[config.username];

    if (process.env[config.password]) {
      mongodbUri += `:${process.env[config.password]}`;
    }
    mongodbUri += '@';
  }

  mongodbUri += `${process.env[config.host] || '127.0.0.1'}:${process.env[config.port] || 27017}/${process.env[config.name] || config.dbName}`;

  return mongodbUri;
}

function getMongodbUri(config = {}) {
  let uri = '';
  switch (config.type) {
    case 'fun': {
      uri = config.fun();
      break;
    }
    case 'env': {
      uri = resolveEnvUrl(config);
      break;
    }
    case 'uri': {
      return config.uri;
    }
    default: {
      break;
    }
  }

  if (uri && uri !== false) {
    return uri;
  }

  return `mongodb://127.0.0.1:27017/${config.dbName}`;
}

function define(db, modelName, opt, config) {
  // eslint-disable-next-line no-param-reassign
  config = _.assign({
    timestamps: true,
    set: {
      toJSON: {
        transform(doc, ret) {
          // eslint-disable-next-line no-underscore-dangle
          ret.id = ret._id;
        },
      },
    },
  }, config);

  let schemaConfig = {
    timestamps: config.timestamps,
  };
  if (config.collection) {
    schemaConfig.collection = config.collection;
  }

  let modelNameSchema = new mongoose.Schema(opt, schemaConfig);

  // 索引
  if (config.indices) {
    modelNameSchema.index(...config.indices);
  }

  if (config.pre && _.isPlainObject(config.pre)) {
    _.forEach(config.pre, (value, key) => {
      modelNameSchema.pre(key, value);
    });
  }

  if (config.post && _.isPlainObject(config.post)) {
    _.forEach(config.post, (value, key) => {
      modelNameSchema.post(key, value);
    });
  }

  if (config.set && _.isPlainObject(config.set)) {
    _.forEach(config.set, (value, key) => {
      modelNameSchema.set(key, value);
    });
  }

  let modelNameModel = db.model(modelName, modelNameSchema);

  return {
    model: modelNameModel,
    schema: modelNameSchema,
  };
}

function exportTypes() {
  // expose mongoose schema types
  global.Mixed = mongoose.Schema.Types.Mixed;
  global.ObjectId = mongoose.Schema.Types.ObjectId;
  global.ObjectID = mongoose.mongo.ObjectID;
  global.Schema = mongoose.Schema;
}

function exposeGlobal(opt) {
  global[opt.modelName] = opt.model;
  global[opt.modelName].getSchema = function getSchema() {
    return opt.schema;
  };
  global[opt.modelName].getDb = function getDB() {
    return opt.db;
  };
}

function initModel(modelName, model, connections) {
  model.options = _.assign({
    connection: 'defaultMongo',
  }, model.options);


  let db = getDb(model.options.connection, connections);
  let result = define(db, modelName, model.attributes, model.options);

  return {
    db,
    modelName,
    model: result.model,
    schema: result.schema,
  };
}


function lift() {
  let modelsPath = path.join(this.projectPath, 'models');
  exportTypes();
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  return filePathOneLayer(modelsPath)
    .map((file) => {
      return initModel(file.name.replace(/\.js$/i, ''), require(file.path), this.config.connections);
    })
    .map((opt) => {
      this.model[opt.modelName] = opt;
      exposeGlobal(opt);
      return null;
    });
}

module.exports = {
  lift,
  lower: Promise.promisify(close),
};
