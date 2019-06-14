/*
 * Export framework public types but not internal classes
 */

import {FrameworkConfiguration} from './configuration/frameworkConfiguration';

import {FRAMEWORKTYPES} from './configuration/frameworkTypes';
import {ApiError} from './errors/apiError';
import {ClientError} from './errors/clientError';
import {ExceptionHelper} from './errors/exceptionHelper';
import {UnhandledPromiseRejectionHandler} from './errors/unhandledPromiseRejectionHandler';
import {DefaultCustomClaimsProvider} from './extensibility/defaultCustomClaimsProvider';
import {IClientError} from './extensibility/iclientError';
import {ICustomClaimsProvider} from './extensibility/icustomClaimsProvider';
import {ILogEntry} from './logging/ilogEntry';
import {ILoggerFactory} from './logging/iloggerFactory';
import {IPerformanceBreakdown} from './logging/iperformanceBreakdown';
import {LoggerFactory} from './logging/loggerFactory';
import {LoggerMiddleware} from './logging/loggerMiddleware';
import {BaseAuthenticationFilter} from './security/baseAuthenticationFilter';
import {CoreApiClaims} from './security/coreApiClaims';
import {CustomPrincipal} from './security/customPrincipal';
import {FrameworkInitialiser} from './startup/frameworkInitialiser';
import {HeaderAuthenticationFilterBuilder} from './startup/headerAuthenticationFilterBuilder';
import {OAuthAuthenticationFilterBuilder} from './startup/oauthAuthenticationFilterBuilder';
import {CustomHeaderMiddleware} from './utilities/customHeaderMiddleware';
import {DebugProxyAgent} from './utilities/debugProxyAgent';
import {HttpContextAccessor} from './utilities/httpContextAccessor';
import {IDisposable} from './utilities/idisposable';
import {using} from './utilities/using';

export {
    FrameworkConfiguration,
    FrameworkInitialiser,
    FRAMEWORKTYPES,
    ApiError,
    ClientError,
    ExceptionHelper,
    UnhandledPromiseRejectionHandler,
    DefaultCustomClaimsProvider,
    IClientError,
    ICustomClaimsProvider,
    ILogEntry,
    ILoggerFactory,
    IPerformanceBreakdown,
    LoggerFactory,
    LoggerMiddleware,
    BaseAuthenticationFilter,
    HeaderAuthenticationFilterBuilder,
    OAuthAuthenticationFilterBuilder,
    CoreApiClaims,
    CustomPrincipal,
    CustomHeaderMiddleware,
    DebugProxyAgent,
    HttpContextAccessor,
    IDisposable,
    using,
};
