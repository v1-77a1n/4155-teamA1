const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "120559287708-d1rtk2bctan1t7jfke03sb8f52ei3u5f.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
}


verify().catch(console.error);