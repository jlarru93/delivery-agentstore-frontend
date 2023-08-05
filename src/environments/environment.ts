// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// import * as CONFIGURACION from '../assets/empresas/tres22/json/'

export const environment = {
  production: false,
  // url:{
  //   backEndInit : [
  //     'http://127.0.0.1:3000/dev',
  //     "https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev"
  //   ],
  //   backEnd: 'http://127.0.0.1:3000/dev',
  //   util_banckEnd:"https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev",
  //   //util_dev : "https://nkdqe8xd51.execute-api.us-east-1.amazonaws.com/dev"
   
  // },
  url:{
    backEndInit : [
      'https://yei6npe8j1.execute-api.us-east-1.amazonaws.com/dev',
      "https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev",
      'https://b0807puypc.execute-api.us-east-1.amazonaws.com/dev/delivery-man'

    ],
    backEnd: 'https://yei6npe8j1.execute-api.us-east-1.amazonaws.com/dev',
    url_back_delivery_man : 'https://b0807puypc.execute-api.us-east-1.amazonaws.com/dev/delivery-man',
    util_banckEnd:"https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev",
    //util_dev : "https://nkdqe8xd51.execute-api.us-east-1.amazonaws.com/dev"
   
  },
  region: 'us-east-1',
  userPoolId: 'us-east-1_431zyrUar',
  userPoolWebClientId: '7g2ofa36fep4l2nre1g9gh8bq',
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/dev',
  mqttServer:{
    url: "34.201.73.116",
    port: 15675,
    path:"/ws",
    user:undefined,
    pwd:undefined,
    useSSL:false
  },
  MARKERS: {
    ORIGEN: {
      URL: '/img/markers/Comercio.png',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(30, 30)
    },
    DESTINO: {
      URL: '/img/markers/Cliente.png',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(30, 30)
    },
    CONDUCTOR_LABEL: {
      URL: '/img/markers/Domiciliario_1.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
    },
    CONDUCTOR_ELITE: {
      URL: '/img/markers/autoElite.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
    },
    CONDUCTOR: {
      URL: '/img/markers/Domiciliario_1.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
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
  NAME_COMPANY: 'tres22',//'<<your name>>',
  // CONFIGURATION: CONFIGURACION,

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
