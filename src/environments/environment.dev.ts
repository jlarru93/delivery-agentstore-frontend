// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url:{
    backEndInit : [
      'https://dev-api.tres22.net/agent-store',
      'https://dev-api.tres22.net/tracking',
      "https://dev-api.tres22.net/utils",
      'https://dev-api.tres22.net/delivery-zone',
      'https://dev-api.tres22.net/delivery-store',
      'https://dev-api.tres22.net/delivery-order',
      'https://dev-api.tres22.net/user',
      'https://dev-api.tres22.net/delivery-invoice'
    ],
    backEndUser: 'https://dev-api.tres22.net/user',
    backendOrder: 'https://dev-api.tres22.net/delivery-order',
    backEnd: 'https://dev-api.tres22.net/agent-store',
    url_back_tracking : 'https://dev-api.tres22.net/tracking',
    fileWindows : "http://127.0.0.1:65535/",
    util_banckEnd:"https://dev-api.tres22.net/utils",
    backEnd_Zone: 'https://dev-api.tres22.net/delivery-zone',
    store_banckEnd:"https://dev-api.tres22.net/delivery-store",
    backEndInvoice:'https://dev-api.tres22.net/delivery-invoice',
  },
  microFront:{
    invoice:"https://dev-micro-invoice.tres22.net/#/",
    multipleAssignment:"https://dev-micro-multi-assigment.tres22.net/#/"
  },
  microFronted:'https://dev-micro-report.tres22.net/#/',
  region: 'us-west-1',
  //userPoolId: 'us-west-1_4xM3rA9gH',
  userPoolWebClientId: '2ai45jc047fbj9gbo9apju2e6l',
  awsConfig:{
    region: 'us-west-1',
    cognito:{
      userPoolId: 'us-west-1_4xM3rA9gH',
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
  basePathS3ImagesDeliveryMan:'/dev',
  mqttServer:{
    url: "devwss.tres22.net",
    port: 443,
    path:"/",
    user:"socket",
    pwd:"socket",
    useSSL:true
  },
  GOOGLE:{
    APIKEY: 'AIzaSyDjv5HAoqzn8-kMHLFAdCF2XbHZ2vUmI8Y'
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
  NAME_COMPANY: 'tres22',//'<<your name>>',
  conuntryCode:'PE',
  countryDial: '+51',
  cityCenterPoint: {
    lat: -12.0621065,
    lng: -77.0365256
  },
  centermap:{
    lat: -12.1251109,
    lng: -76.9928316
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
