import { promisify } from 'util';

class Device {
  constructor(deviceInterface, testDeviceInterface) {
    this.pair = promisify(deviceInterface.Pair.bind(deviceInterface));
    this.forget = promisify(deviceInterface.Forget.bind(deviceInterface));
    this.connect = promisify(
      testDeviceInterface.Connect
        .bind(testDeviceInterface)
    );
    this.disconnect = promisify(
      testDeviceInterface.Disconnect
        .bind(testDeviceInterface)
    );
  }
}

export default Device;
