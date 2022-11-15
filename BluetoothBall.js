var myDevice, myService, myCharacteristic;

function connect() {
  let options = {
    filters: [{ namePrefix: "Game" }]
  };
  console.log("Requesting Bluetooth Device...");
  console.log("with " + JSON.stringify(options));
  navigator.bluetooth
    .requestDevice(options)
    .then(function (device) {
      myDevice = device;
      console.log("My Device-->", myDevice);
      return device.gatt.connect();
    })
    .then(function (server) {
      return server.getPrimaryService("d75ea010-ede4-4ab4-8f96-17699ebaf1b8");
    })
    .then(function (service) {
      console.log("My Service-->", service);
      myService = service;
      return service.getCharacteristics();
    })
    .then(async function (characteristics) {
      myCharacteristic = characteristics;
      for (const characteristic of myCharacteristic) {
        console.log("Selected characteristics", characteristic);
        if (characteristic.uuid) {
          if (characteristic.properties.write) {
            switch (characteristic.uuid) {
              case "8f20fa52-dab9-11e5-b5d2-0a1d41d68578":
                characteristic
                  .writeValue(Uint8Array.of(0x647))
                  .then((result) => {
                    console.log("Write value result--->", result);
                  })
                  .catch((error) => {
                    console.log("Write value error--->", error);
                  });
              case "8f20fa54-dab9-11e5-b5d2-0a1d41d68578":
                characteristic
                  .writeValue(Uint8Array.of(0xb97008))
                  .then((result) => {
                    console.log("Write value result--->", result);
                  })
                  .catch((error) => {
                    console.log("Write value error--->", error);
                  });
            }
          }
          if (characteristic.properties.notify) {
            characteristic
              .startNotifications()
              .then((characteristic) => {
                characteristic.addEventListener(
                  "characteristicvaluechanged",
                  handleCharacteristicValueChanged
                );
                console.log("Notifications have been started.");
              })
              .catch((error) => {
                console.log("Error in starting notifications.", error);
              });
          }
        }
      }
    })
    .catch(function (error) {
      console.error("Connection failed!", error);
      if (myDevice) {
        myDevice.gatt.disconnect();
      }
    });
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  console.log("Received " + value);
}

function disconnect() {
  if (myDevice) {
    myDevice.gatt.disconnect();
  }
}
