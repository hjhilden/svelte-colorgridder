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

export let parseColorInput = (inputcolors, bgColor) => {
    let colors = []
    if (inputcolors.length > 0) {
        const regex = /[\s']/g;
        const inputColorsParsed = inputcolors.replaceAll(regex, "");
        const clist = inputColorsParsed.split(",");
        for (let i = 0; i < clist.length; i++) {
            let c = clist[i];
            if (chroma.valid(c)) {
                colors.push(c);
            }
        }
        if (bgColor !== undefined){     if (chroma.valid(bgColor)) {
            colors.push(bgColor);
        } else {colors.push("#fff")}}
   
    }
    return colors;
}