export const environment = {
  production: true,
  url:{
    backEndInit : [
      'https://fn8ekfdpca.execute-api.us-east-1.amazonaws.com/prod',
      "https://izcx12p6jh.execute-api.us-east-1.amazonaws.com/prod"
    ],
    backEnd: 'https://fn8ekfdpca.execute-api.us-east-1.amazonaws.com/prod',
    util_banckEnd:"https://izcx12p6jh.execute-api.us-east-1.amazonaws.com/prod"   
  },
  region: 'us-east-1',
  userPoolId: 'us-east-1_GNlrPkzvB',
  userPoolWebClientId: '4ml3aebd21313gkto8j0ra7clu',
  bucketNameS3Images:'',
  basePathS3ImagesDeliveryMan:'/prod',
  mqttServer:{
    url: "54.161.199.201",
    port: 15675
  }
};