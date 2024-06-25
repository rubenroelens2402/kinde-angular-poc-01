/**
 * This file contains authentication parameters. Contents of this file
 * is roughly the same across other MSAL.js libraries. These parameters
 * are used to initialize Angular and MSAL Angular configurations in
 * in app.module.ts file.
 */

import {
  withEnabledBlockingInitialNavigation,
  withDisabledInitialNavigation,
} from '@angular/router';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import {
  LogLevel,
  Configuration,
  BrowserCacheLocation,
  BrowserUtils,
  IPublicClientApplication,
  InteractionType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { environment } from 'src/environments/environment';

const isIE =
  window.navigator.userAgent.indexOf('MSIE ') > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1;

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

/**
 * MSAL Angular will automatically retrieve tokens for resources
 * added to protectedResourceMap. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/initialization.md#get-tokens-for-web-api-calls
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string> | null>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/', [
    'user.read',
    'organization.read.all',
  ]);
  protectedResourceMap.set(
    // Required for tenant listing
    'https://management.azure.com/tenants?api-version=2020-01-01',
    ['https://management.azure.com/user_impersonation']
  );
  // protectedResourceMap.set(
  //     protectedResources.productOffersApiEndpoint.endpoint,
  //     protectedResources.productOffersApiEndpoint.scopes
  // );
  // protectedResourceMap.set(
  //     protectedResources.blueOceanApiLocal.endpoint,
  //     protectedResources.blueOceanApiLocal.scopes
  // );
  protectedResourceMap.set(
    protectedResources.blueOceanApi.endpoint,
    protectedResources.blueOceanApi.scopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
    authRequest: (msalService, httpReq, originalAuthRequest) => {
      if (httpReq.url.includes('/login')) {
        return {
          ...originalAuthRequest,
        }; // Bypass token acquisition for login page
      }
      return {
        ...originalAuthRequest,
        authority: `https://login.microsoftonline.com/${originalAuthRequest.account?.tenantId ?? 'organizations'
          }`,
      };
    },
  };
}

/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest,
  };
}

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: environment.clientId, // This is the ONLY mandatory field that you need to supply.
    authority: 'https://login.microsoftonline.com/organizations', // Defaults to "https://login.microsoftonline.com/common"
    redirectUri: '/products', // Points to window.location.origin. You must register this URI on Azure portal/App Registration.
    postLogoutRedirectUri: '/discover',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel: LogLevel, message: string) {
        console.log(message);
      },
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
    allowNativeBroker: false, //
  },
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
  blueOceanApi: {
    endpoint: environment.authenticationEndpoint,
    scopes: [environment.authenticationEndpointScope],
  },
  // productOffersApiEndpoint: {
  //   endpoint: `${environment.productApiURI}`,
  //   scopes: null
  // },
  // blueOceanApiLocal: {
  //   endpoint: 'https://localhost:8000/api/*',
  //   scopes: [environment.authenticationEndpointScope],
  // },
  // blueOceanApi: {
  //   endpoint: environment.authenticationEndpoint,
  //   scopes: [environment.authenticationEndpointScope],
  // },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: ['user.read', 'organization.read.all'],
};
