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

/**
 * Define the path to the 'fam.txt' file, which contains a list of familiar words.
 * @type {string}
 */
const FAM_FILE = path.join(currentDirectory, 'fam.txt') 

/**
 * Translates a word.
 *
 * @param {string} word - The word to be translated.
 * @returns {string|null} The translated word or null if no translation is available.
 */
function translate(word) {

    // TODO
    if (word == 'unknown_word') {
        return 'The Translation of unknown_word'
    }

    if (word == 'known_word') {
        return 'The Translation of known_word'
    }
    // if there is not exist translation 
    return null
}

/**
 * Adds translations to the input text.
 *
 * @param {string} text - The input text to which translations will be added.
 * @param {string[]} excludeWords - An array of words to exclude from translation.
 * @returns {string} The text with translations added.
 */
function addTranslationsToText(text, excludeWords = []) {

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

/**
 * Gets the last non-alphabet character in a string.
 *
 * @param {string} str - The input string.
 * @returns {string|null} The last non-alphabet character or null if none is found.
 */
function getLastNonAlphabetCharacter(str) {
    // Use a regular expression to match the last non-alphabet character
    const match = str.match(/[^a-zA-Z]$/);

    // If a match is found, return the matched character, otherwise return null
    if (match) {
        return match[0];
    } else {
        return null;
    }
}

/**
 * Removes the last non-alphabet character in a string.
 *
 * @param {string} str - The input string.
 * @returns {string} The modified string with the last non-alphabet character removed.
 */
function removeLastNonAlphabetCharacter(str) {
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
 * Checks if a word is familiar.
 *
 * @param {string} word - The word to check for familiarity.
 * @returns {boolean} True if the word is familiar, false otherwise.
 */
function isFam(word) {
    word = word.toLowerCase().trim()
    const fam = getFam()
    return (fam.includes(word) || fam.includes(toBaseForm(word)))
}


/**
 * Gets the list of familiar words from a file.
 *
 * @returns {string[]} An array of familiar words.
 */
function getFam() {
    return fileToArray(FAM_FILE)
}

/**
 * Converts a file's of word seperated by \r\n to an array of strings.
 *
 * @param {string} inputFileName - The name of the input file.
 * @returns {string[]} An array of strings from the file's content.
 */
function fileToArray(inputFileName) {
    const fileContent = fs.readFileSync(inputFileName, 'utf-8');
    let lines = fileContent.split(/\r\n|\n|\r/)
    lines = lines.map(val => val.trim())
    return Array.from(new Set(lines));
}

/**
 * Converts a word to its base form.
 *
 * @param {string} word - The word to convert.
 * @returns {string} The base form of the word.
 */
function toBaseForm(word) {
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
 * Converts a comparative or superlative adjective to its base form.
 *
 * @param {string} word - The adjective to convert.
 * @returns {string} The base form of the adjective.
 */
function toBaseFormAdjective(word) {
    return nlp(word)?.adjectives()?.conjugate()[0]?.Adjective
}

/**
 * Checks if a word is an adjective.
 *
 * @param {string} word - The word to check.
 * @returns {boolean} True if the word is an adjective, false otherwise.
 */
function isAdjective(word) {
    if (nlp(word).adjectives().text()) {
        return true
    }
    return false
}

/**
 * Checks if a word is a verb.
 *
 * @param {string} word - The word to check.
 * @returns {boolean} True if the word is a verb, false otherwise.
 */

function isVerb(word) {
    if (nlp(word).verbs().text()) {
        return true
    }
    return false
}

/**
 * Converts a word to its singular form.
 *
 * @param {string} word - The word to convert.
 * @returns {string} The singular form of the word.
 */
function toSingular(word) {
    if (word.endsWith('s')) {
        const singular = pluralize.singular(word)
        return singular != '' ? singular : word
    } else {
        return word
    }
}

/**
 * Converts a word to its infinitive form.
 *
 * @param {string} word - The word to convert.
 * @param {string} defaultReturn - The default value to return if no infinitive form is found.
 * @returns {string} The infinitive form of the word or the default value.
 */
function toInfinitive(word, defaultReturn = word) {

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

/**
 * Checks if a word contains an apostrophe.
 *
 * @param {string} word - The word to check.
 * @returns {boolean} True if the word contains an apostrophe, false otherwise.
 */
function isIncludesApostrophe(word) {
    return word.includes("’") || word.includes("'")
}

/**
 * Inserts words into the familiar words list.
 *
 * @param {string} words - The words to insert, separated by commas.
 */
function insert(words) {
    const file = FAM_FILE
    if (file) {
        words = words.split(',').map(word => word.trim())
        arrayToFile(fileToArray(file).concat(words), file)
        console.log('Inserted: ' + words)
    }
}

/**
 * Writes an array of strings to a file, removing duplicates.
 *
 * @param {string[]} array - The array of strings to write to the file.
 * @param {string} outputFileName - The name of the output file.
 */
function arrayToFile(array, outputFileName) {
    array = array.map(el => el.toLowerCase())
    array = removeDuplicates(array)
    fs.writeFileSync(outputFileName, array.sort().join('\n'));
}

/**
 * Removes duplicates from an array of strings.
 *
 * @param {string[]} array - The array of strings to remove duplicates from.
 * @returns {string[]} An array with duplicates removed.
 */
function removeDuplicates(array) {
    return Array.from(new Set(array));
}


program
    .name('subtitles-translation-cli')
    .description('A command-line tool for adding translation to subtitles.')
    .version('1.0.0');

program.command('add-translation')
    .description('Adds translations to a subtitle file.')
    .argument('<string>', 'The path to the .srt subtitle file.')
    .option('-e, --exclude-words <string>', 'A comma-separated list of words to exclude from translation.')
    .action(async (filename, options) => {

        try {
            if (!filename.endsWith('srt')) {
                console.error('The file must be in .srt format.');
                process.exit()
            }

            const srt = fs.readFileSync(`${filename}`, 'utf-8');

            // Parse the SRT content
            let srt_array = parser.fromSrt(srt);

            // create a new progress bar instance and use shades_classic theme
            const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            // Process the srt_array...
            console.log('Processing the subtitles...');
            bar1.start(srt_array.length - 1, 0);
            srt_array = srt_array.map((entity, i) => {
                entity.text = addTranslationsToText(entity.text, options.excludeWords?.split(',') || [])
                bar1.update(i);
                return entity
            })
            bar1.stop();


            // Convert the processed array back to SRT string.
            const srt_string = parser.toSrt(srt_array);

            console.log('Writing to the file...');
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
    .description('Inserts word(s) into the familiar words list.')
    .argument('<string>', 'Word(s) to insert, separated by commas.')
    .action((str) => {
        insert(str)
        process.exit()
    });


program.parse();
