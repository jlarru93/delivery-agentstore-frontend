export const environment = {
  production: true,
  url:{
    backEndInit : [
      'https://api.tres22.net/agent-store',
      'https://api.tres22.net/tracking',
      "https://api.tres22.net/utils",
      'https://api.tres22.net/delivery-zone',
      'https://api.tres22.net/delivery-store'
    ],
    backEnd: 'https://api.tres22.net/agent-store',
    url_back_tracking : 'https://api.tres22.net/tracking',
    util_banckEnd:"https://api.tres22.net/utils",
    backEnd_Zone: 'https://api.tres22.net/delivery-zone',
    store_banckEnd:"https://api.tres22.net/delivery-store"
  },
  region: 'us-east-1',
  userPoolId: 'us-east-1_GNlrPkzvB',
  userPoolWebClientId: '4ml3aebd21313gkto8j0ra7clu',
  fileWindows : "http://localhost:65535",
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/prod',
  mqttServer:{
    url: "prodwss.tres22.net",
    port: 443,
    path:"/",
    user:"socket",
    pwd:"socket",
    useSSL:true
  },
  GOOGLE:{
    APIKEY: 'AIzaSyDAjQuobufEjiLVtkX7mnwbIZ1i1Iy9iXg'
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