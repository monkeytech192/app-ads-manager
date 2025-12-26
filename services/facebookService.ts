import { FacebookUserProfile } from "../types";

// Replace this with your actual Facebook App ID from developers.facebook.com
const FACEBOOK_APP_ID = '1354327065841163'; 

export const initFacebookSdk = (): Promise<void> => {
    return new Promise((resolve) => {
        if (window.FB) {
            resolve();
            return;
        }

        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : FACEBOOK_APP_ID,
                cookie     : true,
                xfbml      : true,
                version    : 'v19.0' // Use the latest API version
            });
            resolve();
        };

        // Load the SDK asynchronously
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s) as HTMLScriptElement; 
            js.id = id;
            js.src = "https://connect.facebook.net/vi_VN/sdk.js";
            fjs.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    });
};

export const loginWithFacebook = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject("Facebook SDK not loaded");
            return;
        }

        window.FB.login((response: any) => {
            if (response.authResponse) {
                resolve(response.authResponse);
            } else {
                reject("User cancelled login or did not fully authorize.");
            }
        }, { scope: 'public_profile,email' }); // Add 'ads_read,ads_management' here if your app is reviewed for it
    });
};

export const getFacebookUserProfile = (): Promise<FacebookUserProfile> => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject("Facebook SDK not loaded");
            return;
        }
        
        // Call Graph API /me
        window.FB.api('/me', { fields: 'name,email,picture.width(400).height(400)' }, (response: any) => {
            if (!response || response.error) {
                reject(response?.error || "Error fetching profile");
            } else {
                resolve(response as FacebookUserProfile);
            }
        });
    });
};

export const checkLoginStatus = (): Promise<any> => {
    return new Promise((resolve) => {
        if (!window.FB) return resolve(null);
        window.FB.getLoginStatus((response: any) => {
            resolve(response);
        });
    });
};
