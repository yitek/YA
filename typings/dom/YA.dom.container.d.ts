import { Dom, Size, Pointer } from "YA.dom";
export declare enum Directions {
    Vertical = 0,
    Horizontal = 1
}
export declare enum ResizerLocations {
    left = 0,
    leftTop = 1,
    top = 2,
    topRight = 3,
    right = 4,
    rightBottom = 5,
    bottom = 6,
    bottomLeft = 7
}
export interface IResizeOpts {
    location: ResizerLocations | ResizerLocations[];
    resizer_size?: number;
    min_width?: number;
    max_width?: number;
    min_height?: number;
    max_height?: number;
}
export declare class Resizeable {
    opts: IResizeOpts;
    target: Dom;
    left_resizer?: Dom;
    leftTop_resizer?: Dom;
    top_resizer?: Dom;
    topRight_resizer: Dom;
    right_resizer: Dom;
    rightBottom_resizer: Dom;
    bottom_resizer: Dom;
    bottomLeft_resizer: Dom;
    resizer_size: number;
    min_width: number;
    max_width: number;
    min_height: number;
    max_height: number;
    _msPos: Pointer;
    _msSize: Size;
    _rszrPos: Pointer;
    constructor(target: any);
    enable(opts: IResizeOpts | boolean): Resizeable;
    _dock(): void;
    _resizeStart(evt: MouseEvent): void;
    _leftResize(evt: MouseEvent): void;
    _leftTopResize(evt: MouseEvent): void;
    _topResize(evt: MouseEvent): void;
    _topRightResize(evt: MouseEvent): void;
    _rightResize(evt: MouseEvent): void;
    _rightBottomResize(evt: MouseEvent): void;
    _bottomResize(evt: MouseEvent): void;
    _bottomLeftResize(evt: MouseEvent): void;
}
export declare class Spliter {
    dom: Dom;
    constructor(target: any);
}
export interface IAnchorOpts {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}
export declare class Anchor {
    target: Dom;
    opts: IAnchorOpts;
    adjust: () => any;
    constructor(target: any);
    capture(opts: IAnchorOpts): void;
    static token: string;
}
