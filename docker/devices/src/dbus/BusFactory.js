import dbus from 'dbus';
import Bus from 'dbus/Bus';

class BusFactory {
  create() {
    const bus = dbus.getBus('system');
    return new Bus(bus);
  }
}

export default BusFactory;
