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
  }
};