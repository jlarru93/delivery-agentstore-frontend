// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  url:{
    backEndInit : [
      'https://dev-api.piwi.pe/agent-store',
      'https://dev-api.piwi.pe/tracking',
      "https://dev-api.piwi.pe/utils",
      'https://dev-api.piwi.pe/delivery-zone',
      'https://dev-api.piwi.pe/delivery-store',
      'https://dev-api.piwi.pe/delivery-order',
      'https://dev-api.piwi.pe/user',
      'https://dev-api.piwi.pe/delivery-invoice',
      'https://dev-api.piwi.pe/delivery-messaging'
    ],
    backEndUser: 'https://dev-api.piwi.pe/user',
    backendOrder: 'https://dev-api.piwi.pe/delivery-order',
    backEnd: 'https://dev-api.piwi.pe/agent-store',
    backEndMessague: 'https://dev-api.piwi.pe/delivery-messaging',
    url_back_tracking : 'https://dev-api.piwi.pe/tracking',
    fileWindows : "http://127.0.0.1:65535/",
    util_banckEnd:"https://dev-api.piwi.pe/utils",
    backEnd_Zone: 'https://dev-api.piwi.pe/delivery-zone',
    store_banckEnd:"https://dev-api.piwi.pe/delivery-store",
    backEndInvoice:'https://dev-api.piwi.pe/delivery-invoice',
  },
  microFront:{
    invoice:"https://dev-micro-invoice.piwi.pe/#/",
    product: "https://dev-micro-product.piwi.pe/#/",
    multipleAssignment:"https://dev-micro-multi-assigment.piwi.pe/#/",
    report:'https://dev-micro-report.piwi.pe/#/',
  },
  region: 'us-west-1',
  //userPoolId: 'us-west-1_4xM3rA9gH',
  userPoolWebClientId: '4hbd17p5udfca8i18rbmk5g0dp',
  awsConfig:{
    region: 'us-west-1',
    cognito:{
      userPoolId: 'us-west-1_fM8av0cDx',
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
  firebase: {
    apiKey: "AIzaSyBoQRzFRT1U45O40YmOwYbsVUihoL9FEOo",
    authDomain: "agent-store-piwi-dev.firebaseapp.com",
    projectId: "agent-store-piwi-dev",
    storageBucket: "agent-store-piwi-dev.firebasestorage.app",
    messagingSenderId: "521256989007",
    appId: "1:521256989007:web:d621b8eae234b36d0fd53a",
    measurementId: "G-71YJXN6Y19"
  },
  vapidKey:"BKq3BIMtSP9sfcFMS-hgZGvAqTpLXYnMmUptPPUnJd70CysqUOqHqYgwjvfSI4tN6BbCTgFVri2M1P9tDTUEFNA",
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/dev',
  mqttServer:{
    url: "devwss.piwi.pe",
    port_ws: 443,
    port_mqtt: 1883,
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
      ICON_SIZE: 50
    },
    DESTINO: {
      URL: '/img/markers/Cliente.png',
      POSICION: 20,
      ICON_SIZE: 50
    },
    CONDUCTOR_LABEL: {
      URL: '/img/markers/deliveryMan.png',
      POSICION: 1,
      ICON_SIZE: 50
    },
    CONDUCTOR: {
      URL: '/img/markers/deliveryMan.png',
      POSICION: 1,
      ICON_SIZE: 50
    },
    PASAJERO:{
      URL: '/img/markers/marker_destino.png',
      POSICION: 1,
      ICON_SIZE: 30
    },
    CHECKPOINT:{
      URL: '/img/markers/pinNegro.svg',
      POSICION: 1,
      ICON_SIZE: 25
    },
    PRECLOSE:{
      URL: '/img/markers/pinRojo.svg',
      POSICION: 1,
      ICON_SIZE: 30
    },
    READING:{
      URL: '/img/markers/pinAmarillo.svg',
      POSICION: 1,
      ICON_SIZE: 30
    },
    CONTACT:{
      URL: '/img/markers/pinVerde.svg',
      POSICION: 1,
      ICON_SIZE: 30
    },
    START_DESTINATION:{
      URL: '/img/markers/pinCeleste.svg',
      POSICION: 1,
      ICON_SIZE: 30
    },
    END_DESTINATION:{
      URL: '/img/markers/pinNaranja.svg',
      POSICION: 1,
      ICON_SIZE: 30
    },
    RIDE_END:{
      URL: '/img/markers/pinMorado.svg',
      POSICION: 1,
      ICON_SIZE: 30
    }
  },
  NAME_COMPANY: 'piwi',//'<<your name>>',
  conuntryCode:'PE',
  countryDial: '+51',
  cityCenterPoint: {
    lat: -8.387155,
    lng: -74.566047
  },
  centermap:{
    lat: -8.387155,
    lng: -74.566047
  },
  numberFormat: {
    decimalSeparator: '.',
    thousandsSeparator: "'",
    decimalPlaces: 2
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
