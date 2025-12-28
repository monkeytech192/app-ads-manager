/**
 * ==========================================
 * FACEBOOK SERVICE - AUTHENTICATION ONLY
 * ==========================================
 * 
 * File này CHỈ phục vụ cho ĐĂNG NHẬP / AUTHENTICATION:
 * - loginWithFacebook() - Đăng nhập user với Facebook
 * - getFacebookUserProfile() - Lấy thông tin profile (name, email, avatar)
 * - checkLoginStatus() - Kiểm tra trạng thái đăng nhập
 * 
 * LƯU Ý QUAN TRỌNG:
 * - Token từ Facebook Login SDK KHÔNG được dùng để truy xuất ads data
 * - Ads data (campaigns, metrics) sử dụng FACEBOOK_ACCESS_TOKEN từ .env (backend)
 * - Token từ đây chỉ dùng để verify user identity và lấy basic profile
 * 
 * ==========================================
 */

import { FacebookUserProfile } from "../types";

// Facebook App Configuration - Get from developers.facebook.com
const FACEBOOK_APP_ID = import.meta.env.VITE_FB_APP_ID || '';
// Facebook Login for Business Configuration ID - Create in App Dashboard > Facebook Login for Business > Configurations
const FACEBOOK_CONFIG_ID = import.meta.env.VITE_FB_CONFIG_ID || ''; // User Access Token config
const FACEBOOK_BUSINESS_CONFIG_ID = import.meta.env.VITE_FB_BUSINESS_CONFIG_ID || ''; // System User Access Token config 

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
                version    : 'v24.0' // Use latest API version (Dec 2024)
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

/**
 * Login with Facebook - Standard Login (for ALL users)
 * 
 * MỤC ĐÍCH: CHỈ để đăng nhập / authentication user
 * - Verify user identity
 * - Get basic profile (name, email, avatar)
 * - Token này KHÔNG dùng để truy xuất ads data
 * 
 * Works for both Business and Personal accounts
 * Automatically uses config_id if available, otherwise fallback to scope-based
 * 
 * LƯU Ý: Để truy xuất ads data, backend sử dụng FACEBOOK_ACCESS_TOKEN từ .env
 */
export const loginWithFacebook = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject("Facebook SDK not loaded");
            return;
        }

        // Build login options
        const loginOptions: any = {};
        
        if (FACEBOOK_CONFIG_ID) {
            // Facebook Login for Business with Configuration ID (nếu có Business)
            loginOptions.config_id = FACEBOOK_CONFIG_ID;
            // Do NOT use scope when using config_id (as per Facebook documentation)
        } else {
            // Standard Facebook Login với scope (cho tất cả users)
            // CHỈ yêu cầu permissions cho LOGIN - không cần ads permissions
            loginOptions.scope = 'public_profile,email';
        }

        window.FB.login((response: any) => {
            if (response.authResponse) {
                resolve(response.authResponse);
            } else {
                reject("User cancelled login or did not fully authorize.");
            }
        }, loginOptions);
    });
};

/**
 * Login with Standard Facebook Login (KHÔNG cần Business Account)
 * 
 * MỤC ĐÍCH: CHỈ để đăng nhập / authentication user
 * Dùng scope-based permissions - hoạt động cho mọi user
 * Token này KHÔNG dùng để truy xuất ads data
 */
export const loginWithFacebookPersonal = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject("Facebook SDK not loaded");
            return;
        }

        // Standard Login với scope - KHÔNG dùng config_id
        // CHỈ yêu cầu permissions cho LOGIN - không cần ads permissions
        window.FB.login((response: any) => {
            if (response.authResponse) {
                resolve(response.authResponse);
            } else {
                reject("User cancelled login or did not fully authorize.");
            }
        }, {
            scope: 'public_profile,email',
            auth_type: 'rerequest' // Force permission dialog nếu đã login trước
        });
    });
};

/**
 * Login with Facebook for Business - System User Access Token
 * For automated, long-term access to business assets
 */
export const loginWithFacebookBusiness = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject("Facebook SDK not loaded");
            return;
        }

        if (!FACEBOOK_BUSINESS_CONFIG_ID) {
            reject("Business configuration ID not configured");
            return;
        }

        // System User Access Token requires authorization code grant type
        window.FB.login(
            (response: any) => {
                if (response.authResponse && response.authResponse.code) {
                    // Return authorization code to exchange for access token on backend
                    resolve(response.authResponse.code);
                } else {
                    reject("User cancelled login or did not fully authorize.");
                }
            },
            {
                config_id: FACEBOOK_BUSINESS_CONFIG_ID,
                response_type: 'code',
                override_default_response_type: true
            }
        );
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
