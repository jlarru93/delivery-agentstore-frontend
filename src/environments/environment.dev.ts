// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url:{
    backEndInit : [
      'http://127.0.0.1:3000/dev',
      "https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev"
    ],
    backEnd: 'http://127.0.0.1:3000/dev',
    util_banckEnd:"https://3b9rh26s0j.execute-api.us-east-1.amazonaws.com/dev",
    //util_dev : "https://nkdqe8xd51.execute-api.us-east-1.amazonaws.com/dev"
   
  },
  region: 'us-east-1',
  userPoolId: 'us-east-1_b7xfBGxa3',
  userPoolWebClientId: '3n0ffgtikf79iuuop47l94hc0v',
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/dev',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
