// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url:{
    backEndInit : [
      'https://yei6npe8j1.execute-api.us-east-1.amazonaws.com/dev',
      "https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev"
    ],
    backEnd: 'https://yei6npe8j1.execute-api.us-east-1.amazonaws.com/dev',
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
    user:null,
    pwd:null,
    useSSL:false
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
