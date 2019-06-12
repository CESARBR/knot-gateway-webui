import _ from 'lodash';

class GetProperty {
  constructor(networkAdapterStore) {
    this.networkAdapterStore = networkAdapterStore;
  }

  async execute(adapterId, propertyName) {
    const adapter = await this.networkAdapterStore.get(adapterId);
    if (!adapter) {
      throw new Error('Adapter not found');
    }
    const property = _.pick(adapter, propertyName);
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  }
}

export default GetProperty;
