import _ from 'lodash';

const DEVICE_INTERFACE_NAME = 'br.org.cesar.knot.Device1';

const PROPERTY_NAME_MAP = {
  name: 'Name',
  uuid: 'Uuid',
  online: 'Online',
  paired: 'Paired',
  registered: 'Registered',
};

const PROPERTY_DEFAULT_VALUE_MAP = {
  Name: '',
  Uuid: '',
  Online: false,
  Paired: false,
  Registered: false,
};

class DeviceView {
  constructor(dbusObject, controller, id) {
    this.dbusObject = dbusObject;
    this.controller = controller;
    this.id = id;
  }

  async onCreate() {
    this.subscription = this.controller.propertiesChanged$.subscribe(async (event) => {
      if (event.id !== this.id) {
        return;
      }
      await this.onPropertiesChanged(event.changes);
    });
  }

  async onDestroy() {
    this.subscription.unsubscribe();
  }

  async onPropertiesChanged(domainChanges) {
    const changes = this.mapFromDomainProperties(domainChanges);
    this.dbusObject.emitPropertiesChanged(DEVICE_INTERFACE_NAME, changes);
  }

  mapFromDomainProperties(changes) {
    return _.chain(changes)
      .mapKeys((propertyValue, propertyName) => PROPERTY_NAME_MAP[propertyName])
      .mapValues((propertyValue, propertyName) =>
        propertyValue || PROPERTY_DEFAULT_VALUE_MAP[propertyName])
      .value();
  }
}

export default DeviceView;
