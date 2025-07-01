import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-south-1_X2XwUHAAh',          
  ClientId: '1513rcn411tp1dvkmpsteghqhi',     
};

const UserPool = new CognitoUserPool(poolData);

export default UserPool;
