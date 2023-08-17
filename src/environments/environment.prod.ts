export const environment = {
  production: true,
  url:{
    backEndInit : [
      'https://api.tres22.net/agent-store',
      'https://api.tres22.net/tracking',
      "https://api.tres22.net/utils",
    ],
    backEnd: 'https://api.tres22.net/agent-store',
    url_back_tracking : 'https://api.tres22.net/tracking',
    util_banckEnd:"https://api.tres22.net/utils",
  },
  region: 'us-east-1',
  userPoolId: 'us-east-1_GNlrPkzvB',
  userPoolWebClientId: '4ml3aebd21313gkto8j0ra7clu',
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/prod',
  mqttServer:{
    url: "prodwss.tres22.net",
    port: 443,
    path:"/ws",
    user:"socket",
    pwd:"socket",
    useSSL:true
  },
  MARKERS: {
    ORIGEN: {
      URL: '/img/markers/origen.svg',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(30, 30)
    },
    DESTINO: {
      URL: '/img/markers/destino.svg',
      POSICION: 20,
      ICON_SIZE: new google.maps.Size(30, 30)
    },
    CONDUCTOR_LABEL: {
      URL: '/img/markers/autoGeneric.svg',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
    },
    CONDUCTOR_ELITE: {
      URL: '/img/markers/autoElite.png',
      POSICION: 1,
      ICON_SIZE: new google.maps.Size(20, 20)
    },
    CONDUCTOR: {
      URL: '/img/markers/autoGeneric.png',
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
  NAME_COMPANY: 'tres22',
  conuntryCode:'CO',
  centermap:{
    lat: 10.96854,
    lng: -74.78132
  }
};