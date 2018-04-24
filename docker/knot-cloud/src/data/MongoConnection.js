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
    return Model.count(query).exec();
  }

  async save(name, schema, data) {
    const Model = this.connection.model(name, schema);
    const model = new Model(data);
    return model.save();
  }

  async deleteOne(name, schema, query) {
    const Model = this.connection.model(name, schema);
    return Model.deleteOne(query).exec();
  }

  async findOne(name, schema, query) {
    const Model = this.connection.model(name, schema);
    return Model.findOne(query).exec();
  }

  getDatabaseUri() {
    return `mongodb://${this.host}:${this.port}/${this.databaseName}`;
  }
}

export default MongoConnection;
