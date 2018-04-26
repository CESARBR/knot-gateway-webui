import mongoose from 'mongoose';

class MongoConnection {
  constructor(host, port, database) {
    this.host = host;
    this.port = port;
    this.database = database;
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
    return `mongodb://${this.host}:${this.port}/${this.database}`;
  }
}

export default MongoConnection;
