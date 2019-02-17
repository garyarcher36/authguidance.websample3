import * as cors from 'cors';
import {Application, NextFunction, Request, Response} from 'express';
import * as fs from 'fs';
import * as https from 'https';
import {Container} from 'inversify';
import {interfaces, InversifyExpressServer} from 'inversify-express-utils';
import * as path from 'path';
import * as url from 'url';
import {Configuration} from '../configuration/configuration';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {AuthorizationHandler} from './authorizationHandler';
import {CustomAuthProvider} from './customAuthProvider';

/*
 * The relative path to web files
 */
const WEB_FILES_ROOT = '../../..';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServer {

    /*
     * Our dependencies
     */
    private _apiConfig: Configuration;
    private _container: Container;
    private _expressApp: Application;

    /*
     * Receive the configuration and the container
     */
    public constructor(apiConfig: Configuration, container: Container) {
        this._apiConfig = apiConfig;
        this._container = container;
    }

    /*
     * Configure behaviour before starting the server
     */
    public configure(): void {

        // TODO
        // { rootPath: apiPrefix }

        // Create the server. which will wire up Express controller routes from container definitions
        const server = new InversifyExpressServer(this._container, null, null, null, CustomAuthProvider);

        /*const container = this._container;
        const contextBindingMiddleware = (req, res, next)  => {
            if (container.isBound('httpcontext')) {
                console.log('is bound');
                container.rebind<Request>('httpcontext').toSelf().inRequestScope();
            } else {
                console.log('is not bound');
                container.bind<Request>('httpcontext').toSelf().inRequestScope();
            }

            next();
         };*/

        // Configure API and web behaviour
        server.setConfig((app: Application) => {
            this._configureApiMiddleware(app);
            this._configureWebStaticContent(app);
            // app.use(contextBindingMiddleware);
        });

        // Add an API error handler last, which will also catch unhandled promise rejections
        server.setErrorConfig((app) => {
            const errorHandler = new UnhandledExceptionHandler();
            app.use('/api/*', errorHandler.handleException);
        });

        // Create the express app
        this._expressApp = server.build();
    }

    /*
     * Start listening for requests
     */
    public start(): void {

        // Use the web URL to determine the port
        const webUrl = url.parse(this._apiConfig.app.trustedOrigins[0]);

        // Calculate the port from the URL
        let port = 443;
        if (webUrl.port) {
            port = Number(webUrl.port);
        }

        // Node does not support certificate stores so we need to load a certificate file from disk
        const sslOptions = {
            pfx: fs.readFileSync(`certs/${this._apiConfig.app.sslCertificateFileName}`),
            passphrase: this._apiConfig.app.sslCertificatePassword,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(sslOptions, this._expressApp);
        httpsServer.listen(port, () => {
            console.log(`Server is listening on HTTPS port ${port}`);
        });
    }

    /*
     * Set up API middleware
     */
    private _configureApiMiddleware(expressApp: Application): void {

        // Deal with Express unhandled promise exceptions during async operations
        // https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
        const catcher = ( fn: any) =>
            (request: Request, response: Response, next: NextFunction) => {

                Promise
                    .resolve(fn(request, response, next))
                    .catch((e) => {
                        const handler = new UnhandledExceptionHandler();
                        handler.handleException(e, request, response, next);
                        return next;
                    });
        };

        // We don't want API requests to be cached unless explicitly designed for caching
        expressApp.set('etag', false);

        // Allow cross origin requests from the SPA
        const corsOptions = { origin: this._apiConfig.app.trustedOrigins };
        expressApp.use('/api/*', cors(corsOptions));

        // TODO: Use fluent configuration for the authorization middleware

        // All API requests are authorized first
        const authorizationHandler = new AuthorizationHandler(this._apiConfig);
        authorizationHandler.initialize();
        expressApp.use('/api/*', catcher(authorizationHandler.authorizeRequest));
    }

    /*
     * Handle requests for static web content
     */
    private _configureWebStaticContent(expressApp: Application): void {

        expressApp.get('/spa/*', this._getWebResource);
        expressApp.get('/spa', this._getWebRootResource);
        expressApp.get('/favicon.ico', this._getFavicon);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebRootResource(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/favicon.ico`);
        response.sendFile(webFilePath);
    }
}