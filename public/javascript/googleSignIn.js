function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    // Send the id_token to your server for verification
}