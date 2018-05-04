# knot-cloud

Startup scripts and configuration files and a minimal service to mock the actual
knot-cloud and knot-fog services.

In this implementation some differences may exist in the format of the data
returned by the service in situations that make no difference to the WebUI,
e.g. the device object doesn't have all the attributes the actual cloud uses. In
case some feature requires some data that isn't being properly returned, a fix
must be made in this code.