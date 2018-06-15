import { promisify } from 'util';

class Bus {
  constructor(bus) {
    this.bus = bus;
    this.getInterface = promisify(bus.getInterface.bind(bus));
  }

  close() {
    this.bus.disconnect();
  }
}

export default Bus;
