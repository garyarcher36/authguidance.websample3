import {injectable} from 'inversify';
import {BasicApiClaims} from '../entities/BasicApiClaims';

/*
 * A helper object to allow us to inject our claims
 */
@injectable()
export class BasicApiClaimsFactory {

    // TODO: This is messy and needs to be made more intuitive next

    private _claims: BasicApiClaims;

    public constructor() {
        this._claims = new BasicApiClaims();
    }

    public setClaims(claims: BasicApiClaims): void {
        this._claims = claims;
    }

    public getClaims(): BasicApiClaims {

        return this._claims;
    }
}