import { Injectable } from '@angular/core';

@Injectable()
/**
 * This tool is used to get binary data from a
 * mediastore and put them as blobs into html img tags.
 *
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class BlobMaker {

    public static blackImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';


    public makeBlobUrl(data: any): string {

        return URL.createObjectURL(new Blob([data]));
    }


    public static revokeBlobUrl(revokeUrl: string) {

        URL.revokeObjectURL(revokeUrl);
    }
}
