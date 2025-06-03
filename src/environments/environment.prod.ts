export const environment = {
  production: true,
  url:{
    backEndInit : [
      'https://api.piwi.pe/agent-store',
      'https://api.piwi.pe/tracking',
      "https://api.piwi.pe/utils",
      'https://api.piwi.pe/delivery-zone',
      'https://api.piwi.pe/delivery-store',
      'https://api.piwi.pe/delivery-order',
      'https://api.piwi.pe/user',
      'https://api.piwi.pe/delivery-invoice'
    ],
    backEndUser: 'https://api.piwi.pe/user',
    backendOrder: 'https://api.piwi.pe/delivery-order',
    backEnd: 'https://api.piwi.pe/agent-store',
    url_back_tracking : 'https://api.piwi.pe/tracking',
    fileWindows : "http://127.0.0.1:65535/",
    util_banckEnd:"https://api.piwi.pe/utils",
    backEnd_Zone: 'https://api.piwi.pe/delivery-zone',
    store_banckEnd:"https://api.piwi.pe/delivery-store",
    backEndInvoice:'https://api.piwi.pe/delivery-invoice',
  },
  microFront:{
    invoice:"https://micro-invoice.piwi.pe/#/",
    multipleAssignment:"https://micro-multi-assigment.piwi.pe/#/"
  },
  microFronted:'https://micro-report.piwi.pe/#/',
  region: 'us-east-1',
  userPoolWebClientId: '4kh9mhumd42cnoe4l3e3603j4k',
  awsConfig:{
    region: 'us-east-1',
    cognito:{
      userPoolId: 'us-east-1_IGz8a0uQ1',
      cookieStorage:{
        // - Cookie domain (only required if cookieStorage is provided)
        domain: '.piwi.pe',
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
    url: "wss.piwi.pe",
    port: 443,
    path:"/",
    user:"socket",
    pwd:"socket",
    useSSL:true
  },
  GOOGLE:{
    APIKEY: 'AIzaSyD6XfEXqDHjJMLbc-GFA9dzPzoF3dzzsJk'
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
  NAME_COMPANY: 'piwi',
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