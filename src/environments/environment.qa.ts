// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url:{
    backEndInit : [
      'https://kag6mai45b.execute-api.us-east-2.amazonaws.com/qa',
      "https://8x6pzhz4j8.execute-api.us-east-2.amazonaws.com/qa"
    ],
    backEnd: 'https://kag6mai45b.execute-api.us-east-2.amazonaws.com/qa',
    util_banckEnd:"https://8x6pzhz4j8.execute-api.us-east-2.amazonaws.com/qa",
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
    path:"/ws",
    user:"socket",
    pwd:"socket",
    useSSL:true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
