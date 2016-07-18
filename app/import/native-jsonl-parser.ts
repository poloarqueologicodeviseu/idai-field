import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {IdaiFieldDocument} from "../model/idai-field-document";

export interface ParserError extends SyntaxError {
    lineNumber:number;
}

/**
 * @author Sebastian Cuy
 * @author Jan G. Wieners
 */
@Injectable()
export class NativeJsonlParser {

    public parse(content:String):Observable<IdaiFieldDocument> {

        return Observable.create(observer => {

            var lines = content.split('\n');
            var len = lines.length;

            for (var i = 0; i < len; i++) {

                try {
                    observer.next(this.makeDoc(JSON.parse(lines[i])));
                } catch (e) {
                    let error:ParserError = e;
                    error.lineNumber = i + 1;
                    observer.error(error);
                }
            }
            observer.complete();
        });
    }

    private makeDoc(resource) {
        resource['@id'] = resource['id'];
        delete resource['id'];
        resource['type'] = resource['@id'].replace(/\/[^/]*$/, "").replace(/\//, "");
        return {
            "resource": resource,
            "id": resource['@id'].replace(/\/.*\//, "")
        };
    }

}