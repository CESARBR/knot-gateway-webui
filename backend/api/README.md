
# API Reference

## Devices

### List Devices

    GET /api/devices

List devices from knotd/fog.

### Parameters
#### Header Parameters


Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.


### Example

TODO

---

### Get specific device

    GET /api/devices/<id>

Get device data.

### Parameters
#### Header Parameters


Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.


### Example

TODO

---

### Pair Device

    POST /api/devices

Pair device.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

### Forget Device

    DELETE /api/devices/<id>

Forget device.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

## Gateway

### Get settings

    GET /api/gateways

Get gateway settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

### Update settings

    PUT /api/gateways

Update gateway settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
uuid | Y | gateway UUID.
token | Y | gateway token.

### Example

TODO

---

## Cloud

### Get settings

    GET /api/cloud

Get cloud settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

### Get security settings

    GET /api/cloud/security

Get cloud security settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

### List gateways

    GET /api/cloud/gateways

List cloud gateways.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

### Example

TODO

---

### Update settings

    PUT /api/cloud

Update cloud settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
platform | Y | Supported cloud platform (KNOT_CLOUD/FIWARE).
disableSecurity | Y | Disable the security configuration.
authenticator | Y (KNOT_CLOUD) | KNoT Cloud authenticator settings (protocol, path, hostname and port).
knotCloud | Y (KNOT_CLOUD) | KNoT Cloud settings (protocol, path, hostname and port).
iota | Y (FIWARE) | Fiware IoT Agent settings (hostname and port).
orion | Y (FIWARE) | Fiware Orion settings (hostname and port).

### Example

TODO

---

### Update security settings

    PUT /api/cloud/security

Update cloud security settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
platform | Y | Supported cloud platform (KNOT_CLOUD/FIWARE).
hostname | Y | Fiware IDM hostname.
port | Y | Fiware IDM port.
clientId | Y | Fiware IDM client ID.
clientSecret | Y | Fiware IDM client secret.
callbackUrl | Y | Fiware IDM callback to authorization page.
code | Y | Fiware IDM code returned from authorization process.

### Example

TODO

---

### Create gateway

    POST /api/cloud/gateway

Create gateway on cloud.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
name | Y | Gateway name.

### Example

TODO

---

### Activate gateway

    PUT /api/cloud/gateway/<id>/attrs/active

Update cloud security settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

### Example

TODO

---

## State

### Get current

    GET /api/state

Get current state.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

### Example

TODO

---

### Update state

    PUT /api/state

Update state.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | N | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
state | Y | state name.

### Example

TODO

---

## Network

### Get settings

    GET /api/network

Get network settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

### Update settings

    PUT /api/network

Update network settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

#### Body Parameters

Field | Required | Description
--- | --- | ---
hostname | Y | Hostname.

### Example

TODO

---

## User

### Get current information

    GET /api/me

Get current user informations.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO

---

## Auth

### Generate token

    POST /api/auth

Generate user's session token.

### Parameters
#### Body Parameters

Field | Required | Description
--- | --- | ---
email | Y | User's e-mail.
password | Y | User's password (plain text).

### Example

TODO

---

## Signup

### Create local user

    POST /api/signup

Create local user.

### Parameters
#### Body Parameters

Field | Required | Description
--- | --- | ---
email | Y | User's e-mail.
password | Y | User's password (plain text).

### Example

TODO

---

## Radio

### Get OpenThread settings

    GET /api/radio/openthread

Get OpenThread settings.

### Parameters
#### Header Parameters

Field | Required | Description
--- | --- | ---
Authorization | Y | Session token.

### Example

TODO
