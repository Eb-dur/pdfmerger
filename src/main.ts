
import { PDFDocument } from 'pdf-lib';


async function mergePdf(first : ArrayBuffer, second : ArrayBuffer, secondFileType: string = 'pdf'){
    const firstPdf = await PDFDocument.load(first);
    let secondPdf;
    if (secondFileType == 'pdf') {
        secondPdf = await PDFDocument.load(second);
        const firstPages = await firstPdf.copyPages(secondPdf, secondPdf.getPageIndices());
        firstPages.forEach((page) => {
            firstPdf.addPage(page);
        });
    }
    else if (secondFileType == "jpg" || secondFileType == "jpeg"){
        const jpg = await firstPdf.embedJpg(second);

        const jpgPage = firstPdf.addPage();

        const whichToScale =   jpg.width > jpg.height ?  jpgPage.getWidth() / jpg.width :  jpgPage.getHeight() / jpg.height;
        
        const jpgDims = jpg.scale(whichToScale);

        jpgPage.drawImage(jpg, {
            x: jpgPage.getWidth() / 2 - jpgDims.width / 2,
            y: jpgPage.getHeight() / 2 - jpgDims.height / 2,
            width: jpgDims.width,
            height: jpgDims.height,
        });
    }

    else if (secondFileType == "png"){
        const png = await firstPdf.embedPng(second);

        const pngPage = firstPdf.addPage();

        const whichToScale =   png.width > png.height ? pngPage.getWidth() / png.height : pngPage.getHeight() / png.height;
        
        const pngDims = png.scale(whichToScale);

        pngPage.drawImage(png, {
            x: pngPage.getWidth() / 2 - pngDims.width / 2,
            y: pngPage.getHeight() / 2 - pngDims.height / 2,
            width: pngDims.width,
            height: pngDims.height,
        });
    }
    else {
        return;
    }

    const data = await firstPdf.save();
    const blob = new Blob([data] , {type: 'application/pdf'});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




document.querySelector<HTMLButtonElement>('#convert')?.addEventListener('click', async () => {
    console.log("Här");
    const first = (document.querySelector<HTMLInputElement>('#file') as HTMLInputElement).files?.[0];
    const second = (document.querySelector<HTMLInputElement>('#file2') as HTMLInputElement).files?.[0];
    const secondFileName = (document.querySelector<HTMLInputElement>('#file2') as HTMLInputElement).files?.[0].name;

    const secondFileType = secondFileName?.split('.').pop();
    console.log(secondFileType);
    if (first && second) {
        mergePdf(await first.arrayBuffer(), await second.arrayBuffer(), secondFileType);
    }
});
