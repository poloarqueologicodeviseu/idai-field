import { includedIn, on, isString, flow, filter, remove, is, Map } from 'tsfun';
import { filterTrees, Forest, isTopLevelItemOrChildThereof, Name, Named, removeTrees, Tree } from '../tools';
import { ConfigurationErrors } from '../configuration/boot/configuration-errors';
import { Category } from '../model/configuration/category';
import { CategoryForm } from '../model/configuration/category-form';
import { Relation } from '../model/configuration/relation';
import { Field } from '../model/configuration/field';
import { Document } from '../model/document';


export interface RawProjectConfiguration {
    forms: Forest<CategoryForm>;
    categories: Map<Category>;
    relations: Array<Relation>;
    commonFields: Map<Field>;
};

const TYPE_CATALOG = 'TypeCatalog';
const TYPE = 'Type';


/**
 * For naming of document types (for example "ConcreteField"-XYZ, "Image"-XYZ)
 * see document.ts
 * 
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author F.Z.
 */
export class ProjectConfiguration {

    private forms: Forest<CategoryForm>;
    private categories: Map<Category>;
    private relations: Array<Relation>;
    private commonFields: Map<Field>;


    constructor(rawConfiguration: RawProjectConfiguration) {

        this.forms = rawConfiguration.forms;
        this.categories = rawConfiguration.categories;
        this.relations = rawConfiguration.relations || [];
        this.commonFields = rawConfiguration.commonFields;
    }


    public update(newProjectConfiguration: ProjectConfiguration) {

        this.forms = newProjectConfiguration.forms;
        this.categories = newProjectConfiguration.categories;
        this.relations = newProjectConfiguration.relations;
        this.commonFields = newProjectConfiguration.commonFields;
    }


    // TODO allow also to pass in multiple Names and receive multiple Categories
    /**
     * @return Category, including children field
     */
    public getCategory(category: Name): CategoryForm|undefined;
    public getCategory(document: Document): CategoryForm|undefined
    public getCategory(arg) {

        const name = isString(arg) 
            ? (arg as Name) 
            : (arg as Document).resource.category;
        
        return Tree.find(this.forms, category => category.name === name)?.item;
    }


    public getCategories(...selectedTopLevelCategories: Array<Name>): Forest<CategoryForm> {

        return selectedTopLevelCategories.length === 0
            ? this.forms
            : this.forms.filter(
                on(Tree.ITEMNAMEPATH, includedIn(selectedTopLevelCategories)));
    }


    public getHierarchyParentCategories(categoryName: string): Array<CategoryForm> {

        return this.getAllowedRelationRangeCategories('isRecordedIn', categoryName)
            .concat(this.getAllowedRelationRangeCategories('liesWithin', categoryName));
    }


    public isSubcategory(category: Name, superCategoryName: string): boolean {

        if (!this.getCategory(category)) throw [ConfigurationErrors.UNKNOWN_CATEGORY_ERROR, category];
        return isTopLevelItemOrChildThereof(this.forms, category, superCategoryName);
    }


    public isGeometryCategory(category: Name): boolean {

        return !isTopLevelItemOrChildThereof(this.forms, category,
            'Image', 'Inscription', 'Type', 'TypeCatalog', 'Project');
    }


    public getRegularCategories(): Array<CategoryForm> {

        return flow(this.forms,
            removeTrees('Place', 'Project', TYPE_CATALOG, TYPE, 'Image', 'Operation'),
            Tree.flatten
        );
    }


    public getConcreteFieldCategories(): Array<CategoryForm> {

        return flow(this.forms,
            removeTrees('Image', 'Project', TYPE_CATALOG, TYPE),
            Tree.flatten
        );
    }


    public getFieldCategories(): Array<CategoryForm> {

        return flow(this.forms,
            removeTrees('Image', 'Project'),
            Tree.flatten
        );
    }


    public getOverviewCategories(): Array<CategoryForm> {

        return flow(this.forms,
            filterTrees('Operation', 'Place'),
            Tree.flatten
        );
    }


    public getConreteOverviewCategories(): Array<CategoryForm> {

        return flow(this.forms,
            filterTrees('Operation', 'Place'),
            Tree.flatten,
            remove(Named.onName(is('Operation')))
        ) as any;
    }


    public getOverviewToplevelCategories(): Array<CategoryForm> {

        return flow(this.forms,
            filterTrees('Operation', 'Place'),
            Tree.flatten,
            filter(Named.onName(includedIn(['Operation', 'Place']))) as any
        );
    }


    public getTypeCategories(): Array<CategoryForm> {

        return flow(this.forms,
            filterTrees(TYPE, TYPE_CATALOG),
            Tree.flatten
        );
    }


    public getImageCategories(): Array<CategoryForm> {

        return flow(this.forms,
            filterTrees('Image'),
            Tree.flatten
        );
    }


    public getFeatureCategories(): Array<CategoryForm> {

        return this.getSuperCategories('Feature');
    }


    public getOperationCategories(): Array<CategoryForm> {

        return this.getSuperCategories('Operation');
    }


    public getRelations(): Array<Relation> {

        return this.relations;
    }


    public getRelationsForDomainCategory(categoryName: string): Array<Relation> {

        return Relation.getRelations(this.relations, categoryName, false);
    }


    public getRelationsForRangeCategory(categoryName: string): Array<Relation> {

        return Relation.getRelations(this.relations, categoryName, true);
    }


    public isAllowedRelationDomainCategory(domainCategory: Name, 
                                           rangeCategory: Name,
                                           relation: Name): boolean {

        return Relation.isAllowedRelationDomainCategory(
            this.relations, domainCategory, rangeCategory, relation
        );
    }


    public getAllowedRelationDomainCategories(relationName: string,
                                              rangeCategoryName: string): Array<CategoryForm> {

        return Tree.flatten(this.forms)
            .filter(category => {
                return Relation.isAllowedRelationDomainCategory(
                    this.relations, category.name, rangeCategoryName, relationName
                ) && (!category.parentCategory || !Relation.isAllowedRelationDomainCategory(
                    this.relations, category.parentCategory.name, rangeCategoryName, relationName
                ));
            });
    }


    public getAllowedRelationRangeCategories(relationName: string,
                                             domainCategoryName: string): Array<CategoryForm> {

        return Tree.flatten(this.forms)
            .filter(category => {
                return Relation.isAllowedRelationDomainCategory(
                    this.relations, domainCategoryName, category.name, relationName
                ) && (!category.parentCategory || !Relation.isAllowedRelationDomainCategory(
                    this.relations, domainCategoryName, category.parentCategory.name, relationName
                ));
            });
    }


    private getSuperCategories(superCategoryName: string) {

        return flow(
            this.forms,
            filterTrees(superCategoryName),
            Tree.flatten);
    }
}
