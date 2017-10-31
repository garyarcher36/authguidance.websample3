'use strict';
import * as $ from 'jquery';

/*
 * A helper class to ensure that any OAuth trace or error messages are routed to the main window and not the frame
 */
export default class IFrameWindowHelper {

    /*
     * Get the main window item
     */
    static getMainWindowElement(itemName: string): any {
        if (IFrameWindowHelper.isIFrameOperation()) {
            return (<any>window.parent).$(itemName);
        }
        else {
            return $(itemName);
        }
    }

    /*
     * Detect whether a particular operation is running on the silent renew iframe
     */
    static isIFrameOperation(): boolean {
        return (window.parent && window !== window.parent);
    }
}