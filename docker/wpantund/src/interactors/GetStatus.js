import _ from 'lodash';

class GetStatus {
  constructor(networkAdapterStore) {
    this.networkAdapterStore = networkAdapterStore;
  }

  async execute(adapterId) {
    const adapter = await this.networkAdapterStore.get(adapterId);
    if (!adapter) {
      throw new Error('Interface not found');
    }
    return _.pick(adapter, [
      'NCP.State',
      'NCP.Version',
      'NCP.HardwareAddress',
      'NCP.Channel',
      'Daemon.Enabled',
      'Daemon.Version',
      'Config.NCP.DriverName',
      'Network.NodeType',
      'Network.Name',
      'Network.PANID',
      'Network.XPANID',
      'IPv6.LinkLocalAddress',
      'IPv6.MeshLocalAddress',
      'IPv6.MeshLocalPrefix',
      'com.nestlabs.internal',
    ]);
  }
}

export default GetStatus;
