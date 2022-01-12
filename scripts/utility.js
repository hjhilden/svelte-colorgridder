import chroma from "chroma-js";

export function shiftHue(color, hShift=180){
    const hclClr = getHcl(color)
    let hue = (hclClr.h + hShift<360 ? hclClr.h + hShift : 0+ ((hclClr.h + hShift)-360)) 
    return chroma.hcl(hue, hclClr.c, hclClr.l).hex("rgb");

}

export function getHcl(color) {
    let h, c, l;
    [h, c, l] = chroma(color).hcl();
    return { h: h, c: c, l: l };
};