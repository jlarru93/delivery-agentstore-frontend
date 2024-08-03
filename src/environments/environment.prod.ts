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
    fileWindows : "http://127.0.0.1:65535/",
    util_banckEnd:"https://api.tres22.net/utils",
    backEnd_Zone: 'https://api.tres22.net/delivery-zone',
    store_banckEnd:"https://api.tres22.net/delivery-store"
  },
  microFronted:'https://dev-micro-report.tres22.net/#/',
  region: 'us-east-1',
  //userPoolId: 'us-east-1_GNlrPkzvB',
  userPoolWebClientId: '4ml3aebd21313gkto8j0ra7clu',
  awsConfig:{
    region: 'us-east-1',
    cognito:{
      userPoolId: 'us-east-1_GNlrPkzvB',
      cookieStorage:{
        // - Cookie domain (only required if cookieStorage is provided)
        domain: '.tres22.net',
        // (optional) - Cookie path
        path: '/',
        // (optional) - Cookie expiration in days
        expires: 365,
        // (optional) - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        sameSite: 'strict',
        // (optional) - Cookie secure flag
        // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
        secure: true
      }
    }
  },
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
  STATUS_COMPLAINT_OPEN : 'open',
  STATUS_COMPLAINT_IN_PROCESS : 'inProcess',
  STATUS_COMPLAINT_DONE : 'done',
  STATUS_COMPLAINT_REJECT : 'reject',
  STATUS_COMPLAINT_RE_OPEN : 'reOpen',
  STATUS_COMPLAINT_RE_PROCESS : 'reProcess',
  STATUS_COMPLAINT_RE_REJECT : 'reReject',
// TYPE
  STATUS_TYPE_ORDER : 'ORDER',
  STATUS_TYPE_DELIVERYMAN : 'DELIVERYMAN',
  STATUS_WORK_DM_DISABLED : 'disabled',
  STATUS_WORK_DM_WAIT : 'waiting',
  STATUS_WORK_DM_IN_ORDER : 'inOrder',
  STATUS_WORK_DM_MINUTES_TO_BE_ACTIVE : 10,
  TYPE_ORDER_SENDANDRECIVE : "SendAndReciveStore",
//typeOrder
  TYPE_ORDER_SEND_AND_RECIVE_ORDER : 'SendAndReciveStore',
  TYPE_ORDER_TRADITIONAL : 'traditional',
  TYPE_ORDER_SEND_AND_RECIVE_USER : 'SendAndReciveUser',
  STATUSORDER_CANCEL : 'cancel',
  STATUSORDER_OPEN : 'open',
  STATUSORDER_DONE : 'done',
  STATUSORDER_PENDING_PAYMENT : 'pendingPayment',
  STATUSORDER_REJECT_PAYMENT : 'rejectPayment'
};