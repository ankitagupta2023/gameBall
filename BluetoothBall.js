var myDevice,
  myServices,
  myService,
  myCharacteristics,
  myCharacteristic,
  myServer,
  timeStart;
let UUIDs = {
  DEVICE_SERVICE: "180A",
  DEVICE_MANUFACTURER: "2A29",
  DEVICE_MODEL: "2A24",
  DEVICE_MAC_ADDRESS: "2A25",
  DEVICE_HARDWARE: "2A27",
  DEVICE_FIRMWARE: "2A26",
  DEVICE_SOFTWARE: "2A28",
  OTA_SERVICE: "1D14D6EE-FD63-4FA1-BFA4-8F47B42119F0",
  OTA_CONTROL: "F7BF3564-FB6D-4E53-88A4-5E37E0326063",
  OTA_UPLOAD: "984227F3-34FC-4045-A5D0-2C581F81A153",
  OTA_STACK_VERSION: "4F4A2368-8CCA-451E-BFFF-CF0E2EE23E9F",
  OTA_BOOLOADER_VERSION: "4CC07BCF-0868-4B32-9DAD-BA4CC41E5316",
  ACCELEROMETER_1_SERVICE: "C75EA010-EDE4-4AB4-8F96-17699EBAF1B8",
  ACCELEROMETER_1_CONFIG: "1006BD26-DAAD-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_1_THRESHOLD: "1006BD28-DAAD-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_1_DATA: "1006BFD8-DAAD-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_1_ID: "BB64A6C3-3484-4479-ABD2-46DFF5BFC574",
  ACCELEROMETER_2_SERVICE: "D75EA010-EDE4-4AB4-8F96-17699EBAF1B8",
  ACCELEROMETER_2_CONFIG: "8F20FA52-DAB9-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_2_THRESHOLD: "8F20FA54-DAB9-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_2_DATA: "8F20FCAA-DAB9-11E5-B5D2-0A1D41D68578",
  ACCELEROMETER_2_ID: "A93D70C9-ED5D-4AF1-B0AD-518176309DFB",
  MAGNETOMETER_SERVICE: "ACEFAEA4-DB2B-4784-A980-C77CE1994D69",
  MAGNETOMETER_COMMAND: "31696178-3630-4892-ADF1-19A7437D052A",
  MAGNETOMETER_DATA: "042EB337-D510-4EE7-943A-BAEAA50B0D9E",
  MAGNETOMETER_RATE: "08588AAC-E32E-4395-AB71-6508D9D00329",
  MAGNETOMETER_ID: "EA1C2A4B-543C-4275-9CBE-890024D777EB",
  DEVICE_CONTROL_SERVICE: "00766963-6172-6173-6F6C-7574696F6E73",
  DEVICE_TEST: "8E894CBC-F3F8-4E6B-9A0B-7247598552AC",
  DEVICE_RESET: "01766963-6172-6173-6F6C-7574696F6E73",
  DEVICE_REFRESH_GATT: "0D42D5D8-6727-4547-9A82-2FA4D4F331BD",
  DEVICE_NAME: "7C019FF3-E008-4268-B6F7-8043ADBB8C22",
  DEVICE_COLOR: "822EC8E4-4D57-4E93-9FA7-D47AE7E941C0",
  SENSOR_STREAM_SERVICE: "A54D785D-D674-4CDA-B794-CA049D4E044B",
  SENSOR_STREAM_CONFIG: "A54D785D-D675-4CDA-B794-CA049D4E044B",
  SENSOR_STREAM_DATA: "A54D785D-D676-4CDA-B794-CA049D4E044B",
  CAPACITOR_SERVICE: "F4AD0000-D674-4CDA-B794-CA049D4E044B",
  CAPACITOR_VOLTAGE: "F4AD0001-D675-4CDA-B794-CA049D4E044B",
  CAPACITOR_CHARGING: "A59C6ADE-5427-4AFB-BFE4-74B21B7893A0",
  TESTING_SERVICE: "8E43BBF3-0AD2-49F9-8581-62D298327F6E",
  TESTED_LEVEL: "566A31EE-1A84-4447-872F-8A1C80E73C57",
  UNKNOWN: "Unknown-Service-Or-Characteristic-UUID",
};

UUIDs = Object.fromEntries(
  Object.entries(UUIDs).map(([key, value]) => [key, value.toLowerCase()])
);

async function requestBleDevice() {
  try {
    console.log('Requesting near by Bluetooth device...');
    myDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC" }]
      // optionalServices: [
      //   "a54d785d-d674-4cda-b794-ca049d4e044b",
      //   "c75ea010-ede4-4ab4-8f96-17699ebaf1b8",
      //   "d75ea010-ede4-4ab4-8f96-17699ebaf1b8",
      //   "e75ea010-ede4-4ab4-8f96-17699ebaf1b8",
      //   "acefaea4-db2b-4784-a980-c77ce1994d69",
      //   "00766963-6172-6173-6f6c-7574696f6e73",
      //   "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0",
      // ],
    });
    console.log('> Requested ' + myDevice.name);
  }
  catch(error) {
    console.log('Argh! ' + error);
  }
}

async function connectBleDevice() {
  try {
    console.log("Getting existing permitted Bluetooth devices...");
    let devices = await navigator.bluetooth.getDevices();
    if (!devices.length) {
      await requestBleDevice();
    }
    devices = await navigator.bluetooth.getDevices();
    console.log("> Got " + devices.length + " Bluetooth devices.");
    // These devices may not be powered on or in range, so scan for
    // advertisement packets from them before connecting.
    for (const device of devices) {
      myDevice = device;
      device.addEventListener(
        "advertisementreceived",
        async (event) => {
          console.log('> Received advertisement from "' + device.name + '"...');
          // Stop watching advertisements to conserve battery life.
          // abortController.abort();
          console.log(
            'Connecting to GATT Server from "' + device.name + '"...'
          );
          try {
            device.addEventListener("gattserverdisconnected", onDisconnected);
            await device.gatt.connect();
            // After successful connection call Game ball services
            // server = await device.gatt.connect();
            // await getServices(server)
            console.log('> Bluetooth device "' + device.name + " connected.");
          } catch (error) {
            console.log("Argh! " + error);
          }
        },
        { once: true }
      );

      // try {
      //   console.log('Watching advertisements from "' + device.name + '"...');
      //   await device.watchAdvertisements({ signal: abortController.signal });
      // }
      // catch(error) {
      //   console.log('Argh! ' + error);
      // }
    }
  } catch (error) {
    console.log("Argh! " + error);
  }
}

async function getServices(server) {
  myServer = server;
  myServices = await server.getPrimaryServices();
  console.log("List of all Services available for this device--->", myServices);
  myServices = await Promise.all(
    myServices.map(async (service) => {
      let characteristic = await service.getCharacteristics();
      console.log(
        "Service--->",
        service,
        "characteristic---->",
        characteristic
      );
      return { [service.uuid]: characteristic };
    })
  );
  console.log("services----->", myServices);
  // Sensor stream
  //     Service used to subscribe to a single (1st) accelerometer. If you want to
  // subscribe to both, use the sensor stream service (more effecient). But you
  // still need to set the sample rate and threshold for each accel here and then
  // listen for sensor data on the stream services.

  aService = await myServer.getPrimaryService(UUIDs.ACCELEROMETER_1_SERVICE);
  AccelConfig = await aService.getCharacteristic(UUIDs.ACCELEROMETER_1_CONFIG);
  await settings.writeValue(Uint8Array.of(0x197));
  threshold = await aService.getCharacteristic(UUIDs.ACCELEROMETER_1_THRESHOLD);
  await threshold.writeValue(Uint16Array.of(135));
  a1DataChar = await aService.getCharacteristic(UUIDs.ACCELEROMETER_1_DATA);
  checkNotification(a1DataChar);
  myCharacteristic = myServices
    .filter((service) => service[UUIDs.SENSOR_STREAM_SERVICE])[0]
    [UUIDs.SENSOR_STREAM_SERVICE].filter(
      (characteristics) => characteristics.properties.notify == true
    );
  timeStart = Date.now();
  streamChar = await myServices
    .filter((service) => service[UUIDs.SENSOR_STREAM_SERVICE])[0]
    .getCharacteristic(UUIDs.SENSOR_STREAM_CONFIG);
  await streamChar.writeValue(Uint16Array.of(2));
  checkNotification(myCharacteristic[0]);
}


function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  const timeEnd = Date.now();
  console.log(
    "events disconnected in second --->",
    (timeEnd - timeStart) / 1000
  );
  console.log('>>>> Bluetooth Device disconnected');
}

async function checkNotification(ch) {
  await ch.startNotifications();
  await ch.addEventListener(
    "characteristicvaluechanged",
    handleCharacteristicValueChanged
  );
  console.log(ch);
}

function handleCharacteristicValueChanged(event) {
  const timeEnd = Date.now();
  console.log(
    "events have been started in second --->",
    (timeEnd - timeStart) / 1000
  );
  const value = event.target.value;
  console.log("Received " + value);
}

function disconnect() {
  if (myDevice) {
    myDevice.gatt.disconnect();
    console.log("Disconnected ",myDevice.name);
  }
}

async function forgetBleDevice() {
  const devices = await navigator.bluetooth.getDevices();
  for (const device of devices) {
    console.log('Forgetting ' + device.name + 'Bluetooth device...');
    device.forget().then(() => {
    console.log('  > Bluetooth device has been forgotten.');
    })
  }
  
}
