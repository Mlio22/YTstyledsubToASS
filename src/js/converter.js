/*
    Output dari program ini adalah sub .ass
    yang memiliki maksimal koordinat (X = 384, Y = 288)

    maksimal koordinat tersebut bisa dilihat 
    pada bagian PlayResX dan PlayResY pada awal-awal 
    barisan output file yang memiliki format .ass
    contoh:

    [Script Info]
    ; Script generated by Aegisub 3.2.2
    ; http://www.aegisub.org/
    Title: Default Aegisub file
    ScriptType: v4.00+
    WrapStyle: 0
    ScaledBorderAndShadow: yes
    YCbCr Matrix: None
    PlayResX: 384
    PlayResY: 288

    referensi pemilihan maksimal koordinat 
    terdapat pada file sub.examples/ass/sample.ass.
    sumber asli : https://github.com/arcusmaximus/YTSubConverter/blob/master/sample1.ass

    !   comment ini akan menjelaskan tentang cara kerja fungsi:
    !   getFontSize();
    !   writeEvents();
*/

function nullCheck(para, def) {
    /*
    mengecek nilai apakah null / undefined
    kalo 0 tetap diterima

    fungsi ini tidak perlu digunakan pada jika nilai def = 0 (ga guna masalahnya lol)
    karena null || 0 => 0
    */

    if (para === null || para === undefined) {
        return def;
    } else {
        return para;
    }
}

function getFontType(fontNumber) {
    switch (fontNumber) {
        case 1:
            return "Courier New";
        case 2:
            return "Times New Roman";
        case 3:
            return "DejaVu Sans Mono";
        case 4:
            return "Roboto";
        case 5:
            return "Comic Sans MS";
        case 6:
            return "Monotype Corsiva";
        case 7:
            return "Carrois Gothic SC";
    }
}

function setColor(color = 0, maxNumber = 5) {
    let first = color;
    /* 
    fungsi ini mengubah nilai DEC color menjadi ASS color
    */
    let colorHex = "";
    for (let i = maxNumber; i >= 0; i--) {
        let number = Math.pow(16, i);

        if (color >= number) {
            let result = Math.floor(color / number);
            colorHex += result.toString(16);
            color -= number * result;
        } else {
            colorHex += '0';
        }
    }

    /* 
    HEX color -> ASS color
    HEX (ABCDEF) -> ASS (EFCDAB)
    */

    colorHex = colorHex.substring(4, 6) + colorHex.substring(2, 4) + colorHex.substring(0, 2);

    return `&H${colorHex.toUpperCase()}&`;
}

function convertTime(time) {
    let [jam, menit, detik] = [0, 0, 0];

    if ((time / 60000) >= 60) {
        jam = Math.floor(time / 3600000);
        time -= jam * 3600000;
    }

    if ((time / 1000) >= 60) {
        menit = Math.floor(time / 60000);
        time -= menit * 60000;
    }

    if ((time / 1000) >= 1) {
        detik = Math.floor(time / 1000);
        time -= detik * 1000;
    }

    time += "";
    if (time.length < 3) {
        time = "0" + time;
    }

    /* 
    aegisub hanya menerima MS dengan ketelitian 2 angka
    kalo lebih akan tidak bisa diproses oleh YTsubConverter
    */

    if (time.length == 3) {
        time = time.substring(0, time.length - 1)
    }

    detik += "";
    if (detik.length < 2) {
        detik = "0" + detik;
    }

    menit += "";
    if (menit.length < 2) {
        menit = "0" + menit;
    }

    return `${jam}:${menit}:${detik}.${time}`;
}

function setTime(startMs, durationMs) {
    let endMs = startMs + durationMs;

    return [convertTime(startMs), convertTime(endMs)];
}

function getPos(total, percentage) {
    /*
        fungsi ini menghasilkan koordinat teks pada video aslinya
    */

    let result = ((percentage * total) / 100);
    return result;
}

function getPenStyles(penObj) {

    //  untested Bois
    let of = nullCheck(penObj.ofOffset, 2); //  Offset (subscript/superscript)
    let et = penObj.etEdgeType || 0;
    let ec = nullCheck(penObj.ecEdgeColor, 0);

    // rubyText is still unknown

    // Text Styles 
    let b = penObj.bAttr || 0;
    let i = penObj.iAttr || 0;
    let u = penObj.uAttr || 0;


    // Text Properties
    let sz = nullCheck(penObj.szPenSize);
    let fs = penObj.fsFontStyle || 4;

    /* 
    warna teks pada youtube menggunakan warna decimal
    sedangkan warna teks pada aegisub menggunakan warna ASS

    berikut algoritma yang digunakan pada program ini
    youtube DEC color (0 - 16777215) => HEX color (000000 - FFFFFF)

    dari HEX color ini diubah lagi menjadi ASS color
    HEX(ABCDEF) => ASS(EFCDAB)
    */

    let fc = nullCheck(penObj.fcForeColor, 16777215); //   default : 16777215 rgb(255,255,255)
    let bc = nullCheck(penObj.bcBackColor, 526344); //  default : 526344 rgb(8, 8, 8)

    /* 
    opacity di youtube berkebalikan dengan opacity pada aegisub
    jika opacity youtube dari 0 (transparan) => 254 (Jelas)
    maka opacity aegisub dari 255 (transparan) => 0 (jelas)
    */

    let fo = nullCheck(penObj.foForeAlpha, 254); // default : 254 (paling jelas)
    let bo = nullCheck(penObj.boBackAlpha, 0); // default : 0 (transparan)  


    return {
        "styles": {
            "b": b, //  bold
            "i": i, //  italic
            "u": u, //  underline
        },
        "properties": {
            "sz": sz, //  font size
            "fs": fs, //  font style (tipe font)
            "fc": fc, //  foreground color
            "fo": fo, //  foreground opacity
            "bc": bc, //  background color
            "bo": bo, //  background opacity
            // "ec": ec,
            // "et": et
        }
    }
}

function getWinStyles(wsObj) {
    /*
        justifies(ju) pada youtube:

        1(left)       2(center)       3(right)

        namun dalam praktik, ju ini jarang digunakan selain yang bernilai 2
    */
    let ju = nullCheck(wsObj.juJustifCode, 2);

    // vertical text
    // todo : cari tentang cara penggunaan macro di aegisub
    let pd = wsObj.pdPrintDir || 0;
    let sd = wsObj.sdScrollDir || 0;

    return {
        "align": {
            "ju": ju
        },
        "vertical": {
            // "pd": pd,
            // "sd": sd
        }
    }
}

function getWinPos(wpObj) {

    //  default youtube di tengah bawah
    let ap = nullCheck(wpObj.apPoint, 7);
    let ah = nullCheck(wpObj.ahHorPos, 50);
    let av = nullCheck(wpObj.avVerPos, 100);

    return {
        "ap": ap, //  anchor Point
        "ah": ah, //  horizontal => 0 (kiri) - 100 (kanan)
        "av": av, //  vertical => 0 (atas) - 100 (bawah)
    }
}


function getEvents(eventObj) {
    // semua data Wajib ada!

    let t = eventObj.tStartMs;
    let d = eventObj.dDurationMs;

    let wp = eventObj.wpWinPosId;
    let ws = eventObj.wsWinStyleId;

    // kalo false berarti karaoke atau default
    let p = eventObj.pPenId || 0;

    return {
        "time": {
            "t": t, //  waktu mulai muncul teks
            "d": d //  durasi teks
        },
        "segs": eventObj.segs, //  elemen teks (bisa lebih dari satu sehingga memungkinkan adanya karaoke) 
        "win": {
            "wp": wp, //  elemen winPos yang digunakan
            "ws": ws //  elemen winStyle yang digunakan
        },
        "p": p //  elemen pen yang digunakan
    }
}

function getAlign(number) {

    /*
    tata letak alignment point(ap) di youtube:

    0       1       2

    3       4       5

    6       7       8

    sedangkan alignment pada aegisub:

    7       8       9
    
    4       5       6

    1       2       3
    */

    if (number < 3) {
        return number + 7;
    } else if (number < 6) {
        return number + 1;
    } else if (number < 9) {
        return number - 5;
    }
}

function getFontSize(fs) {
    /*
        berdasarkan penjelasan pada bagian paling awal program
        pada ukuran video (virtual) adalah X = 384 dan Y = 288

        berdasarkan referensi,
        font default(youtube) yang bernilai 100,
        jika diubah ke font aegisub akan sama dengan 15.

        nilai 100 (youtube) => 15 (aegisub) ini
        dijadikan sebagai patokan

        perubahan ukuran font sebesar 1 poin pada aegisub
        setara dengan 26.5 poin pada youtube 

        nilai minimal font youtube adalah 1

        misal:
        233 (youtube)   =>  20 (aegisub)
        10 (youtube)    =>  12 (aegisub)
        1 (youtube)     =>  1 (aegisub) - dipaksa hehe
        

        hal ini menyebabkan ukuran font aegisub yang berukuran
        lebih kecil dari 12 akan menjadi 1 pada youtube default
    */

    if (fs == 100) {
        return 15;
    } else if (fs < 100 && fs != 1) {
        return (15 - Math.floor((100 - fs) / 26.5));
    } else if (fs > 100) {
        return (15 + Math.floor((fs - 100) / 26.5));
    } else if (fs == 1) {
        return 1;
    }
}

function checkOpaque(backgroundOpacity) {
    /*
        pada youtube, tulisan bisa memiliki background atau tidak
        background?? iya yang background kotak itu loh

        opacity dari background itu diatur oleh penStyle ya~

        jadi jika opacity background sama dengan 0,
        maka tidak diperlukan lagi background yang kotak itu
    */
    return backgroundOpacity != 0 ? true : false;
}

function addTag(textObj, pens, winPos, winStyle, videoSize) {

    let startTags = "";
    let endTags = "";

    let p = pens[textObj.p];

    let wp = winPos[textObj.wp];
    let ws = winStyle[textObj.ws];

    // bagian penStyles

    if (p.styles.b) {
        startTags += "\\b1";
        endTags += "\\b0";
    }

    if (p.styles.i) {
        startTags += "\\i1";
        endTags += "\\i0";
    }

    if (p.u) {
        startTags += "\\u1";
        endTags += "\\u0";
    }

    if (p.properties.sz != 100) {
        let sz = getFontSize(p.properties.sz);

        startTags += `\\fs${sz}`;
    }

    if (p.properties.fs != 4) {
        let fs = getFontType(p.properties.fs)
        startTags += `\\fn${fs}`;
    }

    if (p.properties.fc != 16777215) {
        let fc = setColor(p.properties.fc, 5)
        startTags += `\\c${fc}`;
    }

    if (p.properties.fo != 254) {
        let fo = setColor(Math.abs(p.properties.fo - 254), 1)
        startTags += `\\1a${fo}`;
    }

    if (p.properties.bc != 0) {
        let bc = setColor(p.properties.bc, 5);
        startTags += `\\3c${bc}`;
    }

    if (p.properties.bo != 0) {
        let bo = setColor(Math.abs(p.properties.bo - 254), 1)
        startTags += `\\3a${bo}`;
    }

    // todo : cari tentang edge color
    // todo : test offset text on youtube
    // todo : cari tentang ruby

    // bagian winPos
    let al = getAlign(wp.ap);
    let [posX, posY] = [getPos(videoSize[0], wp.ah), getPos(videoSize[1], wp.av)];

    startTags += `\\an${al}\\pos(${posX},${posY})`;

    // bagian winStyle
    // todo : cari tentang vertical text
    // gatau mau isi apa

    // checking karaoke text
    let os = textObj.tO; //  tO = time offset (Ms)

    if (os) {
        os += ""; //  tostring
        os = os.substring(0, os.length - 1)

        startTags += `\\k${os}`;
    }

    startTags = startTags === "" ? "" : `{${startTags}}`;
    endTags = endTags === "" ? "" : `{${endTags}}`;

    return `${startTags}${textObj.text}${endTags}`;
}

function writeEvents(penArray, winPosArray, winStyleArray, eventSegs, eventTime, penNumber = 0, winposNumber = 0, winStyleNumber = 0, karaokeArray = []) {
    const videoSize = [384, 288]; //  sesuai referensi

    let [start, end] = setTime(eventTime.t, eventTime.d);
    let eventSeg = [];
    let karaokeChildIteration = 0;

    eventSegs.forEach(seg => {

        let newWord = "";
        for (let i = 0; i < seg.utf8.length; i++) {

            if (seg.utf8[i].charCodeAt(0) == 10) {
                newWord += "\\N";
            } else {
                newWord += seg.utf8[i];
            }
        }

        eventSeg.push({
            "text": newWord,
            "p": seg.pPenId || penNumber,
            "wp": winposNumber,
            "ws": winStyleNumber,
            "tO": karaokeArray[karaokeChildIteration] || false,
        });

        karaokeChildIteration++;
    });

    let taggedSeg = "";
    let isOpaque = false;

    let style = '';
    eventSeg.forEach(segChild => {

        if (penArray.length == winPosArray.length && winPosArray.length == winPosArray.length && penArray.length == 1) {
            taggedSeg += segChild.text;
            style = "Youtube Default";
        } else {
            isOpaque = checkOpaque(penArray[segChild.p].properties.bo);

            taggedSeg += addTag(segChild, penArray, winPosArray, winStyleArray, videoSize);

            if (isOpaque) {
                style = "Default Opaque";
            } else {
                style = "Default";
            }
        }

        if (taggedSeg.includes("\\k")) {
            style = "Default Karaoke";
        }
    })

    let layer = 0; //  default
    let [name, marginL, marginR, marginV, effect] = ["", 0, 0, 0, ""];

    return `Dialogue: ${layer},${start},${end},${style},${name},${marginL},${marginR},${marginV},${effect},${taggedSeg}\n`

}

// bungkus ke satu fungsi 
function convert(jsonObj) {

    /**
     * mengambil data:
     * pens: data mengenai font, ukuran, jenis, warna, background,dll
     * winstyles : justifikasi, tulisan vertical
     * winPositions : posisi teks, alignment, dll
     * 
     */

    let pens = [];
    jsonObj.pens.forEach(pen => {
        pens.push(getPenStyles(pen));
    });

    let winStyles = [];
    jsonObj.wsWinStyles.forEach(ws => {
        winStyles.push(getWinStyles(ws));
    });

    let winPositions = [];
    jsonObj.wpWinPositions.forEach(wp => {
        winPositions.push(getWinPos(wp));
    });

    let eventRaw = [];
    let isKaraoke = false;

    // mengambil data karaoke (jika ada)

    jsonObj.events.forEach(e => {
        eventRaw.push(getEvents(e));
        if (!isKaraoke) {
            e.segs.forEach(segChild => {
                if (segChild.tOffsetMs) {
                    isKaraoke = true;
                }
            })
        }
    });

    let karaokeRaw = [];
    if (isKaraoke) {
        eventRaw.forEach(event => {
            const karaokeDuration = event.time.d;
            let karaokeItem = [];

            for (let i = 0; i < event.segs.length; i++) {
                let karaokeStart = event.segs[i].tOffsetMs || 0;

                let karaokeEnd;
                if (i == event.segs.length - 1) {
                    karaokeEnd = karaokeDuration;
                } else {
                    karaokeEnd = event.segs[i + 1].tOffsetMs;
                }
                karaokeItem.push(karaokeEnd - karaokeStart);
            }
            karaokeRaw.push(karaokeItem);
        });
    }

    // style pada output

    let stylesSub = `[V4+ Styles]
    Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n`;

    if (pens.length == winPositions.length && winPositions.length == winStyles.length && pens.length == 1) {
        // youtube default
        stylesSub += "Style: Youtube Default,Roboto,15,&H00FFFFFF,&H000000FF,&H3F000000,&HFF000000,0,0,0,0,100,100,0,0,3,2,0,2,10,10,10,1";
    } else {
        // styled subs
        stylesSub += `Style: Default,Roboto,15,&H00FFFFFF,&HFF000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0.5,0,2,10,10,10,1
        Style: Default Opaque,Roboto,15,&H00FFFFFF,&HFF000000,&H00000000,&HFE000000,0,0,0,0,100,100,0,0,3,0.5,0,2,10,10,10,1
        Style: Default Karaoke,Roboto,15,&H00FFFFFF,&HFF000000,&H00000000,&HFE000000,0,0,0,0,100,100,0,0,1,0,0,2,10,10,10,1`;
    }

    // event pada output

    let eventsSub = `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    let karaokeIteration = 0;

    eventRaw.forEach(eventItem => {
        eventsSub += writeEvents(pens, winPositions, winStyles, eventItem.segs, eventItem.time, eventItem.p, eventItem.win.wp, eventItem.win.ws, karaokeRaw[karaokeIteration++]);
    });

    return ([stylesSub, eventsSub]);
}