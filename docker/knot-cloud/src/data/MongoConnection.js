import _ from 'lodash';
import mongoose from 'mongoose';

class MongoConnection {
  constructor(host, port, databaseName) {
    this.host = host;
    this.port = port;
    this.databaseName = databaseName;
  }

  async start() {
    const uri = this.getDatabaseUri();
    this.connection = await mongoose.connect(uri);
  }

  async count(name, schema, query) {
    const Model = this.connection.model(name, schema);
    const mongooseQuery = this.mapToMongoose(query);
    return Model.count(mongooseQuery).exec();
  }

  async save(name, schema, data) {
    const Model = this.connection.model(name, schema);
    const mongooseData = this.mapToMongoose(data);
    const model = new Model(mongooseData);
    return model.save();
  }

  async deleteOne(name, schema, query) {
    const Model = this.connection.model(name, schema);
    const mongooseQuery = this.mapToMongoose(query);
    return Model.deleteOne(mongooseQuery).exec();
  }

  async findOne(name, schema, query) {
    const Model = this.connection.model(name, schema);
    const mongooseQuery = this.mapToMongoose(query);
    const mongooseObject = (await Model.findOne(mongooseQuery).exec()).toObject();
    return this.mapFromMongoose(mongooseObject);
  }

  async findOneAndUpdate(name, schema, query, changes) {
    const Model = this.connection.model(name, schema);
    const mongooseQuery = this.mapToMongoose(query);
    const mongooseChanges = this.mapToMongoose(changes);
    const mongooseObject = (await Model.findOneAndUpdate(
      mongooseQuery,
      mongooseChanges,
      { new: true },
    ).exec()).toObject();
    return this.mapFromMongoose(mongooseObject);
  }

  async find(name, schema, query) {
    const Model = this.connection.model(name, schema);
    const mongooseQuery = this.mapToMongoose(query);
    return (await Model.find(mongooseQuery).exec())
      .map(object => this.mapFromMongoose(object.toObject()));
  }

  mapToMongoose(object) {
    return _.mapKeys(object, (value, key) => key === 'schema' ? '_schema' : key);
  }

  mapFromMongoose(mongooseObject) {
    return _.mapKeys(mongooseObject, (value, key) => key === '_schema' ? 'schema' : key);
  }

  getDatabaseUri() {
    return `mongodb://${this.host}:${this.port}/${this.databaseName}`;
  }
}

export default MongoConnection;
