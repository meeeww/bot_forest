const Tesseract = require('node-tesseract-ocr');
const fs = require('fs');

async function getTextFromImage(imagePath) {
    const config = {
        lang: 'eng',
        oem: 1,
        psm: 3,
        binary: '"C:/Program Files/Tesseract-OCR/tesseract.exe"',
    };

    try {
        const text = await Tesseract.recognize(imagePath, config);
        return text;
    } catch (error) {
        throw error;
    }
}

const imagePath = './ejemplo8.PNG';

getTextFromImage(imagePath)
    .then(text => {
        const vipText = text.match(/@vip.*?(?=\n|$)/gs);
        if (vipText) {
            const jsonData = vipText.map(line => {
                const match = line.match(/@vip\s*(\S+)/);
                if (match) {
                    const team = match[1];
                    let units, odds;

                    const unitsRegex = /(\d+(\.\d+)?)\s*units/i;
                    const oddsRegex = /@?\s*(-?\d+(\.\d+)?)\s*\/\/\s*(-?\d+(\.\d+)?)/i;

                    const unitsMatch = line.match(unitsRegex);
                    const oddsMatch = line.match(oddsRegex);

                    if (unitsMatch && unitsMatch[1]) {
                        units = parseFloat(unitsMatch[1]);
                    }

                    if (oddsMatch && oddsMatch[3]) {
                        odds = parseFloat(oddsMatch[3]);
                    }

                    return { team, units, odds };
                }
            }).filter(item => item !== undefined);
            fs.writeFile('output.json', JSON.stringify(jsonData, null, 2), err => { //cambia esto a tu ruta que me da pereza
                if (err) throw err;
                console.log('JSON data extracted from the image and saved to output.json file.');
            });
        } else {
            console.log('No text starting with "@vip" found.');
        }
    })
    .catch(error => {
        console.error('Error extracting text:', error);
    });
