class InMemoryNetworkAdapterStore {
  constructor(adapters) {
    this.adapters = adapters;
  }

  async get(id) {
    return this.adapters[id];
  }
}

export default InMemoryNetworkAdapterStore;
