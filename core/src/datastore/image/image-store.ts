import { FileStat, FilesystemAdapterInterface } from './filesystem-adapter-interface';
import { ThumbnailGeneratorInterface } from './thumbnail-generator-interface';


export enum ImageVariant {
    ORIGINAL = 'original_image',
    THUMBNAIL = 'thumbnail_image'
}

export interface FileVariantInformation {
    size: number;
    name: ImageVariant;
}

export interface FileInfo {
    deleted: boolean;
    types: ImageVariant[]; // TODO: Deprecate in 4.x
    variants: FileVariantInformation[];
}

export const THUMBNAIL_TARGET_HEIGHT: number = 320;

export const thumbnailDirectory = 'thumbs/';
export const tombstoneSuffix = '.deleted';


/**
 * An image store that uses the file system to store the original images and
 * thumbnails in order to be able to sync them.
 *
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 * @author Daniel De Oliviera
 * @author Simon Hohl
 */
export class ImageStore {

    private absolutePath: string|undefined = undefined;
    private activeProject: string|undefined = undefined;


    constructor(private filesystem: FilesystemAdapterInterface,
                private converter: ThumbnailGeneratorInterface) {}


    public getAbsoluteRootPath = (): string | undefined => this.absolutePath;
    public getActiveProject = (): string | undefined => this.activeProject;


    /**
     * Initializiation function.
     * @param fileSystemBasePath The base path for the project's image store. Will be used to construct absolute 
     * paths for the injected {@link FilesystemAdapterInterface} implementation.
     * @param activeProject the application's active project, will be used as the default project parameter for
     * other functions.
     */
    public async init(fileSystemBasePath: string, activeProject: string) {

        try {
            this.absolutePath = fileSystemBasePath.endsWith('/') ? fileSystemBasePath : fileSystemBasePath + '/';
            this.activeProject = activeProject;
    
            await this.setupDirectories(activeProject);
        } catch (e) {
            this.absolutePath = undefined;
            throw (e);
        }
    }


    /**
     * Store data with the provided id.
     * @param uuid the identifier for the data
     * @param data the binary data to be stored
     * @param project (optional) the project's name, will default to the application's current active project
     * @param type (optional) image's type, will default to {@link ImageVariant.ORIGINAL}.
     */
    public async store(uuid: string, data: Buffer, project: string = this.activeProject, type: ImageVariant = ImageVariant.ORIGINAL) {

        const filePath = this.getFilePath(project, type, uuid);
        
        await this.setupDirectories(project);
        await this.filesystem.writeFile(filePath, data);

        if (type === ImageVariant.ORIGINAL) {
            await this.createThumbnail(uuid, data, project);
        }
    }


    /**
     * Returns the raw Buffer data for the requested image.
     * @param uuid the identifier for the image
     * @param type variant type of the image, see {@link ImageVariant}.
     * @param project (optional) the project's name, will default to the application's current active project
     */
    public async getData(uuid: string, type: ImageVariant, project: string = this.activeProject): Promise<Buffer> {
        
        return await this.readFileSystem(uuid, type, project);
    }


    /**
     * Removes the image from the filesystem and creates an empty tombstone file with
     * the same name plus a {@link tombstoneSuffix}.
     * @param uuid the identifier for the image to be removed
     * @param project (optional) the project's name, will default to the application's current active project
     */
    public async remove(uuid: string, project: string = this.activeProject): Promise<any> {
        
        await Promise.all([
            this.filesystem.remove(
                this.getFilePath(project, ImageVariant.ORIGINAL, uuid)
            ),
            this.filesystem.writeFile(
                this.getFilePath(project, ImageVariant.ORIGINAL, uuid) + tombstoneSuffix, Buffer.from([])
            ),
            this.filesystem.remove(
                this.getFilePath(project, ImageVariant.THUMBNAIL, uuid)
            ),
            this.filesystem.writeFile(
                this.getFilePath(project, ImageVariant.THUMBNAIL, uuid) + tombstoneSuffix, Buffer.from([])
            )
        ]);
    }


    /**
     * Remove the image store data for the given project.
     * @param project the project's name
     */
    public async deleteData(project: string): Promise<any> {

        return this.filesystem.remove(this.getDirectoryPath(project), true);
    }

    
    /**
     * Returns all known images and lists their available variants in a project.
     * @param project the project's name
     * @param types (optional) List of {@link ImageVariant} one is interested in. If an empty list is provided (default), images are not filtered
     * by their variants.
     * @returns Object where each key represents an image UUID and each value is the image's {@link FileInfo}.
     */
    public async getFileInfos(project: string, types: ImageVariant[]): Promise<{ [uuid: string]: FileInfo}> {

        let originalFileStats = [];
        let thumbnailFileStats = [];

        if (types.length === 0) {
            originalFileStats = await this.getFileStats(this.getDirectoryPath(project, ImageVariant.ORIGINAL));
            thumbnailFileStats = await this.getFileStats(this.getDirectoryPath(project, ImageVariant.THUMBNAIL));
        } else {
            if (types.includes(ImageVariant.ORIGINAL)) {
                originalFileStats = await this.getFileStats(this.getDirectoryPath(project, ImageVariant.ORIGINAL));
            } 
            if (types.includes(ImageVariant.THUMBNAIL)) {
                thumbnailFileStats = await this.getFileStats(this.getDirectoryPath(project, ImageVariant.THUMBNAIL));
            }
        }
        
        let result = this.aggregateFileMap({}, originalFileStats, ImageVariant.ORIGINAL);
        result = this.aggregateFileMap(result, thumbnailFileStats, ImageVariant.THUMBNAIL);
        
        return result;
    }


    public async createThumbnail(imageId: string, data: Buffer, project: string) {

        const buffer = await this.converter.generate(data, THUMBNAIL_TARGET_HEIGHT);
        const thumbnailPath = this.getFilePath(project, ImageVariant.THUMBNAIL, imageId);
        await this.filesystem.writeFile(thumbnailPath, buffer);
    }

    private aggregateFileMap(
        aggregated: { [uuid:string]: FileInfo; },
        fileStatList: FileStat[],
        variant: ImageVariant
    ): { [uuid:string]: FileInfo; } {

        for (const stat of fileStatList) {
            let uuid = stat.path;
            let deleted: boolean;
    
            if(uuid.endsWith(tombstoneSuffix)) {
                deleted = true;
                uuid = uuid.replace(tombstoneSuffix, '');
            } else {
                deleted = false;
            }
    
            if (uuid in aggregated) {
                aggregated[uuid].types.push(variant);
                aggregated[uuid].variants.push({
                    size: stat.size, name: variant
                })
            } else {
                aggregated[uuid] = {
                    types: [variant],
                    variants: [{
                        size: stat.size,
                        name: variant
                    }],
                    deleted
                };
            };
        }
        return aggregated;
    }


    private async setupDirectories(project: string) {

        const originalsPath = this.getDirectoryPath(project, ImageVariant.ORIGINAL);
        if (!(await this.filesystem.exists(originalsPath))) {
            await this.filesystem.mkdir(originalsPath, true);
        }

        const thumbnailsPath = this.getDirectoryPath(project, ImageVariant.THUMBNAIL);
        if (!(await this.filesystem.exists(thumbnailsPath))) {
            await this.filesystem.mkdir(thumbnailsPath, true);
        }
    }


    private async getFileStats(path: string): Promise<FileStat[]> {

        const listFiles = await this.filesystem.listFiles(path);

        return listFiles.map((filePath) => {
            // Strip all directories from path so just file names remain.
            filePath.path = filePath.path.slice((path).length);
            return filePath;
        });
    }


    private async readFileSystem(imageId: string, type: ImageVariant, project: string): Promise<Buffer> {

        const path = this.getFilePath(project, type, imageId);

        if (type === ImageVariant.THUMBNAIL && !(await this.filesystem.exists(path))) {
            const originalFilePath = this.getFilePath(project, ImageVariant.ORIGINAL, imageId);
            if (await this.filesystem.exists(originalFilePath)) {
                await this.createThumbnail(imageId, await this.filesystem.readFile(originalFilePath), project);
            }
        }

        return this.filesystem.readFile(path);
    }


    private getDirectoryPath(project: string, type?: ImageVariant): string {

        if (type === undefined || type === ImageVariant.ORIGINAL) {
            return this.absolutePath + project + '/';
        } else {
            return this.absolutePath + project + '/' + thumbnailDirectory;
        }
    }


    private getFilePath(project: string, type: ImageVariant, uuid: string): string {

        return this.getDirectoryPath(project, type) + uuid;
    }
}
