// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url:{
    backEndInit : [
      'https://qa-api.tres22.net/agent-store',
      'https://qa-api.tres22.net/tracking',
      "https://qa-api.tres22.net/utils",
      'https://qa-api.tres22.net/delivery-zone',
      'https://qa-api.tres22.net/delivery-store'
    ],
    backEnd: 'https://qa-api.tres22.net/agent-store',
    url_back_tracking : 'https://qa-api.tres22.net/tracking',
    util_banckEnd:"https://qa-api.tres22.net/utils",
    fileWindows : "http://127.0.0.1:65535/",
    backEnd_Zone: 'https://qa-api.tres22.net/delivery-zone',
    store_banckEnd:"https://qa-api.tres22.net/delivery-store",
    //util_dev : "https://nkdqe8xd51.execute-api.us-east-1.amazonaws.com/dev"
   
  },
  region: 'us-east-2',
  userPoolId: 'us-east-2_bq5gZkIZ7',
  userPoolWebClientId: '2l4qjgigviuct4drm88ev16r3o',
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/dev',
  mqttServer:{
    url: "qawss.tres22.net",
    port: 443,
    path:"/",
    user:"socket",
    pwd:"socket",
    useSSL:true
  },
  GOOGLE:{
    APIKEY: 'AIzaSyCpLgMY1dm8Cg2z8nPnZeqkqPo0lz5RElo'
  },
  MARKERS: {
    ORIGEN: {
      URL: '/img/markers/Comercio.png',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(50, 50)
    },
    DESTINO: {
      URL: '/img/markers/Cliente.png',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(50, 50)
    },
    CONDUCTOR_LABEL: {
      URL: '/img/markers/Domiciliario_1.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(50, 50)
    },
    CONDUCTOR_ELITE: {
      URL: '/img/markers/autoElite.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
    },
    CONDUCTOR: {
      URL: '/img/markers/Domiciliario_1.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(50, 50)
    },
    PASAJERO:{
      URL: '/img/markers/marker_destino.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    CHECKPOINT:{
      URL: '/img/markers/pinNegro.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(25, 30)
    },
    PRECLOSE:{
      URL: '/img/markers/pinRojo.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    READING:{
      URL: '/img/markers/pinAmarillo.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    CONTACT:{
      URL: '/img/markers/pinVerde.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    START_DESTINATION:{
      URL: '/img/markers/pinCeleste.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    END_DESTINATION:{
      URL: '/img/markers/pinNaranja.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    },
    RIDE_END:{
      URL: '/img/markers/pinMorado.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(30, 35)
    }
  },
  NAME_COMPANY: 'tres22',
  conuntryCode:'CO',
  countryDial: '+57',
  cityCenterPoint: {
    lat: 11.0101922,
    lng: -74.8231794084391
  },
  centermap:{
    lat: 10.96854,
    lng: -74.78132
  },
  numberFormat: {
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 0
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
