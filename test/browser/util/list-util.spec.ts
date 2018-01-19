import {bigger, intersect, smaller, subtractTwo, takeUntil, takeWhile} from '../../../app/util/list-util';

/**
 * @author Daniel de Oliveira
 */
export function main() {

    describe('ListUtil', () => {

        it('intersect - intersection',() => {

            expect(intersect([[1,2],[2,3],[2,4]])).toEqual([2]);
        });


        it('intersect - no intersection',() => {

            expect(intersect([[1,2],[3,4],[5,6]])).toEqual([]);
        });


        it('intersect - no intersection where only partial intersection',() => {

            expect(intersect([[1,2],[2,3],[3,4]])).toEqual([]);
        });


        it('subtractTwo',() => {

            expect(subtractTwo([[1,2],[2,2]],[1,2,3,4])).toEqual([3,4]);
        });


        it('take five', () =>

            expect(takeWhile(smaller(20))
            ([7, 9, 10, 13, 17, 20])).toEqual([7, 9, 10, 13, 17])
        );


        it('take none', () =>

            expect(takeWhile(bigger(23))
            ([7, 9, 10, 13, 17, 20])).toEqual([])
        );


        it('take all', () =>

            expect(takeWhile(bigger(1))
            ([7, 9])).toEqual([7, 9])
        );


        it('empty', () =>

            expect(takeWhile(bigger(23))
            ([])).toEqual([])
        );


        it('until: take two', () => {

            expect(takeUntil(bigger(7))
            ([7, 9, 11])).toEqual([7, 9]);
        });


        it('until: take all', () =>

            expect(takeUntil(bigger(13))
            ([7, 9, 11])).toEqual([7, 9, 11])
        );


        it('until: empty', () =>

            expect(takeUntil(bigger(13))
            ([])).toEqual([])
        );
    });
}