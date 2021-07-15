import { includedIn, Map, on, Pair, isString } from 'tsfun';
import { Category, RelationDefinition, Document } from '../model';
import { Forest, isTopLevelItemOrChildThereof, Name, Named, Tree } from '../tools';
import { ConfigurationErrors } from './boot/configuration-errors';
import { RelationsUtil } from './relations-utils';


export type RawProjectConfiguration = Pair<Forest<Category>, Array<RelationDefinition>>;


/**
 * ProjectConfiguration maintains the current projects properties.
 * Amongst them is the set of categories for the current project,
 * which ProjectConfiguration provides to its clients.
 *
 * Within a project, objects of the available categories can get created,
 * where every name is a configuration of different fields.
 *
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author F.Z.
 */
export class ProjectConfiguration {

    private categoryForest: Forest<Category>;
    private relations: Array<RelationDefinition>;

    // internal use only, we deliberately don't provide accessor for this any longer
    // use getCategory, getCategoryForest, getCategoriesArray instead
    private categoriesMap: Map<Category>;


    constructor([categories, relations]: RawProjectConfiguration) {

        this.categoryForest = categories;
        this.relations = relations || [];
        this.categoriesMap = Named.arrayToMap(Tree.flatten(categories));
    }


    public update(newProjectConfiguration: ProjectConfiguration) {

        this.categoryForest = newProjectConfiguration.categoryForest;
        this.relations = newProjectConfiguration.relations;
        this.categoriesMap = newProjectConfiguration.categoriesMap; // TODO use find in category forest
    }


    public getAllRelationDefinitions(): Array<RelationDefinition> {

        return this.relations;
    }


    /**
     * @return Category, including children field
     */
    public getCategory(category: Name): Category|undefined;
    public getCategory(document: Document): Category|undefined
    public getCategory(arg) {

        const key = isString(arg) 
            ? (arg as Name) 
            : (arg as Document).resource.category;
        
        return this.categoriesMap[key];
    }


    public getCategoryForest(...selectedTopLevelCategories: Array<Name>): Forest<Category> {

        return selectedTopLevelCategories.length === 0
            ? this.categoryForest
            : this.categoryForest.filter(
                on(Tree.ITEMNAMEPATH, includedIn(selectedTopLevelCategories)));
    }


    public getRelationDefinitionsForDomainCategory(categoryName: string): Array<RelationDefinition> {

        return RelationsUtil.getRelationDefinitions(this.relations, categoryName, false);
    }


    public getRelationDefinitionsForRangeCategory(categoryName: string): Array<RelationDefinition> {

        return RelationsUtil.getRelationDefinitions(this.relations, categoryName, true);
    }


    /**
     * @returns {boolean} True if the given domain category is a valid domain name for a relation definition
     * which has the given range category & name
     */
    public isAllowedRelationDomainCategory(domainCategoryName: string, rangeCategoryName: string,
                                           relationName: string): boolean {

        const relationDefinitions = this.getRelationDefinitionsForRangeCategory(rangeCategoryName);

        for (let relationDefinition of relationDefinitions) {
            if (relationName === relationDefinition.name
                && relationDefinition.domain.indexOf(domainCategoryName) > -1) return true;
        }

        return false;
    }


    public getAllowedRelationDomainCategories(relationName: string,
                                              rangeCategoryName: string): Array<Category> {

        return Tree.flatten(this.categoryForest)
            .filter(category => {
                return this.isAllowedRelationDomainCategory(
                    category.name, rangeCategoryName, relationName
                ) && (!category.parentCategory || !this.isAllowedRelationDomainCategory(
                    category.parentCategory.name, rangeCategoryName, relationName
                ));
            });
    }


    public getAllowedRelationRangeCategories(relationName: string,
                                             domainCategoryName: string): Array<Category> {

        return Tree.flatten(this.categoryForest)
            .filter(category => {
                return this.isAllowedRelationDomainCategory(
                    domainCategoryName, category.name, relationName
                ) && (!category.parentCategory || !this.isAllowedRelationDomainCategory(
                    domainCategoryName, category.parentCategory.name, relationName
                ));
            });
    }


    public getHierarchyParentCategories(categoryName: string): Array<Category> {

        return this.getAllowedRelationRangeCategories('isRecordedIn', categoryName)
            .concat(this.getAllowedRelationRangeCategories('liesWithin', categoryName));
    }


    public isSubcategory(category: Name, superCategoryName: string): boolean {

        if (!this.getCategory(category)) throw [ConfigurationErrors.UNKNOWN_CATEGORY_ERROR, category];
        return isTopLevelItemOrChildThereof(this.categoryForest, category, superCategoryName);
    }
}
