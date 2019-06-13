import _ from 'lodash';

import flatten from '../flatten';

function mapStatusToDBusStatus(status) {
  return flatten(status);
}

function mapPropertyNameFromDBusPropertyName(propertyName) {
  return _.replace(propertyName, ':', '.');
}

function mapPropertyToDBusProperty(property) {
  return _.concat([0], _.values(flatten(property)));   
}

class NetworkAdapterController {
  constructor(getStatusInteractor, getPropertyInteractor) {
    this.getStatusInteractor = getStatusInteractor;
    this.getPropertyInteractor = getPropertyInteractor;
  }

  async getStatus(adapterId) {
    const status = await this.getStatusInteractor.execute(adapterId);
    return mapStatusToDBusStatus(status);
  }

  async getProperty(adapterId, propertyName) {
    try {
      const property = await this.getPropertyInteractor.execute(
        adapterId,
        mapPropertyNameFromDBusPropertyName(propertyName),
      );
      return mapPropertyToDBusProperty(property);
    } catch (e) {
      return [16, 'Property Not Found'];
    }
  }
}

export default NetworkAdapterController;
