import chroma from "chroma-js";

import { APCAcontrast, sRGBtoY, colorParsley } from "apca-w3";


export function clamp (x, min, max) {
    return Math.min(Math.max(x, min), max)
}

export function wrap (x, min, max) {
    let range = max-min
    let mod = x % range
    return mod + min

}

export function radians (degrees){
    return degrees * Math.PI / 180
}

export const getContrastLc = (textColor, backgroundColor) => {
    return APCAcontrast(
        sRGBtoY(colorParsley(textColor)),
        sRGBtoY(colorParsley(backgroundColor))
    );
};

export const  invertTextColor = (textColor, backgroundColor) => {
 // check for chroma.js color object 
     if (backgroundColor?._rgb) backgroundColor = backgroundColor.hex()
    let Lc = getContrastLc(textColor, backgroundColor);
    if (Lc < 45) {
        return "white";
    } else return "black";
    
};

export function shiftHcl(color, hShift=180, cShift=0, lShift=0){
    const hclClr = getHcl(color)
    let hue = wrap(hclClr.h + hShift, 0, 360)
    let c = clamp(hclClr.c + cShift, 0, 100)
    let l = clamp(hclClr.l + lShift, 0, 100)
    // console.log('input')
    // console.table(hclClr)
    // console.log('output')
    // console.table(hue, c, l)
    return chroma.hcl(hue, c, l).hex("rgb");

}

export function getHcl(color) {
    let h, c, l;

 let colorParsed
 if (chroma.valid(color)){ 
colorParsed =  chroma(color)
} else {
 console.log("faulty color")
 colorParsed = chroma('fff')
} 
[h, c, l] = colorParsed.hcl();
return { h: h, c: c, l: l };
}


export let parseColorInput = (inputcolors, bgColor) => {
    let colors = []
    if (inputcolors?.length > 0) {
        const regex = /[\s'"]/g;
        const inputColorsParsed = inputcolors.replaceAll(regex, "");
        const clist = inputColorsParsed.split(",");
        for (let i = 0; i < clist.length; i++) {
            let c = clist[i];
            if (chroma.valid(c)) {
                colors.push(c);
            } else {colors.push('blue')} // as fallback
        }
        if (bgColor !== undefined){     if (chroma.valid(bgColor)) {
            colors.push(bgColor);
        } else {colors.push("#fff")}}
   
    }
    return colors;
}

export function clickToCopy() {
    console.log("copyString")

    const copyString = this.querySelector("div").outerHTML;
    // setClipboard(copyString);
}

export function setClipboard(text) {
    var type = "text/plain";
    var blob = new Blob([text], { type });
    var data = [new ClipboardItem({ [type]: blob })];
    var size = blob.size;
    navigator.clipboard.write(data).then(
        function () {
            /* success */
            console.log(`copied to clipboard, ${size}kb`);
        },
        function () {
            /* failure */
        }
    );
}
