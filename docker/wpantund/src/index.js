import _ from 'lodash';

import InMemoryNetworkAdapterStore from 'data/InMemoryNetworkAdapterStore';

import GetStatus from 'interactors/GetStatus';

import DBusServerFactory from 'dbus/DBusServerFactory';
import NetworkAdapterController from 'dbus/NetworkAdapterController';

async function main() {
  const adapters = {
    wpan0: {
      NCP: {
        State: 'associated',
        Version: 'OPENTHREAD/20170716-01293-gf9d757a-dirty; NRF52840; Mar 26 2019 10:32:14',
        HardwareAddress: [0xc9, 0xa9, 0x37, 0xb8, 0x49, 0x94, 0x51, 0x11],
        Channel: 13,
      },
      Daemon: {
        Enabled: true,
        Version: '0.08.00d (; May 14 2019 19:14:53)',
      },
      Config: {
        NCP: {
          DriverName: 'spinel',
        },
      },
      Network: {
        NodeType: 'leader',
        Name: 'knot',
        PANID: 4369,
        XPANID: 1229782938533634594,
        Key: [
          0x00, 0x11, 0x22, 0x33,
          0x44, 0x55, 0x66, 0x77,
          0x88, 0x99, 0xaa, 0xbb,
          0xcc, 0xdd, 0xee, 0xff,
        ],
      },
      IPv6: {
        LinkLocalAddress: 'fe80::e42b:4953:dc79:89a8',
        MeshLocalAddress: 'fd11:1111:1122:0:a846:3da2:6a3b:2aef',
        MeshLocalPrefix: 'fd11:1111:1122::/64',
      },
      'com.nestlabs.internal': {
        Network: {
          AllowingJoin: false,
        },
      },
    },
  };
  const adapterIds = _.keys(adapters);

  const networkAdapterStore = new InMemoryNetworkAdapterStore(adapters);
  const getStatusInteractor = new GetStatus(networkAdapterStore);
  const networkAdapterController = new NetworkAdapterController(getStatusInteractor);
  new DBusServerFactory().create(networkAdapterController, adapterIds);
}
main();
