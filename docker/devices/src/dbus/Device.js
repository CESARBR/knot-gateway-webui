import { promisify } from 'util';

class Device {
  constructor(deviceInterface) {
    this.pair = promisify(deviceInterface.Pair.bind(deviceInterface));
    this.forget = promisify(deviceInterface.Forget.bind(deviceInterface));
  }
}

export default Device;
