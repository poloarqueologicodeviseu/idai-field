import { Labelled, Named } from '../tools/named';
import { FieldDefinition } from './field-definition';
import { HierarchicalRelations, ImageRelations, PositionRelations, TimeRelations, TypeRelations } from './relation-constants';
import { RelationDefinition } from './relation-definition';


export module Groups {

    export const STEM = 'stem';
    export const DIMENSION = 'dimension';
    export const TIME = 'time';
    export const POSITION = 'position';
    export const IDENTIFICATION = 'identification';
    export const PROPERTIES = 'properties';
    export const PARENT = 'parent';
    export const CHILD = 'child';

    export const DEFAULT_ORDER = [
        'stem',
        'identification',
        'parent',
        'child',
        'dimension',
        'position',
        'time'
    ];

    export function getGroupNameForRelation(relationName: string): string|undefined {

        if (HierarchicalRelations.ALL.includes(relationName)
                || ImageRelations.ALL.includes(relationName)) {
            return STEM;
        } else if (TimeRelations.ALL.includes(relationName)) {
            return TIME;
        } else if (PositionRelations.ALL.includes(relationName)) {
            return POSITION;
        } else if (TypeRelations.ALL.includes(relationName)) {
            return IDENTIFICATION;
        } else {
            return undefined;
        }
    }
}


export interface Group extends BaseGroup {

    fields: Array<FieldDefinition>;
    relations: Array<RelationDefinition>;
}


export interface BaseGroup extends Named, Labelled {

    fields: Array<any>;
    relations: Array<any>;
}


export module Group {

    export const FIELDS = 'fields';
    export const RELATIONS = 'relations';

    export function create(name: string) {

        return { name: name, fields: [], relations: [] };
    }
}
