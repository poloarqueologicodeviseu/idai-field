import { LayoutRectangle } from 'react-native';
import { Matrix4, processTransform3d } from 'react-native-redash';
import { defineWorldCoordinateSystem } from '../cs-transform';
/**
 * Transforms screen coordinate system to world cs
 * and takes care of the different y axis directions of the coordinate systems
 * ^
 * |y       ---
 * |    to  |
 * ---      |y
 * world     screen
 * @param yCoord
 * @param viewBoxHeight
 * @returns correctly transformed y coordinate
 */
export const screenToWorldTransformationMatrix = (screen: LayoutRectangle): Matrix4 => {
    
    const worldCS = defineWorldCoordinateSystem();
    const scaleX = worldCS.width / screen.width;
    const scaleY = worldCS.height / screen.height;

    return processTransform3d([{ translateY: worldCS.height }, { scaleY: -1 * scaleY }, { scaleX }]);
};