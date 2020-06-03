# API Reference

## Devices

### Create Device

    POST /api/devices

Creates a new virtual thing by filling the thingd daemon configuration file.

### Parameters
#### Header Parameters


Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
thingd | Y | The [thingd](https://github.com/CESARBR/knot-virtualthing/blob/master/confs/device.conf) configuration data that's sent by the user.

### Example
#### Request
```bash
POST http://localhost:8080/api/devices
```
##### Request Body
```json
{
    "thingd": {
        "name": "Thing Name",
        "modbusSlaveID": 1,
        "modbusSlaveURL": "tcp://localhost:1502",
        "dataItems": [
            {
                "schema": {
                    "sensorID": 123,
                    "sensorName": "KNOTSensor_0",
                    "typeID": "1",
                    "unit": "1",
                    "valueType": "1"
                },
                "modbus": {
                    "registerAddress": 200,
                    "bitOffset": 16
                },
                "config": {
                    "lowerThreshold": 1000,
                    "upperThreshold": 3000,
                    "timeSec": 5
                }
            },
            {
                "schema": {
                    "sensorID": 123,
                    "sensorName": "KNOTSensor_1",
                    "typeID": "1",
                    "unit": "1",
                    "valueType": "1"
                },
                "modbus": {
                    "registerAddress": 200,
                    "bitOffset": 16
                },
                "config": {
                    "change": true,
                    "timeSec": 5
                }
            }
        ]
    }
}
```

##### Response
```bash
200 OK
```

---