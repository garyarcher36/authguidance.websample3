import {BasicApiClaims} from '../entities/BasicApiClaims';
import {CoreApiClaims} from '../plumbing/oauth/coreApiClaims';
import {CustomClaimsRepository} from '../plumbing/oauth/customClaimsRepository';

/*
 * An example of including domain specific authorization rules during claims lookup
 */
export class AuthorizationRulesRepository implements CustomClaimsRepository {

    /*
     * The interface supports returning results based on the user id from the token
     * This might involve a database lookup or a call to another service
     */
    public async addCustomClaims(accessToken: string, claims: CoreApiClaims): Promise<void> {

        // Any attempts to access data for company 3 will result in an unauthorized error
        (claims as BasicApiClaims).accountsCovered = [1, 2, 4];
    }
}
