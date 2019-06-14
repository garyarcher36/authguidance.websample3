import {Container} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {ICustomClaimsProvider} from '../extensibility/icustomClaimsProvider';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {BaseAuthenticationFilter} from '../security/baseAuthenticationFilter';
import {ClaimsCache} from '../security/claimsCache';
import {ClaimsMiddleware} from '../security/claimsMiddleware';
import {ClaimsSupplier} from '../security/claimsSupplier';
import {CoreApiClaims} from '../security/coreApiClaims';
import {IssuerMetadata} from '../security/issuerMetadata';
import {OAuthAuthenticationFilter} from '../security/oauthAuthenticationFilter';
import {OAuthAuthenticator} from '../security/oauthAuthenticator';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';
import {FrameworkInitialiser} from './frameworkInitialiser';

/*
 * A builder style class for configuring OAuth security
 */
export class OAuthAuthenticationFilterBuilder<TClaims extends CoreApiClaims> {

    // Injected dependencies
    private readonly _container: Container;
    private readonly _configuration: FrameworkConfiguration;
    private readonly _loggerFactory: ILoggerFactory;

    // Properties set via builder methods
    private _claimsSupplier!: () => TClaims;
    private _customClaimsProviderSupplier!: () => ICustomClaimsProvider<TClaims>;
    private _unsecuredPaths: string[];

    /*
     * Receive dependencies
     */
    public constructor(framework: FrameworkInitialiser) {

        // Get properties from the framework
        [this._container, this._configuration, this._loggerFactory] = framework.getProperties();

        // Initialise other properties
        this._unsecuredPaths = [];
    }

    /*
     * Consumers of the builder class must provide a constructor function for creating claims
     */
    public withClaimsSupplier(construct: new () => TClaims): OAuthAuthenticationFilterBuilder<TClaims> {
        this._claimsSupplier = () => new construct();
        return this;
    }

    /*
     * Consumers of the builder class can provide a constructor function for injecting custom claims
     */
    public withCustomClaimsProviderSupplier(construct: new () => ICustomClaimsProvider<TClaims>)
            : OAuthAuthenticationFilterBuilder<TClaims> {

        this._customClaimsProviderSupplier = () => new construct();
        return this;
    }

    /*
     * Configure any API paths that return unsecured content, such as /api/unsecured
     */
    public addUnsecuredPath(unsecuredPath: string): OAuthAuthenticationFilterBuilder<TClaims> {
        this._unsecuredPaths.push(unsecuredPath.toLowerCase());
        return this;
    }

    /*
     * Build and return the filter
     */
    public async build(): Promise<BaseAuthenticationFilter> {

        // Load OAuth metadata if the API is configured to use OAuth security
        const issuerMetadata = new IssuerMetadata(this._configuration);
        if (this._configuration.oauth) {
            await issuerMetadata.load();
        }

        // Create the cache used to store claims results after authentication processing
        // Use a constructor function as the first parameter, as required by TypeScript generics
        const claimsCache = ClaimsCache.createInstance<ClaimsCache<TClaims>>(
            ClaimsCache,
            this._configuration,
            this._loggerFactory);

        // Create an injectable object to enable the framework to create claims objects of a concrete type at runtime
        const claimsSupplier = ClaimsSupplier.createInstance<ClaimsSupplier<TClaims>, TClaims>(
            ClaimsSupplier,
            this._claimsSupplier,
            this._customClaimsProviderSupplier);

        // Register OAuth related dependencies
        this._registerDependencies(issuerMetadata, claimsCache, claimsSupplier);

        // Create an object to access the child container per request via the HTTP context
        return new OAuthAuthenticationFilter<TClaims>(this._unsecuredPaths, new HttpContextAccessor());
    }

    /*
     * Register dependencies when authentication is configured
     */
    private _registerDependencies(
        issuerMetadata: IssuerMetadata,
        claimsCache: ClaimsCache<TClaims>,
        claimsSupplier: ClaimsSupplier<TClaims>): void {

        /*** SINGLETONS ***/

        // Register security objects
        this._container.bind<IssuerMetadata>(FRAMEWORKTYPES.IssuerMetadata)
                       .toConstantValue(issuerMetadata);
        this._container.bind<ClaimsCache<TClaims>>(FRAMEWORKTYPES.ClaimsCache)
                       .toConstantValue(claimsCache);
        this._container.bind<ClaimsSupplier<TClaims>>(FRAMEWORKTYPES.ClaimsSupplier)
                       .toConstantValue(claimsSupplier);

        /*** PER REQUEST OBJECTS ***/

        // Register the authenticator and the claims middleware
        this._container.bind<OAuthAuthenticator>(FRAMEWORKTYPES.OAuthAuthenticator)
                       .to(OAuthAuthenticator).inRequestScope();
        this._container.bind<ClaimsMiddleware<TClaims>>(FRAMEWORKTYPES.ClaimsMiddleware)
                       .to(ClaimsMiddleware).inRequestScope();

        // Register dummy values that are overridden by middleware later
        this._container.bind<TClaims>(FRAMEWORKTYPES.ApiClaims)
                       .toConstantValue({} as any);
    }
}
