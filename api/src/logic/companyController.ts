import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {CompanyRepository} from './companyRepository';

/*
 * Our API controller runs after claims handling has completed
 */
@controller('/api/companies')
export class CompanyController extends BaseHttpController {

    /*
     * The repository is injected
     */
    private _repository: CompanyRepository;

    /*
     * Receive dependencies
     */
    public constructor(repository: CompanyRepository) {
        super();
        this._repository = repository;
    }

    /*
     * Return the list of companies
     */
    @httpGet('/')
     public async getCompanyList(): Promise<Company[]> {
        return await this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    @httpGet('/:id/transactions')
     public async getCompanyTransactions(@requestParam('id') id: string): Promise<CompanyTransactions> {

        // TODO: Report errors properly
        const idValue = parseInt(id, 10);
        return await this._repository.getCompanyTransactions(idValue);
    }
}
