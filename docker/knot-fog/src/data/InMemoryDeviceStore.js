class InMemoryDeviceStore {
  constructor() {
    this.devices = [];
  }

  save(device) {
    if (this.devices.find(d => d.id === device.id)) {
      this.remove(device.id);
    }

    this.devices.push(device);
  }

  remove(id) {
    const device = this.devices.find(device => device.id === id);
    const index = this.devices.indexOf(device);
    if (index > -1) {
      this.devices.splice(index, 1);
    }
  }

  list() {
    return this.devices;
  }
}

export default InMemoryDeviceStore;