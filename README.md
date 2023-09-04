# subtitles-translation

> Important: ⚠️ this little program was originally only for my needs, I made it public just because some people wanted. You probably may need to make any necessary adjustments to ensure the tool works properly for your specific use case.


## Problem
I wanted to watch movies in English to improve my language skills, but sometimes there are words I don't know. I had to check them on Google Translate every time I encountered them during the movie.

## My Solution
This tool processes subtitle files in the .srt format and adds translations next to unknown words. It relies on a list of known words (`fam.txt`) and a translation function (`translate(word)`) that you need implement to translate English words into your native language.

## Prerequisites

- Create a file with a list of known words (`fam.txt`).
- Implement the `translate(word)` function to provide translations from English to your native language.
  - https://github.com/adielBm/subtitles-translation/blob/8bf723ceed38ae48814749373c7cc2bc0a680a83/subtitles-translation.js#L16
- Make any necessary adjustments to ensure the tool works correctly for your specific use case.

In the future, when your vocabulary get enlarged, you'll need Insert new words into your list as you learn them. Use the command `subtitles-translation insert "newWord1, newWord2, newWord3, ..."` to update your known words list.


## Installation

Inside this folder, run:

```shell
npm install
```

and then

```
npm install -g
```

## Usage

### add-translation [file.srt]

the input file `en-subtitle.srt`

```srt
...

4
00:00:06,949 --> 00:00:08,309
going on some_unfamiliar_word now.

...
```
and run 
```
subtitles-translation add-translation en-subtitle.srt
```

then it outputs a file `translated-en-subtitle.srt`:

```srt
...

4
00:00:06,949 --> 00:00:08,309
going on some_unfamiliar_word <font size="10px" color="#d4d2d2"> (translation of some_unfamiliar_word)</font> now.

...
```

### insert [list of words]

for insert new words to `fam.txt`

```
subtitles-translation insert "newWord1, newWord2, newWord3, ..."`.
```
