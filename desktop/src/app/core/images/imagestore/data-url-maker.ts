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
export class DataUrlMaker {

    public static blackImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';


    public async makeDataUrl(data: Blob): Promise<string> {

        return new Promise<string>(resolve => {

            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(data);
        });
    }


    public static revokeBlobUrl(revokeUrl: string) {

        URL.revokeObjectURL(revokeUrl);
    }
}
