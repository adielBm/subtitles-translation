#! /usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nlp from 'compromise';
import srtParser2 from "srt-parser-2";
import cliProgress from 'cli-progress';
import { program } from 'commander';
import pluralize from 'pluralize-esm';

const parser = new srtParser2();
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const FAM_FILE = path.join(currentDirectory, 'fam.txt') // fam.txt is list of familiar words 

export function translate(word) {

    // TODO 

    // if there is not exist translation 
    return null
}

export function addTranslationsToText(text, excludeWords = []) {

    excludeWords = excludeWords.map(word => word.trim().toLowerCase())
    // Split the input text into an array of words
    const words = text.split(/\s+/);

    // Create a new array to store the modified words
    const modifiedWords = [];

    for (let word of words) {

        let lowerWord = word.toLowerCase()

        const lastNonAlphabetCharacter = getLastNonAlphabetCharacter(lowerWord)
        if (lastNonAlphabetCharacter) {
            lowerWord = removeLastNonAlphabetCharacter(lowerWord)
        }

        if (lowerWord.length <= 2 || isIncludesApostrophe(lowerWord) || excludeWords.includes(lowerWord) || isFam(lowerWord)) {
            modifiedWords.push(word);
            continue;
        }

        let translation = translate(lowerWord);

        if (translation == null) {
            modifiedWords.push(word);
            continue;
        }

        modifiedWords.push(`${word}<font size="10px" color="#d4d2d2"> (${translation})</font>`);
    }

    return modifiedWords.join(' ');
}

export function getLastNonAlphabetCharacter(str) {
    // Use a regular expression to match the last non-alphabet character
    const match = str.match(/[^a-zA-Z]$/);

    // If a match is found, return the matched character, otherwise return null
    if (match) {
        return match[0];
    } else {
        return null;
    }
}

export function removeLastNonAlphabetCharacter(str) {
    // Use a regular expression to match the last non-alphabet character
    const match = str.match(/[^a-zA-Z]$/);

    // If a match is found, remove the last character and return the modified string
    if (match) {
        return str.slice(0, -1);
    } else {
        // If no non-alphabet character is found at the end, return the original string
        return str;
    }
}

/**
 * check if a word is fam.
 * - if the word is SUP or CMPR it checks for the base adj form of it.
 * - if the word is VERB it checks for the infinitive form of it.   
 */
export function isFam(word) {
    word = word.toLowerCase().trim()
    const fam = getFam()
    return (fam.includes(word) || fam.includes(toBaseForm(word)))
}

export function getFam() {
    return fileToArray(FAM_FILE)
}

export function fileToArray(inputFileName) {
    const fileContent = fs.readFileSync(inputFileName, 'utf-8');
    let lines = fileContent.split(/\r\n|\n|\r/)
    lines = lines.map(val => val.trim())
    return Array.from(new Set(lines));
}

export function toBaseForm(word) {
    if (isAdjective(word) && (word.endsWith('est') || word.endsWith('er'))) {
        return toBaseFormAdjective(word)
    }

    if (isVerb(word) && (word.endsWith('ing') || word.endsWith('s') || word.endsWith('ed'))) {
        return toInfinitive(word)
    }

    if (word.endsWith('s')) {
        return toSingular(word)
    }
    return word
}

/**
 * convert comparative / superlative into base form of adjective
 * @param {*} word 
 */
export function toBaseFormAdjective(word) {
    return nlp(word)?.adjectives()?.conjugate()[0]?.Adjective
}

export function isAdjective(word) {
    if (nlp(word).adjectives().text()) {
        return true
    }
    return false
}

export function isVerb(word) {
    if (nlp(word).verbs().text()) {
        return true
    }
    return false
}

export function toSingular(word) {
    if (word.endsWith('s')) {
        const singular = pluralize.singular(word)
        return singular != '' ? singular : word
    } else {
        return word
    }
}

export function toInfinitive(word, defaultReturn = word) {

    let infinitive = word

    if (word.endsWith('ing')) {
        infinitive = nlp(word).verbs().toInfinitive().text()
        if (!infinitive.endsWith('ing') && infinitive != '') {
            return infinitive
        }
    }

    if (word.endsWith('ed')) {
        infinitive = nlp(word).verbs().toInfinitive().text()
        if (!infinitive.endsWith('ed')) {
            return infinitive
        }
    }

    if (word.endsWith('s')) {
        infinitive = nlp(word).verbs().toInfinitive().text()
        if (!infinitive.endsWith('s')) {
            return infinitive
        }
    }

    return defaultReturn
}

export function isIncludesApostrophe(word) {
    return word.includes("’") || word.includes("'")
}



export function insert(words) {
    const file = FAM_FILE
    if (file) {
        words = words.split(',').map(word => word.trim())
        arrayToFile(fileToArray(file).concat(words), file)
        console.log('Inserted: ' + words)
    }
}

export function arrayToFile(array, outputFileName) {
    array = array.map(el => el.toLowerCase())
    array = removeDuplicates(array)
    fs.writeFileSync(outputFileName, array.sort().join('\n'));
}

// Function to remove duplicates from an array
export function removeDuplicates(array) {
    return Array.from(new Set(array));
}




program
    .name('subtitles-translation-cli')
    .description('CLI to subtitles translation')
    .version('1.0.0');

program.command('add-translation')
    .description('add translation to subtitle')
    .argument('<string>', '.srt file of subtitles')
    .option('-e, --exclude-words <string>', 'A list of words that should not be translated.')
    .action(async (filename, options) => {

        try {
            if (!filename.endsWith('srt')) {
                console.error('the file need to be .srt format');
                process.exit()
            }

            const srt = fs.readFileSync(`${filename}`, 'utf-8');

            // Parse the SRT content
            let srt_array = parser.fromSrt(srt);

            // create a new progress bar instance and use shades_classic theme
            const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            // Process the srt_array...
            console.log('Process the subtitle...');
            bar1.start(srt_array.length - 1, 0);
            srt_array = srt_array.map((entity, i) => {
                entity.text = addTranslationsToText(entity.text, options.excludeWords?.split(',') || [])
                bar1.update(i);
                return entity
            })
            bar1.stop();


            // Convert the processed array back to SRT string.
            const srt_string = parser.toSrt(srt_array);

            console.log('Write to the file...');
            fs.writeFileSync(`translated-${filename}`, srt_string, 'utf-8');

            console.log('Subtitle processing complete.');

            process.exit()
        } catch (error) {
            console.error('Error:', error.message);
            console.error(error);
            process.exit()
        }
    });



program.command('insert')
    .description('Insert word(s) to fam list')
    .argument('<string>', 'word(s) to insert, seperated with commas')
    .action((str) => {
        insert(str)
        process.exit()
    });


program.parse();
