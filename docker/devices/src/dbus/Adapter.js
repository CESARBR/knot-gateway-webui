import { promisify } from 'util';

class Adapter {
  constructor(iface) {
    this.sendPresence = promisify(iface.SendPresence.bind(iface));
    this.turnOff = promisify(iface.TurnOff.bind(iface));
  }
}

export default Adapter;
