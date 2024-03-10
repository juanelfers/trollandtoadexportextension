import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';

const token = 'xxxx'; // optional. One will be fetched if not provided


const store = chromeWebstoreUpload({
    extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
    clientId: '289267997138-rrg69tcmbkqlrvtbqp9rlh6fdj8mdvch.apps.googleusercontent.com',
    clientSecret: 'xxxxxxxxxx',
    refreshToken: 'https://oauth2.googleapis.com/token',
});

const upload = async () => {
    const token = await store.fetchToken();

    // Upload to existing extension
    const myZipFile = fs.createReadStream('./mypackage.zip');

    store.uploadExisting(myZipFile, token).then(res => {
        // Response is a Resource Representation
        // https://developer.chrome.com/webstore/webstore_api/items#resource

        // Publish extension
        const target = 'default'; // optional. Can also be 'trustedTesters'
        store.publish(target, token).then(res => {
            // Response is documented here:
            // https://developer.chrome.com/webstore/webstore_api/items/publish
        });
    });

};

/*{ "installed": { "client_id": "289267997138-rrg69tcmbkqlrvtbqp9rlh6fdj8mdvch.apps.googleusercontent.com", 
"project_id": "juan-elfers",
"auth_uri": "https://accounts.google.com/o/oauth2/auth",
"token_uri": "https://oauth2.googleapis.com/token", 
"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs" } }*/

// > curl "https://accounts.google.com/o/oauth2/token" - d \
// "client_id=$CLIENT_ID&client_secret= &code=$CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"

upload();